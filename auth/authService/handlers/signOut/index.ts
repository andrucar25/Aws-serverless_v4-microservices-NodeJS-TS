import {CognitoIdentityProviderClient, GlobalSignOutCommand, GlobalSignOutCommandInput} from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({
  region: process.env.REGION
});

const CLIENT_ID = process.env.CLIENT_ID;

export const signOut = async (event) => {
  const {accessToken} = JSON.parse(event.body);

  const input: GlobalSignOutCommandInput = {
    AccessToken: accessToken
  }

  try{
    const command = new GlobalSignOutCommand(input);
    await client.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({
        msg: "User successfully signed out"
      })
    }
  } catch(error){
    return {
      statusCode: 400,
      body: JSON.stringify({msg: "Sign out failed", error: error.message})
    }
  }
}