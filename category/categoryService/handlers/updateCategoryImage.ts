import {DynamoDBClient, UpdateItemCommand, UpdateItemCommandInput} from "@aws-sdk/client-dynamodb";

const dynamoDbClient = new DynamoDBClient({region: "us-east-1"});

export const updateCategoryImage = async (event) => {
  try {
    const tableName = process.env.DYNAMO_TABLE;
    const record = event.Records[0]

    const bucketName = record.s3.bucket.name;
    const fileName = record.s3.object.key
    const imageUrl = `https://${bucketName}.s3.amazonaws.com/${fileName}`;

    const updateItem: UpdateItemCommandInput = {
      TableName: tableName,
      Key: {fileName: {S: fileName}},
      UpdateExpression: "SET imageUrl = :imageUrl",  //only update imageUrl field
      ExpressionAttributeValues: {
        ":imageUrl": {S: imageUrl}   //asign the new image url
      }
    }

    const updateItemCommand = new UpdateItemCommand(updateItem);
    await dynamoDbClient.send(updateItemCommand);

    return {
      statusCode: 200,
      body: JSON.stringify({message: "image Url updated successfully"})
    }
  } catch(error) {
    return {
      statusCode: 500,
      body: JSON.stringify({message: [], error: error.message})
    }
  }
}

