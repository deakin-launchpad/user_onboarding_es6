import AmplifyAuth from "../lib/amplifyAuthServices";

exports.register = async function (server, options) {
  //Register Authorization Plugin
  server.auth.strategy("AmplifyAuth", "bearer-access-token", {
    allowQueryToken: false,
    allowMultipleHeaders: true,
    accessTokenName: "accessToken",
    validate: async function (request, token, h) {
      try {
        const credentials = await AmplifyAuth.validateToken(token);

        if (credentials instanceof Error) {
          return {
            isValid: false,
            credentials: null
          };
        }

        return {
          isValid: !!credentials?.userData,
          credentials
        };
      } catch (error) {
        console.error('Auth validation error:', error);
        return {
          isValid: false,
          credentials: null
        };
      }
    },
  });
};

exports.name = "amplify-auth-plugin";