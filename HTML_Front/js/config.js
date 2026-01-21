export const cognitoConfig = {
    Region: "eu-north-1",
    cognitoDomain: "https://eu-north-1anlv1kqrj.auth.eu-north-1.amazoncognito.com",
    authority: `https://cognito-idp.eu-north-1.amazonaws.com/${window._env_.COGNITO_USER_POOL_ID}`,
    client_id: window._env_.COGNITO_CLIENT_ID,
    redirect_uri: "https://amplifyv2.d2r89bauojj5mo.amplifyapp.com/callback.html",
    logoutUri: "https://amplifyv2.d2r89bauojj5mo.amplifyapp.com",
    response_type: "code",
    scope: "email openid profile",
    metadata: { issuer: "https://eu-north-1anlv1kqrj.auth.eu-north-1.amazoncognito.com",
        authorization_endpoint: "https://eu-north-1anlv1kqrj.auth.eu-north-1.amazoncognito.com/oauth2/authorize",
        token_endpoint: "https://eu-north-1anlv1kqrj.auth.eu-north-1.amazoncognito.com/oauth2/token",
        userinfo_endpoint: "https://eu-north-1anlv1kqrj.auth.eu-north-1.amazoncognito.com/oauth2/userInfo",
        end_session_endpoint: "https://eu-north-1anlv1kqrj.auth.eu-north-1.amazoncognito.com/logout" }
};

