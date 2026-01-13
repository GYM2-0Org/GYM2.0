import {CognitoIdentityProviderClient,ConfirmSignUpCommand} from "https://cdn.jsdelivr.net/npm/@aws-sdk/client-cognito-identity-provider/+esm";
import { cognitoConfig } from "./config.js";

// Region und  Client_id aus config.js holen
const {Region} = cognitoConfig;
const {client_id} = cognitoConfig;

const client = new CognitoIdentityProviderClient({ region: Region });

const messageBox = document.getElementById("verifyMessage");

// verifizierung der Email nach eingabe des codes und der betätigung des verify buttons
document.getElementById("verifyBtn").addEventListener("click", async () => {

   // Email-Adresse aus dem localStorage holen
   const email = localStorage.getItem("pendingEmail");
   const code = document.getElementById("codeInput").value;

   if (!email) { 
     messageBox.textContent = "Fehler: Keine E-Mail gefunden. Bitte Registrierung erneut starten.";
     messageBox.style.color = "red"; 
     return; 
   } 
  
   if (!code) { 
     messageBox.textContent = "Bitte gib den Bestätigungscode ein."; 
     messageBox.style.color = "red"; 
     return; 
   }
  
try { 
  const cmd = new ConfirmSignUpCommand({ 
    ClientId: client_id, 
    Username: email, 
    ConfirmationCode: code 
  }); 
  
    // Überprüfung der verifikation durch cognito
    await client.send(cmd); 
  
    messageBox.textContent = "E-Mail erfolgreich bestätigt. Du wirst weitergeleitet…"; 
    messageBox.style.color = "green"; 
  
    // localStorage leeren
    localStorage.removeItem("pendingEmail"); 
  
    setTimeout(() => { 
      window.location.href = "home.html";
    }, 2000); 
  
  } catch (err) { 
  
    console.error("Verify error:", err);
  
    if (err.name === "CodeMismatchException") {
      messageBox.textContent = "Der Code ist falsch.";
    
    } else if (err.name === "ExpiredCodeException") {
      messageBox.textContent = "Der Code ist abgelaufen. Bitte fordere einen neuen an.";
    
    } else if (err.name === "UserNotFoundException") { 
      messageBox.textContent = "E-Mail nicht gefunden. Bitte Registrierung erneut starten."; 
    
    } else { 
      messageBox.textContent = "Unbekannter Fehler. Bitte erneut versuchen."; 
    } 
  
    messageBox.style.color = "red"; 
  } 
});
