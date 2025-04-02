import {CognitoIdentityProviderClient, SignUpCommand, SignUpCommandInput} from "@aws-sdk/client-cognito-identity-provider";
import { UserModel } from "../../models/UserModel";

const client = new CognitoIdentityProviderClient({
  region: process.env.REGION
});

const CLIENT_ID = process.env.CLIENT_ID;


export const signUp = async (event) => {
  const {email, password, fullName} = JSON.parse(event.body);
  const username = fullName.replace(/\s+/g, '_');

  const input:SignUpCommandInput  = {
    ClientId: CLIENT_ID,
    Username: username,
    Password: password,
    UserAttributes: [
      {Name: 'email', Value: email},
      {Name: 'name', Value: fullName},
    ]
  }

  try{
    const command = new SignUpCommand(input);

    await client.send(command);

    //save user in DynamoDB
    const user = new UserModel(email, username);
    await user.save();

    return {
      statusCode: 200,
      body: JSON.stringify({msg: "Account created. Verify your email to confirm your account"})
    }
  } catch(error) {
    return {
      statusCode: 400,
      body: JSON.stringify({msg: "sign-up failed", error: error.message})
    }
  }
} 