import { app } from "./app.js";   // Import Firebase from your app.js

import { 
    getAuth, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const auth = getAuth(app);

// SIGNUP
window.signup = function () {
    let email = document.getElementById("registerEmail").value;
    let password = document.getElementById("registerPassword").value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            alert("Signup Successful!");
            window.location.href = "login.html"; // Go to login
        })
        .catch(error => {
            alert(error.message);
        });
}

// LOGIN
window.login = function () {
    let email = document.getElementById("loginEmail").value;
    let password = document.getElementById("loginPassword").value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            alert("Login Successful!");
            window.location.href = "dashboard.html"; // Go to dashboard
        })
        .catch(error => {
            alert(error.message);
        });
}

// LOGOUT
window.logout = function () {
    signOut(auth).then(() => {
        alert("Logged out!");
        window.location.href = "login.html";
    });
}
