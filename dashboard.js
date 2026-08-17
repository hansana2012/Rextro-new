// ==========================================
// 1. FIREBASE CONFIG (SAME AS auth.js)
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
// 2. AUTH GUARD (Redirect to Login if not logged in)
// ==========================================
auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = "login.html";
    } else {
        loadDashboardData(user);
    }
});

// ==========================================
// 3. LOAD DASHBOARD DATA
// ==========================================
function loadDashboardData(user) {
    document.getElementById('uname').innerText = user.displayName || "User";
    document.getElementById('pname').value = user.displayName || "";
    document.getElementById('pemail').value = user.email || "";

    if (user.photoURL) {
        document.getElementById('uimg').src = user.photoURL;
        document.getElementById('pimg').src = user.photoURL;
    } else {
        db.ref('users/' + user.uid + '/photo').on('value', (snapshot) => {
            if (snapshot.val()) {
                document.getElementById('pimg').src = snapshot.val();
                document.getElementById('uimg').src = snapshot.val();
            }
        });
    }

    db.ref('users/' + user.uid + '/stats').on('value', (snapshot) => {
        if (snapshot.val()) {
            document.getElementById('steps').innerText = snapshot.val().steps || 0;
            document.getElementById('bpm').innerText = snapshot.val().bpm || 0;
            document.getElementById('cal').innerText = snapshot.val().cal || 0;
        }
    });
}

// ==========================================
// 4. SAVE PROFILE
// ==========================================
function saveProfile() {
    const user = auth.currentUser;
    const newName = document.getElementById('pname').value;

    user.updateProfile({ displayName: newName })
        .then(() => {
            document.getElementById('uname').innerText = newName;
            alert("Profile Updated Successfully!");
        })
        .catch((error) => {
            alert("Error updating profile: " + error.message);
        });
}

// ==========================================
// 5. IMAGE UPLOAD (Base64)
// ==========================================
function uploadPic(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('pimg').src = e.target.result;
            document.getElementById('uimg').src = e.target.result;
            const user = auth.currentUser;
            db.ref('users/' + user.uid + '/photo').set(e.target.result);
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// ==========================================
// 6. EXERCISE ANIMATION + STATS UPDATE
// ==========================================
function toggleAnim(el, type) {
    el.classList.toggle('act');
    if (el.classList.contains('act')) {
        let steps = parseInt(document.getElementById('steps').innerText) || 0;
        let cal = parseInt(document.getElementById('cal').innerText) || 0;
        
        steps += Math.floor(Math.random() * 200) + 50;
        cal += Math.floor(Math.random() * 10) + 5;

        document.getElementById('steps').innerText = steps;
        document.getElementById('cal').innerText = cal;

        const user = auth.currentUser;
        db.ref('users/' + user.uid + '/stats').update({
            steps: steps,
            cal: cal
        });
    }
}

// ==========================================
// 7. MEDICINE REMINDER
// ==========================================
function setReminder() {
    const time = document.getElementById('medtime').value;
    if (!time) return alert("Please select a time");
    document.getElementById('remstat').innerText = "Reminder set for " + time;
}

// ==========================================
// 8. MOBILE NAV TOGGLE
// ==========================================
function toggleNav() {
    document.getElementById('dnav').classList.toggle('show');
}

// ==========================================
// 9. LOGOUT FUNCTION (Fixed ID)
// ==========================================
// 🔥 මෙතන HTML එකේ Logout බොත්තමට id="logoutBtn" දීමට මතක තබා ගන්න
const logoutBtn = document.querySelector('.dlk:last-child'); // Last child ekak logout eka
if(logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut().then(() => {
            window.location.href = "login.html";
        });
    });
}
