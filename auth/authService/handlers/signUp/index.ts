import {CognitoIdentityProviderClient, SignUpCommand, SignUpCommandInput} from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({
  region: 'us-east-1'
});

const CLIENT_ID = process.env.CLIENT_ID;


export const signUp = async (event) => {
  const {email, password, fullName} = JSON.parse(event.body);

  const input:SignUpCommandInput  = {
    ClientId: CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [
      {Name: 'email', Value: email},
      {Name: 'name', Value: fullName},
    ]
  }

  try{
    const command = new SignUpCommand(input);

    await client.send(command);

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