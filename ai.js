/* REXTRO AI AGENT - Gemini API */
const GEMINI_API_KEY = "AQ.Ab8RN6Ju7NoUsyB0UsFPtwD7b_UpSm7zZ8N4Ktx8W3sJIJJzug";
const GEMINI_MODEL = "gemini-3.6-flash";
const GEMINI_ENDPOINT =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

let aiHistory = [];

function getDashboardContext() {
    const name = document.getElementById("uname")?.innerText || "User";
    const steps = document.getElementById("steps")?.innerText || "0";
    const bpm = document.getElementById("bpm")?.innerText || "72";
    const cal = document.getElementById("cal")?.innerText || "0";
    return `User name: ${name}\nDashboard steps: ${steps}\nDashboard BPM: ${bpm}\nDashboard calories: ${cal}`;
}

function addAiMessage(text, type = "bot") {
    const chat = document.getElementById("aiChat");
    if (!chat) return null;

    const wrapper = document.createElement("div");
    wrapper.className = `ai-message ai-message-${type}`;

    const avatar = document.createElement("div");
    avatar.className = "ai-avatar";
    avatar.innerHTML = type === "user"
        ? '<i class="fa-solid fa-user"></i>'
        : '<i class="fa-solid fa-robot"></i>';

    const bubble = document.createElement("div");
    bubble.className = "ai-bubble";

    if (type === "bot") {
        const strong = document.createElement("strong");
        strong.textContent = "Rextro AI";
        bubble.appendChild(strong);
    }

    const p = document.createElement("p");
    p.textContent = text;
    bubble.appendChild(p);

    wrapper.append(avatar, bubble);
    chat.appendChild(wrapper);
    chat.scrollTop = chat.scrollHeight;
    return p;
}

function setAiLoading(loading) {
    const button = document.getElementById("aiSendBtn");
    const input = document.getElementById("aiInput");

    if (button) {
        button.disabled = loading;
        button.innerHTML = loading
            ? '<i class="fa-solid fa-spinner fa-spin"></i>'
            : '<i class="fa-solid fa-paper-plane"></i>';
    }
    if (input) input.disabled = loading;
}

function useAiPrompt(prompt) {
    const input = document.getElementById("aiInput");
    if (!input) return;
    input.value = prompt;
    input.focus();
    input.dispatchEvent(new Event("input"));
}

function autoResizeAiInput() {
    const input = document.getElementById("aiInput");
    if (!input) return;
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 130) + "px";
}

async function sendToGemini(userText) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "PASTE_YOUR_GEMINI_API_KEY_HERE") {
        throw new Error("Gemini API key is not configured. Add your key in ai.js.");
    }

    const systemInstruction = `
You are Rextro AI, a friendly assistant inside the Rextro health dashboard.
Be concise, clear, supportive, and easy to understand.
Use dashboard context when relevant and never invent dashboard data.
Give general wellness information, not diagnoses.
For serious or urgent health concerns, recommend speaking with a trusted adult or qualified healthcare professional.
Do not claim to replace a doctor.

Current dashboard context:
${getDashboardContext()}
`;

    const contents = [
        { role: "user", parts: [{ text: systemInstruction }] },
        ...aiHistory,
        { role: "user", parts: [{ text: userText }] }
    ];

    const response = await fetch(GEMINI_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": GEMINI_API_KEY
        },
        body: JSON.stringify({
            contents,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 900
            }
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.error?.message || `Gemini request failed (${response.status})`);
    }

    const answer = data?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("")
        .trim();

    if (!answer) throw new Error("Gemini returned an empty response.");

    aiHistory.push(
        { role: "user", parts: [{ text: userText }] },
        { role: "model", parts: [{ text: answer }] }
    );

    if (aiHistory.length > 12) aiHistory = aiHistory.slice(-12);
    return answer;
}

async function handleAiSubmit(event) {
    event.preventDefault();

    const input = document.getElementById("aiInput");
    if (!input) return;

    const text = input.value.trim();
    if (!text) return;

    addAiMessage(text, "user");
    input.value = "";
    autoResizeAiInput();
    setAiLoading(true);

    const loadingText = addAiMessage("Thinking...", "bot");

    try {
        const answer = await sendToGemini(text);
        if (loadingText) loadingText.textContent = answer;
    } catch (error) {
        console.error("Rextro AI error:", error);
        if (loadingText) {
            loadingText.textContent = "I couldn't connect to Gemini. " + error.message;
        }
    } finally {
        setAiLoading(false);
        input.focus();
    }
}

/* The supplied dashboard did not contain showSection(), so this fallback
   keeps the sidebar navigation working. */
if (typeof window.showSection !== "function") {
    window.showSection = function(sectionId) {
        document.querySelectorAll(".dsec").forEach(section => {
            section.style.display = "none";
        });

        const target = document.getElementById(sectionId);
        if (target) target.style.display = "block";

        document.querySelectorAll(".dnav .dlk").forEach(link => {
            link.classList.remove("act");
            const onclick = link.getAttribute("onclick") || "";
            if (onclick.includes(`'${sectionId}'`) || onclick.includes(`"${sectionId}"`)) {
                link.classList.add("act");
            }
        });

        if (window.innerWidth <= 768) {
            document.getElementById("dnav")?.classList.remove("show");
        }
    };
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("aiForm");
    const input = document.getElementById("aiInput");

    form?.addEventListener("submit", handleAiSubmit);
    input?.addEventListener("input", autoResizeAiInput);

    input?.addEventListener("keydown", event => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            form?.requestSubmit();
        }
    });
});
