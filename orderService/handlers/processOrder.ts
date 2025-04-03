import { DynamoDBClient, PutItemCommand, PutItemCommandInput, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { SQSEvent, APIGatewayProxyResult } from 'aws-lambda';
import {SQSClient, SendMessageCommand, SendMessageCommandInput} from '@aws-sdk/client-sqs';

const dynamoDbClient = new DynamoDBClient({region: 'us-east-1'});
const tableName = process.env.DYNAMO_TABLE;

export const processOrder = async (event: SQSEvent): Promise<APIGatewayProxyResult> => {
  try{
    for(const record of event.Records) {
      const orderData = JSON.parse(record.body);
      const {id, productId, quantity, email, status, createdAt} = orderData;

      const inputPutItem: PutItemCommandInput = {
        TableName: tableName,
        Item: {
          id: {S: id},
          productId: {S: productId},
          quantity: {N: String(quantity)},
          email: {S: email},
          status: {S: status},
          createdAt: {S: createdAt}
        }
      }
      const itemCommand = new PutItemCommand(inputPutItem);
      await dynamoDbClient.send(itemCommand);
    }
    
    return {
      statusCode: 201,
      body: JSON.stringify({response: [{message: "order processed successfully"}], error: []})
    }

  } catch(error) {
    return {
      statusCode: 500,
      body: JSON.stringify({response: [], error: [error.message]})
    }
  }
}