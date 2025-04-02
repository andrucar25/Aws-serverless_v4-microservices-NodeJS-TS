import {DynamoDBClient, ScanCommand, DeleteItemCommand, DeleteItemCommandInput, ScanCommandInput} from "@aws-sdk/client-dynamodb";
import {SNSClient, PublishCommand, PublishCommandInput} from "@aws-sdk/client-sns";

const dynamoDbClient = new DynamoDBClient({region: "us-east-1"});
const snsClient = new SNSClient({region: "us-east-1"});

export const cleanupProducts = async () => {
  try {
    const tableName = process.env.DYNAMO_TABLE;
    const snsTopicArn = process.env.SNS_TOPIC_ARN;

    //calculate timestamp for one hour ago to filter outdated products
    // const oneHourAgo = new Date(Date.now()-60 *60*1000).toISOString();
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString(); 

    const scanCommand: ScanCommandInput = {
      TableName: tableName,
      FilterExpression: "createdAt < :tenMinutesAgo AND attribute_not_exists(imageUrl)",
      ExpressionAttributeValues: {
        ":tenMinutesAgo": {S: tenMinutesAgo} //Bind the timestamp for filtering
      }
    }

    const scanCommandInput = new ScanCommand(scanCommand);
    const {Items} = await dynamoDbClient.send(scanCommandInput);

    if(!Items || Items.length === 0){
      return {
        statusCode: 200,
        body: JSON.stringify({message: "No products found for cleanup"})
      };
    }

    //initialize counter to track number of deleted products
    let deletedCount = 0;
    
    for(const item of Items) {
      const deleteCommandInput: DeleteItemCommandInput = {
        TableName: tableName,
        Key: {id: item.id}
      }

      const deleteItemCommand = new DeleteItemCommand(deleteCommandInput);
      await dynamoDbClient.send(deleteItemCommand);
      deletedCount++
    }

    //Send an SNS notification after deleting products
    const snsMessage = `Cleanup completed. Deleted ${deletedCount} outdated products`

    const publishCommandInput: PublishCommandInput = {
      TopicArn: snsTopicArn,
      Message: snsMessage,
      Subject: "Category cleanup notification"
    }
    const command = new PublishCommand(publishCommandInput);
    await snsClient.send(command)

    return {
      statusCode: 200,
      body: JSON.stringify({message: "Clean up completed", deletedCount})
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({message: [], error: error.message})
    };
  }
}
