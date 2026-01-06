import { userManager } from "./auth.js";

const statusText = document.getElementById("statusText");

userManager.signinCallback()
    .then(user => {
        statusText.innerHTML = `
            <span class="success">
                Login erfolgreich.<br>
                Willkommen, ${user.profile.email}!<br>
            </span>
            <img src="image/img.png">
        `;
        setTimeout(() => {
            window.location.href = "home.html";
        }, 1500);
    })
    .catch(err => {
        console.error("Fehler beim Login:", err);
        statusText.innerHTML = `
            <span class="error">
                Login fehlgeschlagen.<br>
                ${err.message}<br><br>
                Du wirst in 5 Sekunden zurückgeleitet…
            </span>
        `;
        setTimeout(() => {
            window.location.href = "home.html";
        }, 5000);
    });
