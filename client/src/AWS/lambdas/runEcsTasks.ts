import AWS from "aws-sdk";
const ecs = new AWS.ECS({
  region: "ap-south-1",
});
const resolutions = [
  {
    height: 360,
    bandwidth: 500,
    width: 640,
  },
  {
    height: 480,
    bandwidth: 1000,
    width: 854,
  },
  {
    height: 720,
    bandwidth: 2500,
    width: 1280,
  },
  {
    height: 1080,
    bandwidth: 5000,
    width: 1920,
  },
];
// Spins the ECS Fargate container for video format maker (transcoding)
module.exports.handler = async (event: any) => {
  const eventBody = JSON.parse(event.Records[0].body);
  const FILE_KEY:string = eventBody.Records[0].s3.object.key;
  const INPUT_BUCKET = eventBody.Records[0].s3.bucket.name;
  const splittedFileKeyArray= FILE_KEY.split(".")[0].split("_");
  const maxHeight = splittedFileKeyArray[splittedFileKeyArray.length - 1];
  const maxWidth = splittedFileKeyArray[splittedFileKeyArray.length - 2];
  // Function to get transcoding parameters
  const getTranscodingParams = (height: number, bandwidth: number, width: number) => ({
    cluster: process.env.CLUSTER_ARN,
    taskDefinition: process.env.TRANSCODING_TASK_ARN,
    count: 1,
    launchType: "FARGATE",
    networkConfiguration: {
      awsvpcConfiguration: {
        subnets: [process.env.SUBNET_ID],
        assignPublicIp: "ENABLED",
      },
    },
    overrides: {
      containerOverrides: [
        {
          name: "transcoding-container",
          environment: [
            {
              name: "FILE_KEY",
              value: FILE_KEY,
            },
            {
              name: "INPUT_BUCKET",
              value: INPUT_BUCKET,
            },
            {
              name: "HEIGHT",
              value: height,
            },
            {
              name: "BANDWIDTH",
              value: bandwidth,
            },
            {
              name: "WIDTH",
              value: width,
            },
          ],
        },
      ],
    },
  });

  // Function to get transcription parameters
  const transcribingParams = {
    cluster: process.env.CLUSTER_ARN,
    taskDefinition: process.env.TRANSCRIBING_TASK_ARN,
    count: 1,
    launchType: "FARGATE",
    networkConfiguration: {
      awsvpcConfiguration: {
        subnets: [process.env.SUBNET_ID],
        assignPublicIp: "ENABLED",
      },
    },
    overrides: {
      containerOverrides: [
        {
          name: "transcribing-container",
          environment: [
            {
              name: "FILE_KEY",
              value: FILE_KEY,
            },
            {
              name: "INPUT_BUCKET",
              value: INPUT_BUCKET,
            },
            {
              name: "HEIGHT",
              value: maxHeight,
            },
            {
              name: "WIDTH",
              value: maxWidth,
            }
          ],
        },
      ],
    },
  };

  try {
    // Start ECS tasks for each resolution asynchronously
    const filteredResolutions = resolutions.filter((resolution) => resolution.height <= parseInt(maxHeight));
    const transcodingPromises = filteredResolutions.map((resolution) => {
      const params = getTranscodingParams(
        resolution.height,
        resolution.bandwidth,
        resolution.width
      );
      console.log(`Starting transcoding task for ${resolution.width}X${resolution.height} resolution...`);
      return ecs.runTask(params).promise();  // Return the promise for ECS task
    });

    // Start transcription task asynchronously
    console.log("Starting transcription task...");
    const transcriptionPromise = ecs.runTask(transcribingParams).promise();

    // Wait for all transcoding tasks and transcription task to complete
    await Promise.all([transcriptionPromise,...transcodingPromises]);
    console.log("All transcoding and transcription tasks have been started.");

  } catch (error) {
    console.error("Error starting ECS tasks: ", error);
    throw error;
  }
};
