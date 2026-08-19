// ==========================================
// 1. FIREBASE CONFIG
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyCB5vUpkeHUG8S0YC1tkNFxM9fmiXehg1c",
    authDomain: "rextro-a29a2.firebaseapp.com",
    databaseURL: "https://rextro-a29a2-default-rtdb.firebaseio.com",
    projectId: "rextro-a29a2",
    storageBucket: "rextro-a29a2.firebasestorage.app",
    messagingSenderId: "563362233355",
    appId: "1:563362233355:web:8683f46669e9d7a6aa9b0e",
    measurementId: "G-H40F0FXVC2"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// ==========================================
// 2. REGISTER WITH EMAIL & PASSWORD
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
                return userCredential.user.updateProfile({ displayName: name });
            })
            .then(() => {
                const user = auth.currentUser;
                return user.sendEmailVerification();
            })
            .then(() => {
                alert("Registration Successful! Verification link sent to your email.");
                window.location.href = "login.html";
            })
            .catch((error) => {
                alert("Registration Error: " + error.message);
            });
    });
}

// ==========================================
// 3. LOGIN WITH EMAIL & PASSWORD
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
                if(user.emailVerified) {
                    alert("Login Successful!");
                    window.location.href = "dashboard.html";
                } else {
                    alert("Please verify your email first.");
                    auth.signOut();
                }
            })
            .catch((error) => {
                alert("Login Failed: " + error.message);
            });
    });
}

// ==========================================
// 4. SOCIAL LOGIN (GOOGLE, FACEBOOK, APPLE)
// ==========================================
function socialLogin(provider) {
    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            
            // Realtime Database එකේ User විස්තර Save කිරීම
            return db.ref('users/' + user.uid).update({
                name: user.displayName,
                email: user.email,
                photo: user.photoURL || ""
            }).then(() => {
                alert("Welcome " + user.displayName + "!");
                window.location.href = "dashboard.html";
            });
        })
        .catch((error) => {
            console.error("Social Login Error:", error);
            alert("Social Login Error: " + error.message);
        });
}

// Google Button Click Event
const gglBtn = document.getElementById('gglbtn');
if (gglBtn) {
    gglBtn.addEventListener('click', () => {
        socialLogin(new firebase.auth.GoogleAuthProvider());
    });
}

// Facebook Button Click Event
const facBtn = document.getElementById('facbtn');
if(facBtn) {
    facBtn.addEventListener('click', () => {
        socialLogin(new firebase.auth.FacebookAuthProvider());
    });
}

// Apple Button Click Event
const aplBtn = document.getElementById('aplbtn');
if(aplBtn) {
    aplBtn.addEventListener('click', () => {
        socialLogin(new firebase.auth.OAuthProvider('apple.com'));
    });
}
// ==========================================
// 5. LIVE ACTIVE USERS COUNTER
// ==========================================
// මෙය පිටුව පූරණය වන විට සහ දත්ත වෙනස් වන විට update වේ.
const usersRef = db.ref('users');

usersRef.on('value', (snapshot) => {
    const count = snapshot.numChildren(); // users ගණන ගන්නවා
    const displayElement = document.getElementById('activeUsersCount');
    
    if (displayElement) {
        // අගය පෙන්වීම (උදා: 1200 -> "1.2K+")
        if (count >= 1000) {
            const kFormat = (count / 1000).toFixed(1) + "K+";
            displayElement.textContent = kFormat;
        } else {
            displayElement.textContent = count + "+";
        }
    }
});
