// =============================
// STATE VARIABLES
// =============================
let currentLevel = 'beginner';
let currentDuration = 90;
let timeLeft = 90;
let timerInterval = null;
let timerRunning = false;
let topicHistory = [];
// Load speeches from localstorage or empty array
let speeches = JSON.parse(localStorage.getItem('speechTracker')) || [];

// =============================
// DATABASES
// =============================
const topics = {
    beginner: [
        "Describe your morning routine.",
        "Your favorite childhood memory.",
        "A person who inspired you.",
        "Your favorite book and why.",
        "A hobby you enjoy."
    ],
    intermediate: [
        "A failure that taught you something.",
        "Technology: help or harm?",
        "The importance of discipline.",
        "Is remote work the future?",
        "How to handle constructive criticism."
    ],
    advanced: [
        "Is success luck or effort?",
        "Should AI replace human jobs?",
        "What defines true leadership?",
        "The ethical limits of scientific research.",
        "How do we combat global climate change effectively?"
    ]
};

const tips = [
    {
        title: "The Power of Pause",
        desc: "Don't rush to fill the silence. A well-placed pause builds anticipation and gives your audience time to absorb your message.",
        icon: "pause-circle"
    },
    {
        title: "Eye Contact",
        desc: "Scan the room, but lock eyes with individuals for at least 3-5 seconds to build a genuine connection.",
        icon: "eye"
    },
    {
        title: "Vocal Variety",
        desc: "Avoid speaking in a monotone. Vary your pitch, pace, and volume to emphasize key points and keep the audience engaged.",
        icon: "mic"
    },
    {
        title: "Body Language",
        desc: "Use open gestures. Move with purpose rather than pacing aimlessly. Let your body emphasize your words.",
        icon: "user"
    },
    {
        title: "Structure is King",
        desc: "Every speech needs a clear beginning, middle, and end. Tell them what you will say, say it, then tell them what you said.",
        icon: "layers"
    },
    {
        title: "Eliminate Filler Words",
        desc: "A pause is always better than 'um', 'ah', or 'you know'. Record yourself to catch and eliminate these fillers.",
        icon: "mic-off"
    }
];

const words = [
    { 
        word: "Perspicacious", 
        pos: "adjective",
        pronunciation: "/ˌpər-spə-ˈkā-shəs/",
        def: "Having a ready insight into and understanding of things; sharp-witted.",
        synonyms: "shrewd, perceptive, astute",
        example: "The perspicacious detective quickly saw through the suspect's alibi."
    },
    { 
        word: "Eloquent", 
        pos: "adjective",
        pronunciation: "/ˈel-ə-kwənt/",
        def: "Fluent or persuasive in speaking or writing.",
        synonyms: "articulate, fluent, expressive",
        example: "She delivered an eloquent tribute to her mentor."
    },
    { 
        word: "Resilient", 
        pos: "adjective",
        pronunciation: "/ri-ˈzil-yənt/",
        def: "Able to withstand or recover quickly from difficult conditions.",
        synonyms: "tough, adaptable, strong",
        example: "The resilient community rebuilt the town after the devastating flood."
    },
    { 
        word: "Tenacious", 
        pos: "adjective",
        pronunciation: "/tə-ˈnā-shəs/",
        def: "Tending to keep a firm hold of something; clinging or adhering closely.",
        synonyms: "determined, persistent, steadfast",
        example: "With tenacious determination, the runner finished the marathon despite her injury."
    },
    { 
        word: "Grandiloquent", 
        pos: "adjective",
        pronunciation: "/gran-ˈdi-lə-kwənt/",
        def: "Pompous or extravagant in language, style, or manner.",
        synonyms: "pretentious, magniloquent, bombastic",
        example: "The politician's grandiloquent speech lacked any real substance."
    }
];
let wordIndex = 0;


// =============================
// TAB SWITCHING
// =============================
function switchTab(tab, btn) {
    document.querySelectorAll('.practice-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.ptab').forEach(b => b.classList.remove('active'));

    document.getElementById('panel-' + tab).classList.add('active');
    btn.classList.add('active');
}

// =============================
// LEVEL & TIMER
// =============================
function setLevel(level, btn) {
    currentLevel = level;
    document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function setDuration(seconds, btn) {
    currentDuration = seconds;
    timeLeft = seconds;

    document.querySelectorAll('.timer-preset').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    resetTimer();
}

function startTimer() {
    if (timerRunning) return;

    timerRunning = true;
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('pauseBtn').style.display = 'flex';
    document.getElementById('timerStatus').textContent = "Running";
    document.getElementById('timerStatus').style.color = "var(--accent)";

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerRunning = false;
            document.getElementById('timerStatus').textContent = "Time's Up!";
            document.getElementById('timerStatus').style.color = "var(--danger)";
            document.getElementById('pauseBtn').style.display = 'none';
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerRunning = false;

    document.getElementById('startBtn').style.display = 'flex';
    document.getElementById('pauseBtn').style.display = 'none';
    document.getElementById('timerStatus').textContent = "Paused";
    document.getElementById('timerStatus').style.color = "var(--warning)";
}

function resetTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    timeLeft = currentDuration;

    updateTimerDisplay();

    document.getElementById('startBtn').style.display = 'flex';
    document.getElementById('pauseBtn').style.display = 'none';
    document.getElementById('timerStatus').textContent = "Ready";
    document.getElementById('timerStatus').style.color = "var(--text-muted)";
}

function updateTimerDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    document.getElementById('timerDisplay').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
}

// =============================
// GENERATE TOPIC
// =============================
function generateTopic() {
    let pool = [];

    if (currentLevel === 'all') {
        pool = [...topics.beginner, ...topics.intermediate, ...topics.advanced];
    } else {
        pool = topics[currentLevel];
    }

    const topic = pool[Math.floor(Math.random() * pool.length)];

    topicHistory.unshift(topic);
    if (topicHistory.length > 5) topicHistory.pop();

    document.getElementById('topicCard').innerHTML = `
        <div>
            <div class="topic-text">${topic}</div>
            <p style="color: var(--text-muted); margin-top: 16px; font-size: 0.9rem;">
                <i data-lucide="brain" style="width: 16px; height: 16px; display: inline-block; vertical-align: middle;"></i> 
                Think for 30 seconds, then start speaking.
            </p>
        </div>
    `;

    renderHistory();
    resetTimer();
    lucide.createIcons();
}

function renderHistory() {
    const historyBox = document.getElementById('topicHistory');
    const list = document.getElementById('historyList');

    historyBox.style.display = 'block';

    list.innerHTML = topicHistory.map((t, i) => `
        <div class="history-item">
            ${t}
        </div>
    `).join('');
}

// =============================
// SPEECH TRACKER
// =============================
function toggleSpeechForm() {
    const form = document.getElementById('speechForm');
    form.style.display = form.style.display === 'block' ? 'none' : 'block';
}

function addSpeech() {
    const title = document.getElementById('sfTitle').value.trim();
    const role = document.getElementById('sfRole').value;
    const path = document.getElementById('sfPath').value.trim();
    const date = document.getElementById('sfDate').value;
    const score = document.getElementById('sfScore').value;

    if (!title) {
        alert("Please enter a speech title.");
        return;
    }

    speeches.unshift({ 
        id: Date.now(),
        title, 
        role, 
        path, 
        date: date || new Date().toISOString().split('T')[0],
        score: score || 'N/A'
    });
    
    // Save to local storage
    localStorage.setItem('speechTracker', JSON.stringify(speeches));
    
    renderSpeeches();

    // Reset Form
    document.getElementById('sfTitle').value = '';
    document.getElementById('sfPath').value = '';
    document.getElementById('sfDate').value = '';
    document.getElementById('sfScore').value = '';
    
    toggleSpeechForm();
}

window.deleteSpeech = function(id) {
    if(confirm('Delete this record?')) {
        speeches = speeches.filter(s => s.id !== id);
        localStorage.setItem('speechTracker', JSON.stringify(speeches));
        renderSpeeches();
    }
}

function renderSpeeches() {
    const grid = document.getElementById('speechesGrid');

    if (speeches.length === 0) {
        grid.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 40px; background: rgba(255,255,255,0.02); border-radius: 12px;">
                <i data-lucide="inbox" style="width: 48px; height: 48px; opacity: 0.5; margin-bottom: 16px;"></i>
                <p>No speeches logged yet. Log your first speech above!</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    grid.innerHTML = speeches.map((s) => `
        <div class="speech-card">
            <div class="speech-card-header">
                <div>
                    <div class="speech-card-title">${s.title}</div>
                    <div style="color: var(--primary); font-size: 0.85rem; font-weight: 500; margin-top: 4px;">
                        ${s.role}
                    </div>
                </div>
                <div class="speech-score">
                    <i data-lucide="star" style="width: 14px; height: 14px;"></i> ${s.score}/10
                </div>
            </div>
            
            <div class="speech-card-meta">
                <div class="meta-item">
                    <i data-lucide="map" style="width: 14px; height: 14px;"></i>
                    ${s.path || 'N/A'}
                </div>
                <div class="meta-item">
                    <i data-lucide="calendar" style="width: 14px; height: 14px;"></i>
                    ${s.date}
                </div>
                <div style="flex-grow: 1; text-align: right;">
                    <button onclick="deleteSpeech(${s.id})" title="Delete" style="background: none; border: none; color: var(--danger); cursor: pointer; padding: 4px;">
                        <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    lucide.createIcons();
}

// =============================
// TIPS RENDERER
// =============================
function renderTips() {
    const grid = document.getElementById('tipsGrid');
    
    grid.innerHTML = tips.map(tip => `
        <div class="tip-card">
            <div class="tip-icon">
                <i data-lucide="${tip.icon}"></i>
            </div>
            <div>
                <h3>${tip.title}</h3>
                <p>${tip.desc}</p>
            </div>
        </div>
    `).join('');
    
    lucide.createIcons();
}

// =============================
// WORD OF THE DAY
// =============================
function renderWord() {
    const w = words[wordIndex];
    document.getElementById('wotdWord').textContent = w.word;
    document.getElementById('wotdPos').textContent = w.pos;
    document.getElementById('wotdPronunciation').textContent = w.pronunciation;
    document.getElementById('wotdDef').textContent = w.def;
    document.getElementById('wotdSynonyms').textContent = w.synonyms;
    document.getElementById('wotdExample').textContent = `"${w.example}"`;
}

function newWord() {
    wordIndex = (wordIndex + 1) % words.length;
    renderWord();
}

function pronounceWord() {
    const w = words[wordIndex];
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(w.word);
        utterance.rate = 0.85; // slightly slower for clarity
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Text-to-speech is not supported in this browser.");
    }
}


// =============================
// INIT
// =============================
updateTimerDisplay();
renderSpeeches();
renderTips();
renderWord();
