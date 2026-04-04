const devBtn = document.getElementById("devBtn");
const devModal = document.getElementById("devModal");
const closeDev = document.getElementById("closeDev");

devBtn.onclick = () => {
    devModal.style.display = "block";
};

closeDev.onclick = () => {
    devModal.style.display = "none";
};

window.onclick = (e) => {
    if (e.target === devModal) {
        devModal.style.display = "none";
    }
};

// --- 1. Dummy JSON Database ---
// Easy to scale to 500+ by importing from an external JSON file
// const mcqDatabase = [
//     { id: 1, category: "Web Development", question: "What does HTML stand for?", options: ["Hyper Text Preprocessor", "Hyper Text Markup Language", "Hyper Text Multiple Language", "Hyper Tool Multi Language"], answer: 1 },
//     { id: 2, category: "Web Development", question: "Which CSS property controls the text size?", options: ["font-style", "text-size", "font-size", "text-style"], answer: 2 },
//     { id: 3, category: "Programming", question: "In JavaScript, which keyword is used to declare a constant?", options: ["var", "let", "const", "constant"], answer: 2 },
//     { id: 4, category: "Databases", question: "What does SQL stand for?", options: ["Structured Question Language", "Strong Question Language", "Structured Query Language", "Standard Query Language"], answer: 2 },
//     { id: 5, category: "Networking", question: "Which protocol is used to securely browse the web?", options: ["HTTP", "FTP", "HTTPS", "SMTP"], answer: 2 },
// ];

// Map your categories to their exact file paths
const categoryFiles = {
    "Web Development": "data/web-development.json",
    "Programming C++ / Java / Python": "data/programming_languages.json",
    "Data Structure and Algorithms": "data/data_structure_and_algorithm.json",
    "Computer Networks And Cloud Computing" : "data/cnAndCC.json",
    "Operating Systems": "data/operating_system.json",
    "Software Engineering": "data/software_engineering.json",
    "AI / Machine Learning and Data Analytics": "data/ai_ml_and_data_analytics.json",

    "Databases": "data/databases.json",
    "Problem Solving And Analytical Skills": "data/p_solving_and_analytical_skills.json",
    "Cyber Security": "data/cyber_security.json",
    "Mixed Categories":"data/combine.json"
};

// Keep your existing categories array for the UI

const categories = ["All",
     "Mixed Categories",
     "Web Development",
     "Operating Systems",
     "Software Engineering",
     "Data Structure and Algorithms",
     "Programming C++ / Java / Python", 
     "AI / Machine Learning and Data Analytics",
     "Problem Solving And Analytical Skills",
     "Computer Networks And Cloud Computing",
    "Cyber Security",
    "Databases",
];

// --- 2. State Management ---
let appState = {
    view: 'home', // home, categories, quiz, result, review
    mode: 'practice', // practice, mock
    currentQuestions: [],
    currentIndex: 0,
    score: 0,
    userAnswers: {} // { questionId: selectedOptionIndex }
};

// --- 3. Local Storage Handling ---
function saveProgress() {
    localStorage.setItem('nsct_progress', JSON.stringify(appState));
    const badge = document.getElementById('saved-progress-badge');
    badge.classList.remove('hidden');
    setTimeout(() => badge.classList.add('hidden'), 2000);
}

function loadProgress() {
    const saved = localStorage.getItem('nsct_progress');
    if (saved) {
        appState = JSON.parse(saved);
        render();
    }
}

// --- 4. View Rendering ---
const container = document.getElementById('app-container');

function render() {
    container.innerHTML = ''; // Clear container
    switch (appState.view) {
        case 'home': renderHome(); break;
        case 'categories': renderCategories(); break;
        case 'quiz': renderQuiz(); break;
        case 'result': renderResult(); break;
        case 'review': renderReview(); break;
    }
}

function renderHome() {
    container.innerHTML = `
        <div class="glass-card p-10 text-center animate-fade-in mt-10">
            <h2 class="text-4xl font-extrabold mb-4 text-white">Prepare for NSCT with <span class="text-orange-500">Confidence</span></h2>
            <p class="text-lg text-gray-300 mb-8">Practice 500+ MCQs, track your progress, and master your IT skills.</p>
            <div class="flex justify-center gap-4">
                <button onclick="startQuiz('All', 'mock')" class="btn-primary px-6 py-3 rounded-lg font-bold">Start Mock Test</button>
                <button onclick="changeView('categories')" class="btn-secondary px-6 py-3 rounded-lg font-bold">View Categories</button>
            </div>
            ${localStorage.getItem('nsct_progress') ? `<button onclick="loadProgress()" class="mt-6 text-sm text-yellow-400 hover:underline">Resume Previous Session</button>` : ''}
        </div>
    `;
}

function renderCategories() {
    let cards = categories.slice(1).map(cat => `
        <div class="glass-card p-6 flex flex-col items-center text-center hover:scale-105 transition-transform cursor-pointer" onclick="startQuiz('${cat}', 'practice')">
            <div class="text-4xl mb-3">📚</div>
            <h3 class="text-xl font-bold text-white mb-4">${cat}</h3>
            <button class="btn-secondary w-full py-2 rounded">Practice Quiz</button>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="mb-6 flex justify-between items-center">
            <h2 class="text-2xl font-bold text-yellow-400">Select a Category</h2>
            <button onclick="changeView('home')" class="text-gray-400 hover:text-white">← Back</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            ${cards}
        </div>
    `;
}

function renderQuiz() {
    const q = appState.currentQuestions[appState.currentIndex];
    const isAnswered = appState.userAnswers[q.id] !== undefined;

    let optionsHtml = q.options.map((opt, index) => {
        let btnClass = "option-btn w-full text-left p-4 rounded-lg border border-white/10 bg-white/5 mb-3";

        // Instant feedback for practice mode
        if (appState.mode === 'practice' && isAnswered) {
            if (index === q.answer) btnClass += " border-green-500 bg-green-500/20"; // Correct
            else if (index === appState.userAnswers[q.id]) btnClass += " border-red-500 bg-red-500/20"; // Wrong selected
        } else if (appState.userAnswers[q.id] === index) {
            btnClass += " option-selected"; // Just highlight selected for Mock
        }

        return `<button onclick="selectOption(${index})" class="${btnClass}" ${appState.mode === 'practice' && isAnswered ? 'disabled' : ''}>
            <span class="font-bold text-yellow-400 mr-2">${String.fromCharCode(65 + index)}.</span> ${opt}
        </button>`;
    }).join('');

    // container.innerHTML = `
    //     <div class="glass-card p-8">
    //         <div class="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
    //             <span class="text-sm text-gray-400">Question ${appState.currentIndex + 1} of ${appState.currentQuestions.length}</span>
    //             <span class="text-sm bg-blue-900 px-3 py-1 rounded-full text-yellow-400">${q.category} Mode: ${appState.mode}</span>
    //         </div>
    //         <h3 class="text-2xl font-semibold mb-6 text-white">${q.question}</h3>
    //         <div class="mb-8">${optionsHtml}</div>
            
    //         <div class="flex justify-between">
    //             <button onclick="prevQuestion()" class="px-6 py-2 rounded border border-white/20 hover:bg-white/10 ${appState.currentIndex === 0 ? 'invisible' : ''}">Previous</button>
    //             ${appState.currentIndex === appState.currentQuestions.length - 1
    //         ? `<button onclick="finishQuiz()" class="btn-primary px-6 py-2 rounded font-bold">Submit Quiz</button>`
    //         : `<button onclick="nextQuestion()" class="btn-primary px-6 py-2 rounded font-bold">Next Question</button>`}
    //         </div>
    //     </div>
    // `;
    // app.js - Inside renderQuiz()
    // Replace the current return/innerHTML block at the bottom of this function:

    container.innerHTML = `
        <div class="glass-card p-8">
            <div class="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <button onclick="changeView('home')" class="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-gray-300">🏠 Home</button>
                <span class="text-sm text-gray-400">Question ${appState.currentIndex + 1} of ${appState.currentQuestions.length}</span>
                <button onclick="finishQuiz()" class="text-xs bg-orange-600/50 hover:bg-orange-600 px-3 py-1 rounded text-white font-bold">Finish & Submit</button>
            </div>
            
            <h3 class="text-2xl font-semibold mb-6 text-white">${q.question}</h3>
            <div class="mb-8">${optionsHtml}</div>
            
            <div class="flex justify-between">
                <button onclick="prevQuestion()" class="px-6 py-2 rounded border border-white/20 hover:bg-white/10 ${appState.currentIndex === 0 ? 'invisible' : ''}">Previous</button>
                <button onclick="nextQuestion()" class="btn-primary px-6 py-2 rounded font-bold ${appState.currentIndex === appState.currentQuestions.length - 1 ? 'hidden' : ''}">Next Question</button>
            </div>
        </div>
    `;
}

// function renderResult() {
//     const total = appState.currentQuestions.length;
//     const percentage = Math.round((appState.score / total) * 100);

//     container.innerHTML = `
//         <div class="glass-card p-10 text-center max-w-2xl mx-auto">
//             <h2 class="text-3xl font-bold mb-6 text-white">Quiz Completed!</h2>
            
//             <div class="flex justify-center mb-8">
//                 <div class="circular-chart" style="--percentage: ${percentage}%">
//                     <div class="chart-content">${percentage}%</div>
//                 </div>
//             </div>

//             <div class="grid grid-cols-2 gap-4 mb-8 text-left">
//                 <div class="bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
//                     <p class="text-sm text-gray-400">Correct</p>
//                     <p class="text-2xl text-green-400 font-bold">${appState.score}</p>
//                 </div>
//                 <div class="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
//                     <p class="text-sm text-gray-400">Incorrect / Skipped</p>
//                     <p class="text-2xl text-red-400 font-bold">${total - appState.score}</p>
//                 </div>
//             </div>

//             <div class="flex justify-center gap-4">
//                 <button onclick="changeView('review')" class="btn-secondary px-6 py-3 rounded-lg">Review Answers</button>
//                 <button onclick="changeView('home')" class="btn-primary px-6 py-3 rounded-lg">Back to Home</button>
//             </div>
//         </div>
//     `;
//     localStorage.removeItem('nsct_progress'); // Clear save on completion
// }

// app.js - Inside renderResult()
function renderResult() {
    const { attempted, correct, incorrect } = appState.results;
    const total = appState.currentQuestions.length;
    const percentage = Math.round((correct / total) * 100);

    container.innerHTML = `
        <div class="glass-card p-10 text-center max-w-2xl mx-auto">
            <h2 class="text-3xl font-bold mb-6 text-white">Quiz Summary</h2>
            
            <div class="flex justify-center mb-8">
                <div class="circular-chart" style="--percentage: ${percentage}%">
                    <div class="chart-content">${percentage}%</div>
                </div>
            </div>

            <div class="grid grid-cols-3 gap-3 mb-8 text-left">
                <div class="bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg text-center">
                    <p class="text-xs text-gray-400">Attempted</p>
                    <p class="text-xl text-blue-400 font-bold">${attempted}</p>
                </div>
                <div class="bg-green-500/10 border border-green-500/30 p-3 rounded-lg text-center">
                    <p class="text-xs text-gray-400">Correct</p>
                    <p class="text-xl text-green-400 font-bold">${correct}</p>
                </div>
                <div class="bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-center">
                    <p class="text-xs text-gray-400">False</p>
                    <p class="text-xl text-red-400 font-bold">${incorrect}</p>
                </div>
            </div>

            <div class="flex flex-col gap-3">
                <button onclick="changeView('review')" class="btn-secondary w-full py-3 rounded-lg font-bold">Review Detailed Answers</button>
                <button onclick="changeView('home')" class="text-gray-400 hover:text-white transition">Return to Home</button>
            </div>
        </div>
    `;
    localStorage.removeItem('nsct_progress');
}






function renderReview() {
    let reviewHtml = appState.currentQuestions.map((q, i) => {
        const userAns = appState.userAnswers[q.id];
        const isCorrect = userAns === q.answer;

        return `
            <div class="glass-card p-6 mb-4 border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}">
                <h4 class="text-lg font-bold mb-3 text-white">${i + 1}. ${q.question}</h4>
                <p class="text-sm mb-1 ${isCorrect ? 'text-green-400' : 'text-red-400'}">
                    Your Answer: ${userAns !== undefined ? q.options[userAns] : 'Skipped'}
                </p>
                ${!isCorrect ? `<p class="text-sm text-green-400">Correct Answer: ${q.options[q.answer]}</p>` : ''}
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="mb-6 flex justify-between items-center">
            <h2 class="text-2xl font-bold text-yellow-400">Review Answers</h2>
            <button onclick="changeView('result')" class="text-gray-400 hover:text-white">← Back to Results</button>
        </div>
        ${reviewHtml}
    `;
}

// --- 5. Application Logic ---
function changeView(view) {
    appState.view = view;
    render();
}

// function startQuiz(category, mode) {
//     let filtered = category === 'All' ? mcqDatabase : mcqDatabase.filter(q => q.category === category);

//     // Shuffle and pick max 100 for mock test, or all available
//     filtered = filtered.sort(() => 0.5 - Math.random()).slice(0, mode === 'mock' ? 100 : filtered.length);

//////////////// New startQuiz with dynamic loading from JSON files



async function startQuiz(category, mode) {
    // 1. Show a loading indicator while fetching
    container.innerHTML = `
        <div class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
        </div>
    `;

    let fetchedQuestions = [];

    try {
        if (category === 'All') {
            // Fetch ALL files simultaneously for the Mock Test
            const fetchPromises = Object.values(categoryFiles).map(path => fetch(path).then(res => res.json()));
            const allData = await Promise.all(fetchPromises);
            fetchedQuestions = allData.flat(); // Combine all arrays into one
        } else {
            // Fetch just the specific category file
            const response = await fetch(categoryFiles[category]);
            if (!response.ok) throw new Error("Network response was not ok");
            fetchedQuestions = await response.json();
        }

        // 2. Shuffle and pick questions (100 for mock, all for practice)
        fetchedQuestions = fetchedQuestions
            .sort(() => 0.5 - Math.random())
            .slice(0, mode === 'mock' ? 100 : fetchedQuestions.length);

        // 3. Update state and render the quiz
        appState = {
            view: 'quiz',
            mode: mode,
            currentQuestions: fetchedQuestions,
            currentIndex: 0,
            score: 0,
            userAnswers: {}
        };
        saveProgress();
        render();

    } catch (error) {
        console.error("Error loading questions:", error);
        container.innerHTML = `
            <div class="glass-card p-8 text-center">
                <h2 class="text-2xl text-red-500 font-bold mb-4">Error Loading Questions</h2>
                <p class="text-gray-300 mb-6">Make sure you are running a local server and the JSON files exist.</p>
                <button onclick="changeView('home')" class="btn-primary px-6 py-2 rounded">Go Back</button>
            </div>
        `;
    }
}







////////////////////////

//     appState = {
//         view: 'quiz',
//         mode: mode,
//         currentQuestions: filtered,
//         currentIndex: 0,
//         score: 0,
//         userAnswers: {}
//     };
//     saveProgress();
//     render();
// }

function selectOption(index) {
    const q = appState.currentQuestions[appState.currentIndex];

    // Prevent changing answer in practice mode
    if (appState.mode === 'practice' && appState.userAnswers[q.id] !== undefined) return;

    appState.userAnswers[q.id] = index;
    saveProgress();
    render();
}

function nextQuestion() {
    if (appState.currentIndex < appState.currentQuestions.length - 1) {
        appState.currentIndex++;
        render();
    }
}

function prevQuestion() {
    if (appState.currentIndex > 0) {
        appState.currentIndex--;
        render();
    }
}



// app.js - Around Line 235
function finishQuiz() {
    let attempted = Object.keys(appState.userAnswers).length;
    let correct = 0;
    let incorrect = 0;

    appState.currentQuestions.forEach(q => {
        const userAns = appState.userAnswers[q.id];
        if (userAns !== undefined) {
            if (userAns === q.answer) {
                correct++;
            } else {
                incorrect++;
            }
        }
    });

    // Save these results to state so the Result page can see them
    appState.results = { attempted, correct, incorrect };
    changeView('result');
}

// function finishQuiz() {
//     // Calculate Score
//     appState.score = 0;
//     appState.currentQuestions.forEach(q => {
//         if (appState.userAnswers[q.id] === q.answer) {
//             appState.score++;
//         }
//     });
//     changeView('result');
// }

// Initialize App
render();




// theme changing.......


// --- Theme Toggle Logic ---
const themeBtn = document.getElementById('theme-toggle');

// Check local storage so it remembers the user's preference
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
}

themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');

    // Save preference to local storage
    if (document.body.classList.contains('light-mode')) {
        localStorage.setItem('theme', 'light');
    } else {
        localStorage.setItem('theme', 'dark');
    }
});