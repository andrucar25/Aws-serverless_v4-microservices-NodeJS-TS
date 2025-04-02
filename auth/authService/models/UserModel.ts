import { DynamoDBClient, PutItemCommand, PutItemCommandInput } from "@aws-sdk/client-dynamodb";
import {v4 as uuidv4} from "uuid";

const TABLE_NAME = "Users";

const dynamoClient = new DynamoDBClient({
  region: 'us-east-1',
})

export class UserModel{
  userId: string;
  state: string;
  city: string;
  locality: string;
  createdAt: string;

  constructor(public email: string, public fullName: string){
    this.userId = uuidv4();
    this.email = email;
    this.fullName = fullName;
    this.state = '';
    this.city = '';
    this.locality = '';
    this.createdAt = new Date().toISOString();
  }

  async save(){
    const inputPut: PutItemCommandInput = {
      TableName: TABLE_NAME,
      Item: {
        userId: {S: this.userId},
        email: {S: this.email},
        fullName: {S: this.fullName},
        state: {S: this.state},
        city: {S: this.city},
        locality: {S: this.locality},
        createdAt: {S: this.createdAt},
      }
    }

    try {
      const commandPut = new PutItemCommand(inputPut);
      await dynamoClient.send(commandPut);

      return {
        statusCode: 200,
        body: JSON.stringify({msg: "Account created. Verify your email to confirm your account"})
      }
    } catch (error){
      return {
        statusCode: 200,
        body: JSON.stringify({msg: "Account created. Verify your email to confirm your account"})
      }
    }
  }
}