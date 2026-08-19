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
// EXERCISE ANIMATION
// ==========================================
function startExercise(el, type) {
    document.querySelectorAll('.dexc').forEach(ex => {
        ex.classList.remove('active', 'run', 'jump', 'cycle', 'swim');
    });
    
    el.classList.add('active', type);
    
    let steps = parseInt(document.getElementById('steps').innerText.replace(/,/g, '')) || 0;
    let cal = parseInt(document.getElementById('cal').innerText) || 0;
    
    let stepIncrease = 0;
    let calIncrease = 0;
    
    switch(type) {
        case 'run':
            stepIncrease = Math.floor(Math.random() * 300) + 150;
            calIncrease = Math.floor(Math.random() * 15) + 8;
            break;
        case 'jump':
            stepIncrease = Math.floor(Math.random() * 100) + 50;
            calIncrease = Math.floor(Math.random() * 10) + 5;
            break;
        case 'cycle':
            stepIncrease = Math.floor(Math.random() * 250) + 100;
            calIncrease = Math.floor(Math.random() * 12) + 6;
            break;
        case 'swim':
            stepIncrease = Math.floor(Math.random() * 200) + 80;
            calIncrease = Math.floor(Math.random() * 20) + 10;
            break;
    }
    
    steps += stepIncrease;
    cal += calIncrease;
    
    document.getElementById('steps').innerText = steps.toLocaleString();
    document.getElementById('cal').innerText = cal;
    
    const user = auth.currentUser;
    if (user) {
        db.ref('users/' + user.uid + '/stats').update({ 
            steps: steps, 
            cal: cal 
        });
    }
    
    setTimeout(() => {
        el.classList.remove('active', type);
    }, 3000);
}

// ==========================================
// MEDICINE REMINDER
// ==========================================
function setReminder() {
    const time = document.getElementById('medtime').value;
    if (!time) return alert("Select a time");
    document.getElementById('remstat').innerText = "Reminder set for " + time;
}

// ==========================================
// MOBILE NAV TOGGLE
// ==========================================
function toggleNav() {
    document.getElementById('dnav').classList.toggle('show');
}

// ==========================================
// LOGOUT
// ==========================================
document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut().then(() => {
        alert("Logged out!");
        loadDash();
        showSection('home');
    });
});
// ==========================================
// EXERCISE STOPWATCH - Count Up Timer
// ==========================================
function startExercise(el, type) {
    // පෙර exercise එක නවත්වන්න
    document.querySelectorAll('.dexc').forEach(ex => {
        ex.classList.remove('active', 'running', 'run', 'jump', 'cycle', 'swim');
        const sw = ex.querySelector('.stopwatch');
        if (sw) {
            sw.textContent = '00:00';
        }
        if (ex._stopwatchInterval) {
            clearInterval(ex._stopwatchInterval);
        }
    });
    
    // Current exercise එකට active class දාන්න
    el.classList.add('active', type, 'running');
    
    // Stopwatch start කරන්න
    let seconds = 0;
    const stopwatchDisplay = el.querySelector('.stopwatch');
    
    if (stopwatchDisplay) {
        stopwatchDisplay.textContent = '00:00';
    }
    
    // Stats update
    let steps = parseInt(document.getElementById('steps').innerText.replace(/,/g, '')) || 0;
    let cal = parseInt(document.getElementById('cal').innerText) || 0;
    
    // Stopwatch interval - හැම තත්පරයකම update වෙනවා
    el._stopwatchInterval = setInterval(() => {
        seconds++;
        
        // Time format: MM:SS
        const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');
        
        if (stopwatchDisplay) {
            stopwatchDisplay.textContent = mins + ':' + secs;
        }
        
        // හැම තත්පර 5කටම steps & calories වැඩි කරන්න
        if (seconds % 5 === 0) {
            let stepIncrease = 0;
            let calIncrease = 0;
            
            switch(type) {
                case 'run':
                    stepIncrease = Math.floor(Math.random() * 50) + 20;
                    calIncrease = Math.floor(Math.random() * 3) + 1;
                    break;
                case 'jump':
                    stepIncrease = Math.floor(Math.random() * 30) + 10;
                    calIncrease = Math.floor(Math.random() * 2) + 1;
                    break;
                case 'cycle':
                    stepIncrease = Math.floor(Math.random() * 40) + 15;
                    calIncrease = Math.floor(Math.random() * 3) + 1;
                    break;
                case 'swim':
                    stepIncrease = Math.floor(Math.random() * 35) + 12;
                    calIncrease = Math.floor(Math.random() * 4) + 1;
                    break;
            }
            
            steps += stepIncrease;
            cal += calIncrease;
            
            document.getElementById('steps').innerText = steps.toLocaleString();
            document.getElementById('cal').innerText = cal;
            
            const user = auth.currentUser;
            if (user) {
                db.ref('users/' + user.uid + '/stats').update({ 
                    steps: steps, 
                    cal: cal 
                });
            }
        }
    }, 1000);
}

// ==========================================
// Exercise එක නවත්වන්න - ආපහු click කළොත්
// ==========================================
// (ඉහත function එකම ආපහු click කළාම stop වෙනවා)
// ==========================================
// EXERCISE STOPWATCH - Start/Stop
// ==========================================
function startExercise(el, type) {
    // If already running -> Stop it
    if (el.classList.contains('running')) {
        // Stop
        el.classList.remove('running', 'active', type);
        if (el._stopwatchInterval) {
            clearInterval(el._stopwatchInterval);
        }
        const btn = el.querySelector('.exercise-btn');
        if (btn) btn.textContent = '▶ Start';
        return;
    }
    
    // පෙර exercise එක නවත්වන්න
    document.querySelectorAll('.dexc').forEach(ex => {
        ex.classList.remove('active', 'running', 'run', 'jump', 'cycle', 'swim');
        const sw = ex.querySelector('.stopwatch');
        if (sw && ex !== el) {
            sw.textContent = '00:00';
        }
        const btn = ex.querySelector('.exercise-btn');
        if (btn && ex !== el) {
            btn.textContent = '▶ Start';
        }
        if (ex._stopwatchInterval && ex !== el) {
            clearInterval(ex._stopwatchInterval);
        }
    });
    
    // Current exercise එකට active class දාන්න
    el.classList.add('active', type, 'running');
    
    // Button text change
    const btn = el.querySelector('.exercise-btn');
    if (btn) btn.textContent = '⏹ Stop';
    
    // Stopwatch start
    let seconds = 0;
    const stopwatchDisplay = el.querySelector('.stopwatch');
    if (stopwatchDisplay) {
        stopwatchDisplay.textContent = '00:00';
    }
    
    // Stats
    let steps = parseInt(document.getElementById('steps').innerText.replace(/,/g, '')) || 0;
    let cal = parseInt(document.getElementById('cal').innerText) || 0;
    
    // Stopwatch interval - update every second
    el._stopwatchInterval = setInterval(() => {
        seconds++;
        
        // Format: MM:SS
        const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');
        
        if (stopwatchDisplay) {
            stopwatchDisplay.textContent = mins + ':' + secs;
        }
        
        // Update stats every 5 seconds
        if (seconds % 5 === 0) {
            let stepIncrease = 0;
            let calIncrease = 0;
            
            switch(type) {
                case 'run':
                    stepIncrease = Math.floor(Math.random() * 50) + 20;
                    calIncrease = Math.floor(Math.random() * 3) + 1;
                    break;
                case 'jump':
                    stepIncrease = Math.floor(Math.random() * 30) + 10;
                    calIncrease = Math.floor(Math.random() * 2) + 1;
                    break;
                case 'cycle':
                    stepIncrease = Math.floor(Math.random() * 40) + 15;
                    calIncrease = Math.floor(Math.random() * 3) + 1;
                    break;
                case 'swim':
                    stepIncrease = Math.floor(Math.random() * 35) + 12;
                    calIncrease = Math.floor(Math.random() * 4) + 1;
                    break;
            }
            
            steps += stepIncrease;
            cal += calIncrease;
            
            document.getElementById('steps').innerText = steps.toLocaleString();
            document.getElementById('cal').innerText = cal;
            
            const user = auth.currentUser;
            if (user) {
                db.ref('users/' + user.uid + '/stats').update({ 
                    steps: steps, 
                    cal: cal 
                });
            }
        }
    }, 1000);
}
function loadDash() {
    const user = auth.currentUser;
    if (user) {
        const name = user.displayName || "User";
        document.getElementById('uname').innerText = name;
        document.getElementById('pname').value = name;
        document.getElementById('pemail').value = user.email || "";
        
        // Report එකෙහි User නම update කිරීම
        const rptUname = document.getElementById('rptUname');
        if (rptUname) rptUname.innerText = name + "'s Health Report";

        if (user.photoURL) {
            document.getElementById('uimg').src = user.photoURL;
            document.getElementById('pimg').src = user.photoURL;
        }
        
        db.ref('users/' + user.uid + '/stats').on('value', (snapshot) => {
            if (snapshot.val()) {
                document.getElementById('steps').innerText = (snapshot.val().steps || 0).toLocaleString();
                document.getElementById('bpm').innerText = snapshot.val().bpm || 72;
                document.getElementById('cal').innerText = snapshot.val().cal || 0;
            }
        });
    } else {
        document.getElementById('uname').innerText = "Guest";
        document.getElementById('pname').value = "Guest";
        document.getElementById('pemail').value = "guest@example.com";
        const rptUname = document.getElementById('rptUname');
        if (rptUname) rptUname.innerText = "Guest's Health Report";
    }
}
function toggleMobileMenu() {
    const navUl = document.querySelector('.nav ul');
    if (navUl) {
        navUl.classList.toggle('show');
    }
}
// ==========================================
// MOBILE NAV TOGGLE (Fixed)
// ==========================================
function toggleNav() {
    const dnav = document.getElementById('dnav');
    if (dnav) {
        dnav.classList.toggle('show');
    }
}

// Show/Hide Section Call
function showSection(sectionId) {
    document.querySelectorAll('.dsec').forEach(section => {
        section.style.display = 'none';
    });
    
    const target = document.getElementById(sectionId);
    if (target) {
        target.style.display = 'block';
    }
    
    document.querySelectorAll('.dlk').forEach(link => {
        link.classList.remove('act');
    });
    
    const clickedLink = document.querySelector(`.dlk[onclick="showSection('${sectionId}')"]`);
    if (clickedLink) {
        clickedLink.classList.add('act');
    }
    
    // Section එකක් Select කළ පසු Mobile Nav එක Close කරන්න
    const dnav = document.getElementById('dnav');
    if (dnav) {
        dnav.classList.remove('show');
    }
}
