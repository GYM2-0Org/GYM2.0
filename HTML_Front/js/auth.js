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
    const {client_id, scope } = cognitoConfig;
    const cognitoDomain = "https://eu-north-1anlv1kqrj.auth.eu-north-1.amazoncognito.com";
    const logoutUri = "https://amplifyv2.d2r89bauojj5mo.amplifyapp.com";

    window.location.href =
        `${cognitoDomain}/signup?client_id=${client_id}` +
        `&redirect_uri=${encodeURIComponent(logoutUri)}` +
        `&response_type=code&scope=${encodeURIComponent(scope)}` +
        `&screen_hint=signup`;
}


// LOGOUT
export async function logout() {
    const {client_id} = cognitoConfig;
    const logoutUri = "https://amplifyv2.d2r89bauojj5mo.amplifyapp.com";
    const cognitoDomain = "https://eu-north-1anlv1kqrj.auth.eu-north-1.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${client_id}&logout_uri=${encodeURIComponent(logoutUri)}`;
}
