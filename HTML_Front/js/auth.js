import { UserManager } from "https://cdn.jsdelivr.net/npm/oidc-client-ts/+esm";
import { cognitoConfig } from "./config.js";

export const userManager = new UserManager({
    ...cognitoConfig,
});

// LOGIN
export function login() {
    userManager.signinRedirect();
}
// SIGNUP
export function register() {
    const {client_id, scope, cognitoDomain, logoutUri } = cognitoConfig;
    
    window.location.href =
        `${cognitoDomain}/signup?client_id=${client_id}` +
        `&redirect_uri=${encodeURIComponent(logoutUri)}` +
        `&response_type=code&scope=${encodeURIComponent(scope)}` +
        `&screen_hint=signup`;
}


// LOGOUT
export async function logout() {
    const {client_id, logoutUri, cognitoDomain} = cognitoConfig;
    window.location.href = `${cognitoDomain}/logout?client_id=${client_id}&logout_uri=${encodeURIComponent(logoutUri)}`;
}
