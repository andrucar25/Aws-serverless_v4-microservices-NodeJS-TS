import {DynamoDBClient, ScanCommand, ScanCommandInput} from "@aws-sdk/client-dynamodb";

const dynamoDbClient = new DynamoDBClient({region: 'us-east-1'});

export const getAllCategories = async () => {
  try {
    const tableName = process.env.DYNAMO_TABLE;

    const scanCommandInput: ScanCommandInput = {
      TableName: tableName
    };

    const scanCommand = new ScanCommand(scanCommandInput);
    const {Items} = await dynamoDbClient.send(scanCommand)    

    if(!Items || Items.length === 0) {
      return {
        statusCOde: 404,
        body: JSON.stringify({response: "No categories found", error: []})
      }
    }

    const categories = Items.map(item => ({
      categoryName: item.categoryName.S,
      imageUrl: item.imageUrl.S
    }))

    return {
      statusCode: 200,
      body: JSON.stringify({response: categories, error: []})
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({response: [], error: [error.message]})
    }
  }
}