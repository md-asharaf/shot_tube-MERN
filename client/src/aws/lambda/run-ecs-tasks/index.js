const AWS = require('aws-sdk');
const ecs = new AWS.ECS({ region: 'ap-south-1' });
const s3 = new AWS.S3({ region: 'ap-south-1' });
const resolutions = [
  { height: 360, bandwidth: 500, width: 640 },
  { height: 480, bandwidth: 1000, width: 854 },
  { height: 720, bandwidth: 2500, width: 1280 },
  { height: 1080, bandwidth: 5000, width: 1920 },
];
async function getVideoMetadata(Bucket,Key) {
  const params = {
      Bucket,
      Key,
  };
  const data = await s3.headObject(params).promise();
  console.log("Metadata:", data.Metadata);
  return data.Metadata;
}

module.exports.handler = async (event) => {
  const eventBody = JSON.parse(event.Records[0].body);
  const FILE_KEY = eventBody.Records[0].s3.object.key;
  const INPUT_BUCKET = eventBody.Records[0].s3.bucket.name;
  const isShort = FILE_KEY.startsWith('uploads/shorts');
  const splittedFileKeyArray = FILE_KEY.split(".")[0].split("_");
  const maxHeight = splittedFileKeyArray[splittedFileKeyArray.length - 1];
  const maxWidth = splittedFileKeyArray[splittedFileKeyArray.length - 2];
  const metadata = await getVideoMetadata(INPUT_BUCKET,FILE_KEY);
  const id = isShort ? metadata.shortid : metadata.videoid;

  console.log({
    FILE_KEY,
    INPUT_BUCKET,
    isShort,
    maxHeight,
    maxWidth,
    id,
  })
  console.log('Starting ECS tasks...');
  try {
    if (isShort) {
      console.log(`Video is a Short, starting transcoding task with the uploaded resolution...`);
      const shortParams = getTranscodingParams(parseInt(maxHeight), 2500, parseInt(maxWidth), FILE_KEY, INPUT_BUCKET, id);
      await ecs.runTask(shortParams).promise().then(
        (data) => {
          const taskArn = data.tasks[0]?.taskArn;
          if (taskArn) {
            console.log(`Transcoding task for Short started successfully with task ARN: ${taskArn}`);
          } else {
            console.error('Failed to retrieve task ARN for Short');
          }
        },
        (err) => {
          console.error('Error starting transcoding task for Short:', err);
          throw err;
        }
      );
    } else {
      console.log('Video is a regular video, starting transcoding tasks for multiple resolutions...');
      const filteredResolutions = resolutions.filter(
        (resolution) => resolution.height <= parseInt(maxHeight)
      );

      const transcodingPromises = filteredResolutions.map((resolution) => {
        const params = getTranscodingParams(
          resolution.height,
          resolution.bandwidth,
          resolution.width,
          FILE_KEY,
          INPUT_BUCKET,
          id
        );
        console.log(
          `Starting transcoding task for ${resolution.width}X${resolution.height} resolution...`
        );
        return ecs.runTask(params).promise().then(
          (data) => {
            const taskArn = data.tasks[0]?.taskArn;
            if (taskArn) {
              console.log(
                `Transcoding task for ${resolution.width}X${resolution.height} started successfully with task ARN: ${taskArn}`
              );
            } else {
              console.error(
                `Failed to retrieve task ARN for ${resolution.width}X${resolution.height} REASON:`, data.failures[0]?.reason
              );
            }
          },
          (err) => {
            console.error(
              `Error starting transcoding task for ${resolution.width}X${resolution.height}:`,
              err
            );
            throw err;
          }
        );
      });
      await Promise.all(transcodingPromises);
    }
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'ECS tasks triggered successfully.',
      }),
    };
  } catch (error) {
    console.error('Error starting ECS tasks: ', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to trigger ECS tasks.',
        error: error.message,
      }),
    };
  }
};

const getTranscodingParams = (height, bandwidth, width, fileKey, inputBucket, id) => ({
  cluster: process.env.CLUSTER_ARN,
  taskDefinition: process.env.TRANSCODING_TASK_ARN,
  count: 1,
  launchType: 'FARGATE',
  networkConfiguration: {
    awsvpcConfiguration: {
      subnets: [process.env.SUBNET_ID],
      assignPublicIp: 'ENABLED',
    },
  },
  overrides: {
    containerOverrides: [
      {
        name: 'transcoding-container',
        environment: [
          { name: 'FILE_KEY', value: fileKey },
          { name: 'INPUT_BUCKET', value: inputBucket },
          { name: 'HEIGHT', value: height.toString() },
          { name: 'BANDWIDTH', value: bandwidth.toString() },
          { name: 'WIDTH', value: width.toString() },
          { name: 'ID', value: id.toString() },
        ],
      },
    ],
  },
});