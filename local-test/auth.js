import { Amplify } from "https://esm.sh/aws-amplify";
import { config } from "./config.local.js";

Amplify.configure({
    Auth: {
        region: config.region,
        userPoolId: config.userPoolId,
        userPoolWebClientId: config.userPoolWebClientId,
    },
});
