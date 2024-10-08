import AWS from "aws-sdk";
const ecs= new AWS.ECS({
    region: "ap-south-1"
})

module.exports.handler= async (event:any) =>{
    console.log("ENV: ", process.env);
    const eventBody= JSON.parse(event.Records[0].body);
    console.log("EVENT BODY: ",eventBody);
    const FILE_KEY=eventBody.Records[0].s3.object.key;
    const INPUT_BUCKET=eventBody.Records[0].s3.bucket.name;
    const params= {
        cluster: process.env.CLUSTER_ARN,
        taskDefinition: process.env.TASK_ARN,
        count: 1,
        launchType: "FARGATE",
        networkConfiguration: {
            awsvpcConfiguration: {
                subnets: [process.env.SUBNET_ID],
                assignPublicIp: "ENABLED"
            }
        },
        overrides: {
            containerOverrides: [
                {
                    name: "video-format-maker-image",
                    environment: [
                        {
                            name: "FILE_KEY",
                            value: FILE_KEY
                        },
                        {
                            name: "INPUT_BUCKET",
                            value: INPUT_BUCKET
                        },
                        {
                            name: "OUTPUT_BUCKET",
                            value: process.env.OUTPUT_BUCKET
                        }
                    ]
                }
            ]
        }
    }
    try{
        const data= await ecs.runTask(params).promise();
        console.log("Task started, DATA: ", data);
        return data;
    }catch(error){
        console.log("Error starting task: ", error);
    }
}