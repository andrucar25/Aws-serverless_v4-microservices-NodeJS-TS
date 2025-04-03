import {DynamoDBClient, ScanCommand, ScanCommandInput} from "@aws-sdk/client-dynamodb";

const dynamoDbClient = new DynamoDBClient({region: 'us-east-1'});

export const getApprovedProducts = async () => {
  try {
    const tableName = process.env.DYNAMO_TABLE;

    const scanCommandInput: ScanCommandInput = {
      TableName: tableName,
      FilterExpression: "isApproved = :trueVal",
      ExpressionAttributeValues: {
        ":trueVal": {BOOL: true}
      }
    };

    const scanCommand = new ScanCommand(scanCommandInput);
    const {Items} = await dynamoDbClient.send(scanCommand)    

    return {
      statusCode: 200,
      body: JSON.stringify({response: Items || [], error: []})
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({response: [], error: [error.message]})
    }
  }
}