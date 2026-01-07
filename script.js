// --- STEP 1: Sabhi zaroori cheezon ka address pakadna ---
const input = document.querySelector("#taskInput"); // Type karne wala box
const addBtn = document.querySelector(".add-btn"); // Add Button
const allLists = document.querySelectorAll(".task-list"); // Teeno columns ki lists
const aiBtn = document.querySelector(".ai-btn");
function saveToLocal() {
    let taskArray = []; // Ek khali array (jhola) banaya
    
    // Page par maujood har '.task-card' par jaao
    document.querySelectorAll(".task-card").forEach(card => {
        taskArray.push({
            text: card.querySelector("p").innerText, // Card ka text uthaya
            status: card.closest(".column").id       // Card kis column (todo/doing/done) mein hai
        });
    });

    // List ko text (String) mein badalkar 'myGenieTasks' naam se save kar diya
    localStorage.setItem("myGenieTasks", JSON.stringify(taskArray));
}

window.onload = () => {
    const savedData = localStorage.getItem("myGenieTasks"); // Diary kholi
    if (savedData) {
        const tasks = JSON.parse(savedData); // Text ko wapas list banaya
        
        // List ke har ek item (t) ke liye screen par card dubara banaya
        tasks.forEach(t => {
            createTask(t.text, t.status); // t.text = kaam ka naam, t.status = column ka naam
        });
    }
};




function createTask(text, columnId = "todo") {
    const card = document.createElement("div"); // Khali div banaya
    card.classList.add("task-card");            // CSS class lagayi
    card.setAttribute("draggable", "true"); 
       // Drag karne ki power di

    // Card ke andar ka button aur text set kiya
    card.innerHTML = `
        <p>${text}</p>
        <button class="delete-btn">Delete</button>
    `;

    // DELETE BUTTON KA KAAM: Card hatana aur diary update karna
    card.querySelector(".delete-btn").addEventListener("click", () => {
        card.remove(); 
        saveToLocal(); // Diary se bhi mitao
    });

    // DRAG START: Jab card pakda jaye (Sticker lagao)
    card.addEventListener("dragstart", () => {
        card.classList.add("dragging");
    });

    // DRAG END: Jab card chhod diya jaye (Sticker hatao aur Diary save karo)
    card.addEventListener("dragend", () => {
        card.classList.remove("dragging");
        saveToLocal(); // Nayi position diary mein save karo
    });

     const targetList = document.querySelector(`#${columnId} .task-list`);
    targetList.appendChild(card);
    saveToLocal();

}





addBtn.addEventListener("click",(e)=>{
if(input.value =="") return;

createTask(input.value);


})

// --- STEP 6: DRAG & DROP ZONE (Columns ka rasta saaf karna) ---
allLists.forEach(list => {
    list.addEventListener("dragover", (e) => {
        e.preventDefault(); // Browser ki rukawat ko band kiya (taaki drop ho sake)
        const draggingCard = document.querySelector(".dragging"); // Sticker wala card pakda
        list.appendChild(draggingCard); // Use naye list/column mein shift kiya
    });
});


async function getAISuggestion(taskText) {
    // 1. Apni NAYI API key yahan dalo
    const apiKey = ""; 
    const url = "";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                // MAINE MODEL BADAL DIYA HAI - Ye wala abhi chal raha hai
                model: "llama-3.3-70b-versatile", 
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant. Give 3-5 short steps in Hindi but not in devnagri hindi , mtlab english me likha hua lekin hindi explanation."
                    },
                    {
                        role: "user",
                        content: `Task: ${taskText}`
                    }
                ]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("Groq Error:", data.error.message);
            return "AI Error: " + data.error.message;
        }

        return data.choices[0].message.content;

    } catch (error) {
        console.error("Lafda ho gaya:", error);
        return "AI connect nahi ho pa raha!";
    }
}
// AI Button Click
aiBtn.addEventListener("click", async () => {
    // 1. Check karo ki input khali toh nahi hai
    const taskValue = input.value.trim();
    if (!taskValue) return alert("Pehle kuch likho!");

    // 2. AI se suggestion lo (Is baar hum naya task add nahi kar rahe)
    const suggestion = await getAISuggestion(taskValue);

    // 3. Jo 5 points (data) mile, unka ek naya card banao "Doing" column ke liye
    createTask("💡 AI Plan: " + suggestion, "doing"); 
    
    input.value = ""; // Input saaf kar do
    saveToLocal();    // Diary mein save kar lo
});