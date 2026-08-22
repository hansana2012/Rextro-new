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

// Firebase services used by the existing dashboard.
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.database();

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

// ==========================================
// REXTRO AI AGENT - Firebase AI Logic
// ==========================================
let rextroAIChat = null;
let rextroAIInitialized = false;

function showSection(sectionId) {
    document.querySelectorAll('.dsec').forEach(section => {
        section.style.display = 'none';
    });

    const target = document.getElementById(sectionId);
    if (target) target.style.display = 'block';

    document.querySelectorAll('.dnav .dlk').forEach(link => {
        link.classList.remove('act');
        const onclick = link.getAttribute('onclick') || '';
        if (onclick.includes("'" + sectionId + "'") || onclick.includes('"' + sectionId + '"')) {
            link.classList.add('act');
        }
    });

    if (window.innerWidth <= 768) {
        document.getElementById('dnav')?.classList.remove('show');
    }
}

function getDashboardStatsForAI() {
    return {
        steps: parseInt(document.getElementById('steps')?.innerText?.replace(/,/g, ''), 10) || 0,
        bpm: parseInt(document.getElementById('bpm')?.innerText, 10) || 0,
        calories: parseInt(document.getElementById('cal')?.innerText, 10) || 0
    };
}

function addAiMessage(text, type = 'bot') {
    const chat = document.getElementById('aiChat');
    if (!chat) return null;

    const wrapper = document.createElement('div');
    wrapper.className = 'ai-message ai-message-' + type;

    const avatar = document.createElement('div');
    avatar.className = 'ai-avatar';
    avatar.innerHTML = type === 'user'
        ? '<i class="fa-solid fa-user"></i>'
        : '<i class="fa-solid fa-robot"></i>';

    const bubble = document.createElement('div');
    bubble.className = 'ai-bubble';

    if (type === 'bot') {
        const strong = document.createElement('strong');
        strong.textContent = 'Rextro AI';
        bubble.appendChild(strong);
    }

    const p = document.createElement('p');
    p.textContent = text;
    bubble.appendChild(p);
    wrapper.append(avatar, bubble);
    chat.appendChild(wrapper);
    chat.scrollTop = chat.scrollHeight;
    return p;
}

function useAiPrompt(prompt) {
    const input = document.getElementById('aiInput');
    if (!input) return;
    input.value = prompt;
    input.focus();
    input.dispatchEvent(new Event('input'));
}

function autoResizeAiInput() {
    const input = document.getElementById('aiInput');
    if (!input) return;
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 130) + 'px';
}

function setAiLoading(loading) {
    const btn = document.getElementById('aiSendBtn');
    const input = document.getElementById('aiInput');
    if (btn) {
        btn.disabled = loading;
        btn.innerHTML = loading
            ? '<i class="fa-solid fa-spinner fa-spin"></i>'
            : '<i class="fa-solid fa-paper-plane"></i>';
    }
    if (input) input.disabled = loading;
}

async function runDashboardTool(name, args) {
    switch (name) {
        case 'openDashboardSection': {
            const allowed = ['home', 'prof', 'exer', 'meds', 'ocr', 'hist', 'repo', 'ai'];
            if (!allowed.includes(args.section)) return { ok: false, error: 'Section is not allowed.' };
            showSection(args.section);
            return { ok: true, opened: args.section };
        }

        case 'getDashboardStats':
            return { ok: true, ...getDashboardStatsForAI() };

        case 'setMedicineReminder': {
            const time = String(args.time || '').trim();
            if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
                return { ok: false, error: 'Time must use HH:MM format.' };
            }
            const input = document.getElementById('medtime');
            const status = document.getElementById('remstat');
            if (!input || !status) return { ok: false, error: 'Medicine reminder UI is unavailable.' };
            input.value = time;
            status.innerText = 'Reminder set for ' + time;
            return { ok: true, reminderTime: time };
        }

        default:
            return { ok: false, error: 'Unknown dashboard tool.' };
    }
}

async function sendAiMessage(message) {
    if (!rextroAIInitialized || !window.rextroGeminiModel) {
        throw new Error('Firebase AI Logic is not ready. Check Firebase AI Logic setup and App Check.');
    }

    const currentUser = window.firebase?.auth?.().currentUser;
    if (!currentUser) {
        throw new Error('Please log in with Firebase Authentication before using Rextro AI.');
    }

    if (!rextroAIChat) {
        rextroAIChat = window.rextroGeminiModel.startChat();
    }

    const stats = getDashboardStatsForAI();
    const userName = document.getElementById('uname')?.innerText || 'User';
    const prompt = `
You are Rextro AI, the assistant inside the user's dashboard.
User: ${userName}
Current dashboard values: Steps=${stats.steps}, BPM=${stats.bpm}, Calories=${stats.calories}.
You can use dashboard tools when the user asks you to perform a supported action.
Never invent dashboard values. For health questions, provide general information only and encourage a trusted adult or qualified healthcare professional for serious concerns.
User request: ${message}
`;

    let result = await rextroAIChat.sendMessage(prompt);

    // Gemini may ask the browser to execute one or more dashboard functions.
    for (let round = 0; round < 4; round++) {
        const functionCalls = result.response.functionCalls();
        if (!functionCalls || functionCalls.length === 0) {
            return result.response.text();
        }

        const responses = [];
        for (const call of functionCalls) {
            const toolResult = await runDashboardTool(call.name, call.args || {});
            responses.push({
                functionResponse: {
                    name: call.name,
                    response: toolResult
                }
            });
        }

        result = await rextroAIChat.sendMessage(responses);
    }

    return result.response.text() || 'Done.';
}

async function handleAiSubmit(event) {
    event.preventDefault();
    const input = document.getElementById('aiInput');
    if (!input) return;

    const message = input.value.trim();
    if (!message) return;

    addAiMessage(message, 'user');
    input.value = '';
    autoResizeAiInput();
    setAiLoading(true);

    const loading = addAiMessage('Thinking...', 'bot');

    try {
        const answer = await sendAiMessage(message);
        if (loading) loading.textContent = answer;
    } catch (error) {
        console.error('Rextro AI error:', error);
        if (loading) loading.textContent = error.message;
    } finally {
        setAiLoading(false);
        input.focus();
    }
}

function initRextroAI() {
    if (rextroAIInitialized) return;
    rextroAIInitialized = !!window.rextroAIReady && !!window.rextroGeminiModel;

    const form = document.getElementById('aiForm');
    const input = document.getElementById('aiInput');
    form?.addEventListener('submit', handleAiSubmit);
    input?.addEventListener('input', autoResizeAiInput);
    input?.addEventListener('keydown', event => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            form?.requestSubmit();
        }
    });
}

window.addEventListener('rextro-ai-ready', initRextroAI);
document.addEventListener('DOMContentLoaded', () => {
    // Module scripts are deferred, so this may run before the AI bootstrap.
    if (window.rextroAIReady) initRextroAI();
    showSection('home');
});
