const AWS = require('aws-sdk');
const ecs = new AWS.ECS({ region: 'ap-south-1' });
const s3 = new AWS.S3();

const resolutions = [
  { height: 360, bandwidth: 500, width: 640 },
  { height: 480, bandwidth: 1000, width: 854 },
  { height: 720, bandwidth: 2500, width: 1280 },
  { height: 1080, bandwidth: 5000, width: 1920 },
];

module.exports.handler = async (event) => {
  const eventBody = JSON.parse(event.Records[0].body);
  const FILE_KEY = eventBody.Records[0].s3.object.key;
  const INPUT_BUCKET = eventBody.Records[0].s3.bucket.name;
  const isShort = FILE_KEY.startsWith('uploads/shorts');
  if (!FILE_KEY || !INPUT_BUCKET) {
    console.error('Missing S3 file key or bucket name');
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid input data' }),
    };
  }

  const fileExists = await checkS3ObjectExists(INPUT_BUCKET, FILE_KEY);

  if (!fileExists) {
    console.log(`File ${FILE_KEY} does not exist in the bucket ${INPUT_BUCKET}, skipping processing.`);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: `File ${FILE_KEY} not found in S3, skipping processing.` }),
    };
  }

  const splittedFileKeyArray = FILE_KEY.split(".")[0].split("_");
  const maxHeight = splittedFileKeyArray[splittedFileKeyArray.length - 1];
  const maxWidth = splittedFileKeyArray[splittedFileKeyArray.length - 2];

  console.log(`File Key: ${FILE_KEY}, Input Bucket: ${INPUT_BUCKET}`);
  console.log(`Max Height: ${maxHeight}, Max Width: ${maxWidth}`);

  try {
    // console.log('Starting transcription task...');
    // const transcriptionPromise = ecs.runTask(getTranscriptionParams(FILE_KEY, INPUT_BUCKET, maxHeight, maxWidth, isShort)).promise().then(
    //   (data) => {
    //     const taskArn = data.tasks[0]?.taskArn;
    //     if (taskArn) {
    //       console.log(`Transcription task started successfully with task ARN: ${taskArn}`);
    //     } else {
    //       console.error('Failed to retrieve task ARN for transcription task: REASON:', data.failures[0]?.reason);
    //     }
    //   },
    //   (err) => {
    //     console.error('Error starting transcription task:', err);
    //     throw err;
    //   }
    // );
    // Check if it is a Short (portrait mode: width < height)
    if (isShort) {
      console.log(`Video is a Short, starting transcoding task with the uploaded resolution...`);
      const shortParams = getTranscodingParams(parseInt(maxHeight), 2500, parseInt(maxWidth), FILE_KEY, INPUT_BUCKET);
      const shortTranscodingPromise = ecs.runTask(shortParams).promise().then(
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
      await Promise.all([transcriptionPromise, shortTranscodingPromise]);
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
          INPUT_BUCKET
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
      // await Promise.all([transcriptionPromise, ...transcodingPromises]);
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
const getTranscriptionParams = (fileKey, inputBucket, maxHeight, maxWidth, isShort = false) => ({
  cluster: process.env.CLUSTER_ARN,
  taskDefinition: process.env.TRANSCRIBING_TASK_ARN,
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
        name: 'transcribing-container',
        environment: [
          { name: 'FILE_KEY', value: fileKey },
          { name: 'INPUT_BUCKET', value: inputBucket },
          { name: 'HEIGHT', value: maxHeight },
          { name: 'WIDTH', value: maxWidth },
          { name: 'IS_SHORT', value: isShort ? 1 : 0 },
        ],
      },
    ],
  },
});
const checkS3ObjectExists = async (bucket, key) => {
  try {
    const params = { Bucket: bucket, Key: key };
    await s3.headObject(params).promise();
    console.log(`Object ${key} exists in ${bucket}`);
    return true;
  } catch (err) {
    if (err.code === 'NotFound') {
      console.error(`Object ${key} does not exist in ${bucket}`);
    } else {
      console.error(`Error checking if object exists: ${err.message}`);
    }
    return false;
  }
};

const getTranscodingParams = (height, bandwidth, width, fileKey, inputBucket) => ({
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
        ],
      },
    ],
  },
});