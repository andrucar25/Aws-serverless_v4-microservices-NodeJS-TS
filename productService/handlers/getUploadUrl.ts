import {S3Client, PutObjectCommand} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import { DynamoDBClient, PutItemCommand, PutItemCommandInput } from '@aws-sdk/client-dynamodb';
import {v4 as v4uuid} from 'uuid';

const s3Client = new S3Client({region: 'us-east-1'});
const dynamoDbClient = new DynamoDBClient({region: 'us-east-1'});

export const getUploadUrl = async (event) => {
  try {
    const bucketName = process.env.BUCKET_NAME;

    const {fileName, fileType, productName, productPrice, description, quantity, category, email} = JSON.parse(event.body)

    if(!fileName || !fileType || !productName || !productPrice || !description  
      || !quantity || !category || !email){
      return {
        statusCode: 400,
        body: JSON.stringify({msg: 'fileName,fileType and productName, productPrice, description, quantity, category and email are required'})
      }
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      ContentType: fileType,
    });

    //generate a pre-signed url to allows the client to upload file directly to s3
    const signedUrl = await getSignedUrl(s3Client, command, {expiresIn: 3600});

    const productId = v4uuid();
    const putItem: PutItemCommandInput = {
      TableName: process.env.DYNAMO_TABLE,
      Item: {
        id: {S: productId},
        fileName: {S: fileName},
        productName: {S: productName},
        productPrice: {N: String(productPrice)},
        description: {S: description},
        quantity: {N: String(quantity)},
        email: {S: email},
        isApproved: {BOOL: false},
        category: {S: category},
        createdAt: {S: new Date().toISOString()}
      }
    }

    const commandPut = new PutItemCommand(putItem);
    await dynamoDbClient.send(commandPut);

    return {
      statusCode: 200,
      body: JSON.stringify({uploadUrl: signedUrl})
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({error: error.message})
    }

  }
}