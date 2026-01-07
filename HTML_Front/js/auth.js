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
    userManager.signinRedirect({
        extraQueryParams: {
            screen_hint: "signup"
        }
    });
}

// LOGOUT
export async function logout() {
    const clientId = "64fqsf4bha6al02hpav3pu53vl";
    const logoutUri = "https://amplifyv2.d2r89bauojj5mo.amplifyapp.com";
    const cognitoDomain = "https://eu-north-1anlv1kqrj.auth.eu-north-1.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
}
