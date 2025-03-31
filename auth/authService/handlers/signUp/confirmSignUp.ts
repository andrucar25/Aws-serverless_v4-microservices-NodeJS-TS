import {CognitoIdentityProviderClient, ConfirmSignUpCommand, ConfirmSignUpCommandInput, SignUpCommand, SignUpCommandInput} from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({
  region: 'us-east-1'
});

const CLIENT_ID = process.env.CLIENT_ID;

export const confirmSignUp = async (event) => {
  const {email, confirmationCode} = JSON.parse(event.body);

  const input: ConfirmSignUpCommandInput = {
    ClientId: CLIENT_ID,
    Username: email,
    ConfirmationCode: confirmationCode
  }

  try {
    const command = new ConfirmSignUpCommand(input);
    
    await client.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({msg: "User successfully confirmed"})
    }
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({msg: "confirmation failed", error: error.message})
    }
  }
}