import {DynamoDBClient, PutItemCommand, PutItemCommandInput} from '@aws-sdk/client-dynamodb';

const dynamoDbClient = new DynamoDBClient({region: "us-east-1"})

export const confirmUpload = async (event) => {
  try {
    const tableName = process.env.DYNAMO_TABLE;
    const bucketName = process.env.BUCKET_NAME;

    const record = event.Records[0]
    const fileName = record.s3.object.key;
    const imageUrl = `https://${bucketName}.s3.amazonaws.com/${fileName}`
  
    const inputPut: PutItemCommandInput = {
      TableName: tableName,
      Item: {
        fileName: {S: fileName},
        imageUrl: {S: imageUrl},
        uploadedAt: {S: new Date().toISOString()}
      }
    }

    const commandPut = new PutItemCommand(inputPut);
    await dynamoDbClient.send(commandPut);

    return {
      statusCode: 200,
      body: JSON.stringify({message: "File uploaded & confirmed"})
    }
  } catch(error) {
    return {
      statusCode: 500,
      body: JSON.stringify({error: error.message})
    }
  }
} 