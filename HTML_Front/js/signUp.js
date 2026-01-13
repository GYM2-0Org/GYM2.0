import { cognitoConfig } from "./config.js";
// Client_id aus Config holen
const {client_id} = cognitoConfig;

const form = document.getElementById("signupForm");
const msg = document.getElementById("signupMessage");
const showPw = document.getElementById("showPassword");

// Passwort sichtbar machen nach checkbox change
showPw.addEventListener("change", () => {
  const type = showPw.checked ? "text" : "password";
  form.password.type = type;
  form.confirmPassword.type = type;
});

// Passwort Regeln
const passwordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSymbols: true
};

// Überprüfung ob Passwort den Passwort regeln entspricht
function validatePassword(password, policy) {
  const errors = [];

  if (password.length < policy.minLength) {
    errors.push(`Password must be at least ${policy.minLength} characters long.`);
  }
  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter.");
  }
  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter.");
  }
  if (policy.requireNumbers && !/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number.");
  }
  if (policy.requireSymbols && !/[^A-Za-z0-9]/.test(password)) {
    errors.push("Password must contain at least one special character.");
  }

  return errors;
}

// Daten nach submit auslesen 
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";
  msg.className = "";

  const email = form.email.value.trim();
  const givenName = form.givenName.value.trim();
  const familyName = form.familyName.value.trim();
  const street = form.street.value.trim();
  const houseNumber = form.houseNumber.value.trim();
  const postalCode = form.postalCode.value.trim();
  const city = form.city.value.trim();
  const password = form.password.value;
  const confirmPassword = form.confirmPassword.value;

  // Überprüfung ob Passwöter übereinstimmen
  if (password !== confirmPassword) {
    msg.textContent = "Passwords do not match.";
    msg.className = "msg-error";
    return;
  }

  // Passwort regeln überprüfen und bei nicht einhalten error Massage
  const pwErrors = validatePassword(password, passwordPolicy);
  if (pwErrors.length > 0) {
    msg.textContent = pwErrors.join(" ");
    msg.className = "msg-error";
    return;
  }

  // Daten um an Cognito zu senden
  const payload = {
    ClientId: client_id,
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: "email", Value: email },
      { Name: "given_name", Value: givenName },
      { Name: "family_name", Value: familyName },
      { Name: "custom:Street", Value: street },
      { Name: "custom:House-number", Value: houseNumber },
      { Name: "custom:Postal-Code", Value: postalCode },
      { Name: "custom:City", Value: city }
    ]
  };

  // Post Request an Cognito mit Eingabedaten als Json
  try {
    const response = await fetch("https://cognito-idp.eu-north-1.amazonaws.com/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-amz-json-1.1",
        "X-Amz-Target": "AWSCognitoIdentityProviderService.SignUp"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      msg.textContent = result.message || "Error during signup.";
      msg.className = "msg-error";
      return;
    }

    msg.textContent = "Registration successful! Please check your email to confirm your account.";
    msg.className = "msg-success";

    localStorage.setItem("pendingEmail", email);
    window.location.href = "verify.html";


  } catch (err) {
    console.error(err);
    msg.textContent = "Unexpected error during signup.";
    msg.className = "msg-error";
  }
});
