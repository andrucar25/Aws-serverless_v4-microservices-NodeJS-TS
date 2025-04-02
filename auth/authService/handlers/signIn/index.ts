import {CognitoIdentityProviderClient, InitiateAuthCommand, InitiateAuthCommandInput} from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({
  region: process.env.REGION
});

const CLIENT_ID = process.env.CLIENT_ID;

export const signIn = async (event) => {
  const {email, password} = JSON.parse(event.body);

  const input: InitiateAuthCommandInput = {
    ClientId: CLIENT_ID,
    AuthFlow: 'USER_PASSWORD_AUTH',
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password
    }
  }

  try{
    const command = new InitiateAuthCommand(input);
    const response = await client.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({
        msg: "User successfully signed in",
        tokens: response.AuthenticationResult
      })
    }
  } catch(error){
    return {
      statusCode: 400,
      body: JSON.stringify({msg: "Sign in failed", error: error.message})
    }
  }
}