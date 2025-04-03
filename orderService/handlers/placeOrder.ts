import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {SQSClient, SendMessageCommand, SendMessageCommandInput} from '@aws-sdk/client-sqs';
import { v4 as uuidv4 } from 'uuid';

const dynamoDbClient = new DynamoDBClient({region: 'us-east-1'});
const sqsCLient = new SQSClient({region: 'us-east-1'});

export const placeOrder = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  try{
    const body = JSON.parse(event.body || "{}");
    const email = event.requestContext.authorizer?.jwt.claims.email;
    const {id, quantity} = body;

    if(!id || !quantity || !email){
      return {
        statusCode: 400,
        body: JSON.stringify({response: [], error: ["Fields are required"]})
      }
    }

    // GET product from product table

    const {Item: product} = await dynamoDbClient.send(new GetItemCommand({
      TableName: "Products", 
      Key: {
        id: { S: id }
      }
    }))
  
    
    if(!product) {
      return {
        statusCode: 404,
        body: JSON.stringify({response: [], error: ['Product not found or not approved']})
      }
    }

    const availableStock = parseInt(product.quantity.N || "0");
    if(availableStock < quantity){
      return {
        statusCode: 400,
        body: JSON.stringify({response: [], error: ['Insuficient stock available']})
      }
    }

    //if everything is ok then the order is created and sended to SQS to be processed by other lambda
    const orderId = uuidv4();
    const orderPayload = {
      id: orderId,
      productId: id,
      quantity,
      email,
      status: "pending",
      createdAt: new Date().toISOString()
    }

    //send order to SQS
    const messageInput: SendMessageCommandInput = {
      QueueUrl: process.env.SQS_QUEUE_URL,
      MessageBody: JSON.stringify(orderPayload)
    }

    const messageCommand = new SendMessageCommand(messageInput);
    await sqsCLient.send(messageCommand);

    
    return {
      statusCode: 201,
      body: JSON.stringify({response: [{message: "order placed successfully", orderId}], error: []})
    }

  } catch(error) {
    return {
      statusCode: 500,
      body: JSON.stringify({response: [], error: [error.message]})
    }
  }
}