import { fetchAuthSession } from "https://esm.sh/aws-amplify/auth";
import { config } from "./config.local.js";

export async function apiFetch(path, options = {}) {
    const session = await fetchAuthSession();
    const token = session.tokens.idToken.toString();

    return fetch(`${config.apiBaseUrl}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: token,
            ...(options.headers || {}),
        },
    });
}
