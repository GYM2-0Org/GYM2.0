export const cognitoConfig = {
    Region: "eu-north-1",
    cognitoDomain: "https://eu-north-1anlv1kqrj.auth.eu-north-1.amazoncognito.com",
    authority: "https://eu-north-1anlv1kqrj.auth.eu-north-1.amazoncognito.com",
    client_id: window._env_.COGNITO_CLIENT_ID,
    redirect_uri: "https://amplifyv2.d2r89bauojj5mo.amplifyapp.com/callback.html",
    logoutUri: "https://amplifyv2.d2r89bauojj5mo.amplifyapp.com",
    response_type: "code",
    scope: "email openid profile"
};

