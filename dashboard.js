// ==========================================
// 1. FIREBASE CONFIG (SAME AS auth.js)
// ==========================================
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// ==========================================
// 2. AUTH GUARD (Redirect to Login if not logged in)
// ==========================================
auth.onAuthStateChanged((user) => {
    if (!user) {
        // If not logged in, redirect to login page
        window.location.href = "login.html";
    } else {
        // If logged in, load dashboard data
        loadDashboardData(user);
    }
});

// ==========================================
// 3. LOAD DASHBOARD DATA (Profile, Stats)
// ==========================================
function loadDashboardData(user) {
    // Load Name & Email
    document.getElementById('uname').innerText = user.displayName || "User";
    document.getElementById('pname').value = user.displayName || "";
    document.getElementById('pemail').value = user.email || "";

    // Load Profile Picture (from Google or Database)
    if (user.photoURL) {
        document.getElementById('uimg').src = user.photoURL;
        document.getElementById('pimg').src = user.photoURL;
    } else {
        // Load saved image from database (if uploaded manually)
        db.ref('users/' + user.uid + '/photo').on('value', (snapshot) => {
            if (snapshot.val()) {
                document.getElementById('pimg').src = snapshot.val();
                document.getElementById('uimg').src = snapshot.val();
            }
        });
    }

    // Load Stats (Steps, BPM, Calories)
    db.ref('users/' + user.uid + '/stats').on('value', (snapshot) => {
        if (snapshot.val()) {
            document.getElementById('steps').innerText = snapshot.val().steps || 0;
            document.getElementById('bpm').innerText = snapshot.val().bpm || 0;
            document.getElementById('cal').innerText = snapshot.val().cal || 0;
        }
    });
}

// ==========================================
// 4. SAVE PROFILE (Name only)
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
// 5. IMAGE UPLOAD (Base64 - Simple)
// ==========================================
function uploadPic(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Update UI
            document.getElementById('pimg').src = e.target.result;
            document.getElementById('uimg').src = e.target.result;
            
            // Save to Database
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
        // Update stats randomly
        let steps = parseInt(document.getElementById('steps').innerText) || 0;
        let cal = parseInt(document.getElementById('cal').innerText) || 0;
        
        steps += Math.floor(Math.random() * 200) + 50;
        cal += Math.floor(Math.random() * 10) + 5;

        document.getElementById('steps').innerText = steps;
        document.getElementById('cal').innerText = cal;

        // Save to Database
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
// 9. LOGOUT FUNCTION
// ==========================================
document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut().then(() => {
        window.location.href = "login.html";
    });
});
