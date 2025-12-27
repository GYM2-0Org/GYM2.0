document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btnLogin")
        .addEventListener("click", login);

    document.getElementById("btnRegister")
        .addEventListener("click", register);
});

function login() {
    const url =
        `${COGNITO_DOMAIN}/oauth2/authorize?` +
        `client_id=${COGNITO_CLIENT_ID}` +
        `&response_type=code` +
        `&scope=openid+email+profile` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

    window.location.href = url;
}

function register() {
    const url =
        `${COGNITO_DOMAIN}/signup?` +
        `client_id=${COGNITO_CLIENT_ID}` +
        `&response_type=code` +
        `&scope=openid+email+profile` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

    window.location.href = url;
}