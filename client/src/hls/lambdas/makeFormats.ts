import AWS from "aws-sdk";
const ecs= new AWS.ECS({
    region: "ap-south-1",
    credentials:{
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
        accessKeyId: process.env.ACCESS_KEY_ID
    }
})

module.exports.handler= async (event:any) =>{
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
                            value: event.Records[0].s3.object.key
                        },
                        {
                            name: "INPUT_BUCKET",
                            value: event.Records[0].s3.bucket.name
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
        return data;
    }catch(error){
        console.log("Error starting task: ", error);
    }
}