import inert from "@hapi/inert";

import swaggerPlugin from "./swagger.js";
import authPlugin from "./auth-token.js";
import amplifyPlugin from "./amplify-auth.js";

export default [
    inert,
    { plugin: swaggerPlugin },
    { plugin: authPlugin },
    { plugin: amplifyPlugin },
];