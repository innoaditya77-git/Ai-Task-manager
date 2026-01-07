// --- STEP 1: Sabhi zaroori cheezon ka address pakadna ---
const input = document.querySelector("#taskInput"); // Type karne wala box
const addBtn = document.querySelector(".add-btn"); // Add Button
const allLists = document.querySelectorAll(".task-list"); // Teeno columns ki lists
const aiBtn = document.querySelector(".ai-btn"); // AI Button (sirf ek baar declare)

// --- Local Storage Save Function ---
function saveToLocal() {
    let taskArray = [];

    document.querySelectorAll(".task-card").forEach(card => {
        taskArray.push({
            text: card.querySelector("p").innerText,
            status: card.closest(".column").id
        });
    });

    localStorage.setItem("myGenieTasks", JSON.stringify(taskArray));
}

// --- Page Load par Local Storage se Data uthao ---
window.onload = () => {
    const savedData = localStorage.getItem("myGenieTasks");
    if (savedData) {
        const tasks = JSON.parse(savedData);
        tasks.forEach(t => {
            createTask(t.text, t.status);
        });
    }
};

// --- Task Create Function ---
function createTask(text, columnId = "todo") {
    const card = document.createElement("div");
    card.classList.add("task-card");
    card.setAttribute("draggable", "true");

    card.innerHTML = `
        <p>${text}</p>
        <button class="delete-btn">Delete</button>
    `;

    // Delete Button
    card.querySelector(".delete-btn").addEventListener("click", () => {
        card.remove();
        saveToLocal();
    });

    // Dragging Events
    card.addEventListener("dragstart", () => {
        card.classList.add("dragging");
    });

    card.addEventListener("dragend", () => {
        card.classList.remove("dragging");
        saveToLocal();
    });

    const targetList = document.querySelector(`#${columnId} .task-list`);
    targetList.appendChild(card);
    saveToLocal();
}

// --- Add Button Click ---
addBtn.addEventListener("click", () => {
    if (input.value === "") {
        alert("⚠️ Task likhna zaroori hai!");
        return;
    }
    createTask(input.value);
    input.value = "";
});

// --- Drag & Drop Logic ---
allLists.forEach(list => {
    list.addEventListener("dragover", (e) => {
        e.preventDefault();
        const draggingCard = document.querySelector(".dragging");
        list.appendChild(draggingCard);
    });
});

const API_URL = "https://api.groq.com/openai/v1/chat/completions";
let apiKey = localStorage.getItem("groq_api_key") || "";

aiBtn.addEventListener("click", async () => {
    const taskInput = document.getElementById("taskInput"); 
    const taskValue = taskInput.value.trim();

    // 1. Agar input khali hai
    if (!taskValue) {
        alert("⚠️ Task likhna zaroori hai!");
        return;
    }

    // 2. Agar API key nahi hai
    if (!apiKey) {
        alert("⚠️ API Key missing hai! Pehle apni Groq API Key daalo.");
        const userKey = prompt(" AI Suggestions ke liye apni Groq API Key daalein:\n(Ye aapke browser mein safe rahegi)");
        if (userKey && userKey.trim() !== "") {
            apiKey = userKey.trim();
            localStorage.setItem("groq_api_key", apiKey);
        } else {
            // Agar user cancel kare ya blank key de to alert aur stop
            alert(" API Key provide nahi ki gayi. AI Suggestion use karne ke liye key zaroori hai.");
            return;
        }
    }

    try {
        aiBtn.innerText = "Thinking...";
        aiBtn.disabled = true;

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama3-8b-8192",
                messages: [{
                    role: "user",
                    content: `Give a very short 1-sentence expert tip for this task: ${taskValue}`
                }]
            })
        });

        const data = await response.json();

        if (data.error) {
            localStorage.removeItem("groq_api_key");
            apiKey = "";
            alert(" API Key galat hai ya expire ho gayi. Dobara try karo!");
        } else {
            // Safe parsing
            const aiResponse = data?.choices?.[0]?.message?.content || "Tip not available";
            createTask(`💡 AI Tip: ${aiResponse}`, "doing");
            saveToLocal();
            taskInput.value = "";
        }

    } catch (error) {
        console.error("Error:", error);
        alert(" Internet issue ya API error!");
    } finally {
        aiBtn.innerText = "AI Suggestion";
        aiBtn.disabled = false;
    }
});
