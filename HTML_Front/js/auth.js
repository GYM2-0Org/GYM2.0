import { UserManager } from "https://cdn.jsdelivr.net/npm/oidc-client-ts/+esm";
import { cognitoConfig } from "./config.js";

export const userManager = new UserManager({
    authority: cognitoConfig.authority,
    client_id: cognitoConfig.clientId,
    redirect_uri: cognitoConfig.redirectUri,
    post_logout_redirect_uri: cognitoConfig.logoutUri,
    response_type: "code",
    scope: cognitoConfig.scope,
    automaticSilentRenew: false,
        
        metadata: {
        issuer: cognitoConfig.authority,
        authorization_endpoint: `${cognitoConfig.cognitoDomain}/login`,
        token_endpoint: `${cognitoConfig.cognitoDomain}/oauth2/token`,
        userinfo_endpoint: `${cognitoConfig.cognitoDomain}/oauth2/userInfo`,
        end_session_endpoint: `${cognitoConfig.cognitoDomain}/logout`
    }

});

// LOGIN
export function login() {
    userManager.signinRedirect();
}

// SIGNUP
export function register() {
    userManager.signinRedirect({
        extraQueryParams: {
            screen_hint: "signup"
        }
    });
}

// LOGOUT
export function logout() {
    userManager.signoutRedirect();
}
