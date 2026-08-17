// 1. Initialize Firebase (Replace this with your actual config)
// Go to Firebase Console -> Project Settings -> Your apps -> Config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// ==========================================
// 2. REGISTER FUNCTIONALITY (Email/Password)
// ==========================================
const regForm = document.getElementById('regf');
if(regForm) {
    regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('rname').value;
        const email = document.getElementById('remail').value;
        const pass = document.getElementById('rpass').value;

        auth.createUserWithEmailAndPassword(email, pass)
            .then((userCredential) => {
                // Update profile with user's name
                return userCredential.user.updateProfile({
                    displayName: name
                });
            })
            .then(() => {
                alert("Account Created Successfully! Redirecting...");
                window.location.href = "index.html"; // Redirect to Home
            })
            .catch((error) => {
                alert("Registration Error: " + error.message);
            });
    });
}

// ==========================================
// 3. LOGIN FUNCTIONALITY (Email/Password)
// ==========================================
const logForm = document.getElementById('logf');
if(logForm) {
    logForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('lemail').value;
        const pass = document.getElementById('lpass').value;

        auth.signInWithEmailAndPassword(email, pass)
            .then((userCredential) => {
                alert("Login Successful! Welcome back.");
                window.location.href = "index.html"; // Redirect to Home
            })
            .catch((error) => {
                alert("Login Failed: " + error.message);
            });
    });
}

// ==========================================
// 4. SOCIAL LOGIN HELPER FUNCTION
// ==========================================
function socialLogin(provider) {
    auth.signInWithPopup(provider)
        .then((result) => {
            alert("Welcome " + result.user.displayName + "!");
            window.location.href = "index.html";
        })
        .catch((error) => {
            alert("Social Login Error: " + error.message);
        });
}

// Google Login
const gglBtn = document.getElementById('gglbtn');
if(gglBtn) {
    gglBtn.addEventListener('click', () => {
        socialLogin(new firebase.auth.GoogleAuthProvider());
    });
}

// Facebook Login
const facBtn = document.getElementById('facbtn');
if(facBtn) {
    facBtn.addEventListener('click', () => {
        socialLogin(new firebase.auth.FacebookAuthProvider());
    });
}

// Apple Login
const aplBtn = document.getElementById('aplbtn');
if(aplBtn) {
    aplBtn.addEventListener('click', () => {
        socialLogin(new firebase.auth.OAuthProvider('apple.com'));
    });
}
// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCB5vUpkeHUG8S0YC1tkNFxM9fmiXehg1c",
  authDomain: "rextro-a29a2.firebaseapp.com",
  databaseURL: "https://rextro-a29a2-default-rtdb.firebaseio.com",
  projectId: "rextro-a29a2",
  storageBucket: "rextro-a29a2.firebasestorage.app",
  messagingSenderId: "563362233355",
  appId: "1:563362233355:web:8683f46669e9d7a6aa9b0e",
  measurementId: "G-H40F0FXVC2"
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// ==========================================
// REGISTER WITH OTP
// ==========================================
const regForm = document.getElementById('regf');
if(regForm) {
    regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('rname').value;
        const email = document.getElementById('remail').value;
        const pass = document.getElementById('rpass').value;

        // Step 1: Create User
        auth.createUserWithEmailAndPassword(email, pass)
            .then((userCredential) => {
                return userCredential.user.updateProfile({ displayName: name });
            })
            .then(() => {
                // Step 2: Send OTP (Email Verification)
                const user = auth.currentUser;
                return user.sendEmailVerification();
            })
            .then(() => {
                alert("Registration Successful! An OTP (Verification link) has been sent to your email. Please verify before logging in.");
                window.location.href = "login.html";
            })
            .catch((error) => {
                alert("Registration Error: " + error.message);
            });
    });
}

// ==========================================
// LOGIN WITH OTP CHECK
// ==========================================
const logForm = document.getElementById('logf');
if(logForm) {
    logForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('lemail').value;
        const pass = document.getElementById('lpass').value;

        auth.signInWithEmailAndPassword(email, pass)
            .then((userCredential) => {
                const user = userCredential.user;
                // Check if email is verified (OTP check)
                if(user.emailVerified) {
                    alert("Login Successful! Welcome back.");
                    window.location.href = "dashboard.html";
                } else {
                    alert("Please verify your email first. An OTP link was sent to your email.");
                    auth.signOut();
                }
            })
            .catch((error) => {
                alert("Login Failed: " + error.message);
            });
    });
}

// ==========================================
// SOCIAL LOGIN (Google Auto-Fill)
// ==========================================
function socialLogin(provider) {
    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            // Auto-fill data to dashboard profile (saved in DB)
            db.ref('users/' + user.uid).set({
                name: user.displayName,
                email: user.email,
                photo: user.photoURL || "",
                provider: provider.providerId
            });
            alert("Welcome " + user.displayName + "!");
            window.location.href = "dashboard.html";
        })
        .catch((error) => {
            alert("Social Login Error: " + error.message);
        });
}

// Google
const gglBtn = document.getElementById('gglbtn');
if(gglBtn) gglBtn.addEventListener('click', () => socialLogin(new firebase.auth.GoogleAuthProvider()));

// Facebook
const facBtn = document.getElementById('facbtn');
if(facBtn) facBtn.addEventListener('click', () => socialLogin(new firebase.auth.FacebookAuthProvider()));

// Apple
const aplBtn = document.getElementById('aplbtn');
if(aplBtn) aplBtn.addEventListener('click', () => socialLogin(new firebase.auth.OAuthProvider('apple.com')));
