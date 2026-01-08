import { login, logout, register } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {

    const loginBtn = document.getElementById("btnLogin");
    const registBtn = document.getElementById("btnRegister");

    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            login();
        });
    }

    if (registBtn) {
        registBtn.addEventListener("click", () => {
            window.location.href = "signUp.html";
        });
    }

});
