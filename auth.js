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
