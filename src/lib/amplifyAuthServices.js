import { CognitoIdentityProviderClient, GetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { CognitoJwtVerifier } from "aws-jwt-verify";

const poolData = {
  UserPoolId: process.env.poolId,
  ClientId: process.env.clientId,
};

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

const validateToken = async (token) => {
  const verifier = CognitoJwtVerifier.create({
    userPoolId: poolData.UserPoolId,
    tokenUse: "id",
    clientId: poolData.ClientId,
    includeRawJwtInErrors: true,
  });

  try {
    const result = await verifier.verify(token);
    if (result) {
      // Get additional user information using the access token
      const getUserCommand = new GetUserCommand({
        AccessToken: token
      });

      try {
        const userData = await cognitoClient.send(getUserCommand);
        return {
          userData: {
            ...result,
            cognitoUser: userData
          }
        };
      } catch (userErr) {
        console.error('Error fetching user data:', userErr);
        return { userData: result };
      }
    }
    throw new Error('Invalid token');
  } catch (err) {
    console.error('Token validation error:', err);
    return err;
  }
};

export default {
  validateToken,
  cognitoClient
};