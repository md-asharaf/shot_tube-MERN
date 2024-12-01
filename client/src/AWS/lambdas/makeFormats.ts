import AWS from "aws-sdk";
const ecs = new AWS.ECS({
  region: "ap-south-1",
});

// Spins the ECS Fargate container for video format maker (transcoding)
module.exports.handler = async (event: any) => {
  console.log("ENV: ", process.env);
  const eventBody = JSON.parse(event.Records[0].body);
  console.log("EVENT BODY: ", eventBody);
  const FILE_KEY = eventBody.Records[0].s3.object.key;
  const INPUT_BUCKET = eventBody.Records[0].s3.bucket.name;
  console.log("FILE_KEY: ", FILE_KEY);
  console.log("INPUT_BUCKET: ", INPUT_BUCKET);
  const resolutions = [
    {
      quality: "360",
      bandwidth: "500",
      scale: "640:360",
    },
    {
      quality: "480",
      bandwidth: "1000",
      scale: "854:480",
    },
    {
      quality: "720",
      bandwidth: "2500",
      scale: "1280:720",
    },
    {
      quality: "1080",
      bandwidth: "5000",
      scale: "1920:1080",
    },
  ];

  // Function to get transcoding parameters
  const getTranscodingParams = (quality: string, bandwidth: string, scale: string) => ({
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
              name: "QUALITY",
              value: quality,
            },
            {
              name: "BANDWIDTH",
              value: bandwidth,
            },
            {
              name: "SCALE",
              value: scale,
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
          ],
        },
      ],
    },
  };

  try {
    // Start ECS tasks for each resolution asynchronously
    const transcodingPromises = resolutions.map((resolution) => {
      const params = getTranscodingParams(
        resolution.quality,
        resolution.bandwidth,
        resolution.scale
      );
      console.log(`Starting transcoding task for ${resolution.quality} resolution...`);
      return ecs.runTask(params).promise();  // Return the promise for ECS task
    });

    // Start transcription task asynchronously
    console.log("Starting transcription task...");
    const transcriptionPromise = ecs.runTask(transcribingParams).promise();

    // Wait for all transcoding tasks and transcription task to complete
    await Promise.all([transcriptionPromise,...transcodingPromises]);

    console.log("All transcoding and transcription tasks have been started.");

  } catch (error) {
    console.log("Error starting ECS tasks: ", error);
    throw error;
  }
};