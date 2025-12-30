import { UserManager } from "https://cdn.jsdelivr.net/npm/oidc-client-ts/+esm";
import { cognitoConfig } from "./config.js";

export const userManager = new UserManager({
    authority: cognitoConfig.authority,
    client_id: cognitoConfig.clientId,
    redirect_uri: cognitoConfig.redirectUri,
    response_type: "code",
    scope: cognitoConfig.scope
});

export function login() {
    return userManager.signinRedirect();
}

export function logout() {
    const { clientId, logoutUri, cognitoDomain } = cognitoConfig;
    window.location.href =
        `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
}
