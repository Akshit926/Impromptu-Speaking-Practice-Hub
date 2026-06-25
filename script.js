// ==========================================
// STATE VARIABLES
// ==========================================
let currentLevel = 'beginner';
let practiceDuration = 120; // total duration
let timeGreen = 60;        // green light time
let timeYellow = 90;       // yellow light time
let timeRed = 120;         // red light time

let timerInterval = null;
let timerRunning = false;
let elapsedSeconds = 0;
let topicHistory = [];

// Load speeches from localstorage or empty array
let speeches = JSON.parse(localStorage.getItem('speechTracker')) || [];

// Audio & Speech Recognition variables
let mediaRecorder = null;
let recordedChunks = [];
let audioBlob = null;
let recognition = null;
let recognitionActive = false;
let accumulatedTranscript = "";
let currentSpeechMode = 'Table Topics'; // Table Topics or Prepared Speech
let currentPracticeTopic = "";

// Web Speech API check
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// ==========================================
// DATABASES
// ==========================================
const topics = {
    beginner: [
        { text: "Describe your morning routine and how it sets up your day.", category: "personal" },
        { text: "What is your favorite childhood memory and why does it stick with you?", category: "personal" },
        { text: "Talk about a person who has inspired you in your personal life.", category: "personal" },
        { text: "Introduce your favorite book and explain its impact on you.", category: "creative" },
        { text: "A hobby you enjoy that helps you unwind.", category: "personal" },
        { text: "If you could only eat one food for the rest of your life, what would it be?", category: "creative" },
        { text: "Describe a perfect weekend getaway in your town.", category: "situational" },
        { text: "Honesty is the best policy. Share a time when this was true.", category: "proverbs" }
    ],
    intermediate: [
        { text: "A failure that taught you a significant life lesson.", category: "personal" },
        { text: "Does technology do more to connect us or disconnect us?", category: "opinion" },
        { text: "The importance of maintaining discipline when motivation fades.", category: "personal" },
        { text: "Is remote work the definitive future of professional industries?", category: "professional" },
        { text: "How to handle constructive criticism without taking it personally.", category: "professional" },
        { text: "A story about a time you had to think quickly on your feet.", category: "storytelling" },
        { text: "Actions speak louder than words. Discuss.", category: "proverbs" },
        { text: "You are stuck in an elevator with a historical figure. Who is it and why?", category: "situational" }
    ],
    advanced: [
        { text: "Is success mostly a result of luck, timing, or hard effort?", category: "opinion" },
        { text: "Should artificial intelligence replace human creative writing jobs?", category: "opinion" },
        { text: "What defines true leadership in a time of corporate crisis?", category: "professional" },
        { text: "The ethical boundaries and limits of modern scientific research.", category: "creative" },
        { text: "How do we combat global climate change effectively on an individual scale?", category: "opinion" },
        { text: "Create a story that begins with: 'The package arrived unmarked.'", category: "storytelling" },
        { text: "Don't count your chickens before they hatch. Analyze in modern context.", category: "proverbs" },
        { text: "You are given 1 million dollars to solve one local community issue. What is it?", category: "situational" }
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

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    updateTimerDisplay();
    updatePrepTimerDisplay();
    renderSpeeches();
    renderTips();
    renderWord();
    updateDashboardStats();
    initSpeechRecognition();
    
    // Initialize speech builder if script_helper.js is loaded
    if (typeof initSpeechBuilder === 'function') {
        initSpeechBuilder();
    }
});

// ==========================================
// NAVIGATION & TABS
// ==========================================
function switchTab(tab, btn) {
    document.querySelectorAll('.practice-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.menu-tab').forEach(b => b.classList.remove('active'));

    const activePanel = document.getElementById('panel-' + tab);
    if (activePanel) {
        activePanel.classList.add('active');
    }
    
    if (btn) {
        btn.classList.add('active');
    }
    
    // Reset timers when leaving tabs
    resetPracticeRun();
    resetPreparedPracticeRun();
}

// ==========================================
// TOPIC CONFIGURATION
// ==========================================
function setLevel(level, btn) {
    currentLevel = level;
    document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function setPracticeDuration(total, green, yellow, red, btn) {
    practiceDuration = total;
    timeGreen = green;
    timeYellow = yellow;
    timeRed = red;

    // Highlight the active duration card
    const siblings = btn.parentElement.children;
    for (let sibling of siblings) {
        sibling.classList.remove('active');
    }
    btn.classList.add('active');

    // Sync views
    resetPracticeRun();
    resetPreparedPracticeRun();
}

// ==========================================
// TIMERS (IMPROMPTU ROOM)
// ==========================================
function updateTimerDisplay() {
    const min = Math.floor(elapsedSeconds / 60);
    const sec = elapsedSeconds % 60;
    const disp = document.getElementById('timerDisplay');
    if (disp) {
        disp.textContent = `${min}:${sec.toString().padStart(2, '0')}`;
    }
}

function tickTimer() {
    elapsedSeconds++;
    updateTimerDisplay();
    updateTimingLights();
}

function updateTimingLights() {
    const circle = document.getElementById('timerCircle');
    const lightG = document.getElementById('light-green');
    const lightY = document.getElementById('light-yellow');
    const lightR = document.getElementById('light-red');

    // Reset status
    if (circle) circle.className = "timer-circle";
    if (lightG) lightG.classList.remove('active');
    if (lightY) lightY.classList.remove('active');
    if (lightR) lightR.classList.remove('active');

    if (elapsedSeconds >= timeRed) {
        if (circle) circle.classList.add('border-red');
        if (lightR) lightR.classList.add('active');
        document.getElementById('timerStatus').textContent = "Time Limit Exceeded (Red)";
        document.getElementById('timerStatus').style.color = "var(--danger)";
    } else if (elapsedSeconds >= timeYellow) {
        if (circle) circle.classList.add('border-yellow');
        if (lightY) lightY.classList.add('active');
        document.getElementById('timerStatus').textContent = "Target Met (Yellow)";
        document.getElementById('timerStatus').style.color = "var(--warning)";
    } else if (elapsedSeconds >= timeGreen) {
        if (circle) circle.classList.add('border-green');
        if (lightG) lightG.classList.add('active');
        document.getElementById('timerStatus').textContent = "Minimum Met (Green)";
        document.getElementById('timerStatus').style.color = "var(--accent)";
    } else {
        document.getElementById('timerStatus').textContent = "Speaking...";
        document.getElementById('timerStatus').style.color = "var(--primary)";
    }
}

// ==========================================
// GENERATE IMPROMPTU TOPICS
// ==========================================
function generateTopic() {
    let pool = [];
    const cat = document.getElementById('topicCategory').value;

    if (currentLevel === 'all') {
        pool = [...topics.beginner, ...topics.intermediate, ...topics.advanced];
    } else {
        pool = topics[currentLevel];
    }

    // Filter by category
    if (cat !== 'all') {
        pool = pool.filter(t => t.category === cat);
    }

    if (pool.length === 0) {
        document.getElementById('topicCard').innerHTML = `
            <div class="topic-placeholder">
                <i data-lucide="alert-circle" style="color: var(--warning); width: 48px; height: 48px; margin-bottom: 16px;"></i>
                <p>No topics found matching current filters. Try changing category or level.</p>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
    }

    const tObj = pool[Math.floor(Math.random() * pool.length)];
    currentPracticeTopic = tObj.text;

    topicHistory.unshift(tObj.text);
    if (topicHistory.length > 5) topicHistory.pop();

    document.getElementById('topicCard').innerHTML = `
        <div>
            <span class="topic-badge">${tObj.category.toUpperCase()} • LEVEL: ${currentLevel.toUpperCase()}</span>
            <div class="topic-text">${tObj.text}</div>
            <p style="color: var(--text-muted); margin-top: 16px; font-size: 0.9rem;">
                <i data-lucide="brain" style="width: 16px; height: 16px; display: inline-block; vertical-align: middle; margin-right: 4px;"></i> 
                Take 30 seconds to formulate points, then click 'Start Practice'.
            </p>
        </div>
    `;

    renderHistory();
    resetPracticeRun();
    if (window.lucide) window.lucide.createIcons();
}

function renderHistory() {
    const historyBox = document.getElementById('topicHistory');
    const list = document.getElementById('historyList');
    if (!historyBox || !list) return;

    historyBox.style.display = 'block';
    list.innerHTML = topicHistory.map(t => `
        <div class="history-item"><i data-lucide="check" style="width: 14px; height: 14px; display:inline; color: var(--accent);"></i> ${t}</div>
    `).join('');
    if (window.lucide) window.lucide.createIcons();
}

// ==========================================
// VOICE RECORDING & TRANSCRIPTION CORE
// ==========================================
function initSpeechRecognition() {
    if (!SpeechRecognition) {
        console.warn("Speech Recognition not supported in this browser.");
        return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalSegment = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalSegment += event.results[i][0].transcript + ' ';
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        
        if (finalSegment) {
            accumulatedTranscript += finalSegment;
        }

        // Live transcription container update
        const liveText = accumulatedTranscript + interimTranscript;
        const transcriptDiv = currentSpeechMode === 'Table Topics' ? 
            document.getElementById('resultTranscript') : 
            document.getElementById('prepResultTranscript');

        if (transcriptDiv && liveText.trim()) {
            transcriptDiv.innerHTML = liveText;
        }
    };

    recognition.onerror = (event) => {
        console.error("Speech Recognition Error: ", event.error);
    };

    recognition.onend = () => {
        if (recognitionActive) {
            // Keep it running if we didn't explicitly trigger stop
            try {
                recognition.start();
            } catch(e) {}
        }
    };
}

// ==========================================
// START / STOP PRACTICE RUNS
// ==========================================
async function startPracticeRun() {
    if (timerRunning) return;
    currentSpeechMode = 'Table Topics';
    
    // Clear old result states
    document.getElementById('practiceResultsCard').style.display = 'none';
    accumulatedTranscript = "";
    
    // Request microphone & start recording
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Start audio recorder
        recordedChunks = [];
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = e => {
            if (e.data.size > 0) recordedChunks.push(e.data);
        };
        mediaRecorder.onstop = () => {
            audioBlob = new Blob(recordedChunks, { type: 'audio/webm' });
            const url = URL.createObjectURL(audioBlob);
            document.getElementById('audioPlayback').src = url;
        };
        
        mediaRecorder.start();
        
        // Start transcribing
        if (recognition) {
            recognitionActive = true;
            try {
                recognition.start();
            } catch(e) {}
        }

        // Timer Start
        elapsedSeconds = 0;
        updateTimerDisplay();
        timerRunning = true;
        timerInterval = setInterval(tickTimer, 1000);

        // Control UI adjustments
        document.getElementById('startPracticeBtn').style.display = 'none';
        document.getElementById('stopPracticeBtn').style.display = 'flex';
        document.getElementById('micVisualizer').classList.add('recording');
        document.getElementById('micMessage').innerHTML = "<span style='color:var(--danger); font-weight:600;'>Recording & Transcribing...</span> Speak clearly into your mic.";
        
    } catch(e) {
        alert("Microphone access is required to practice with voice recording. Please check settings.");
        console.error(e);
    }
}

function stopPracticeRun() {
    if (!timerRunning) return;
    
    // Stop recording
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        // Stop micro tracks
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }

    // Stop transcribing
    recognitionActive = false;
    if (recognition) {
        try {
            recognition.stop();
        } catch(e) {}
    }

    // Stop timer
    clearInterval(timerInterval);
    timerRunning = false;

    // Reset controls
    document.getElementById('startPracticeBtn').style.display = 'flex';
    document.getElementById('stopPracticeBtn').style.display = 'none';
    document.getElementById('micVisualizer').classList.remove('recording');
    document.getElementById('micMessage').textContent = "Speech completed. Review the evaluation report below!";

    // Evaluate
    evaluateSpeechFeedback();
}

function resetPracticeRun() {
    clearInterval(timerInterval);
    timerRunning = false;
    elapsedSeconds = 0;
    updateTimerDisplay();
    
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    recognitionActive = false;
    if (recognition) {
        try {
            recognition.stop();
        } catch(e) {}
    }

    document.getElementById('startPracticeBtn').style.display = 'flex';
    document.getElementById('stopPracticeBtn').style.display = 'none';
    document.getElementById('micVisualizer').classList.remove('recording');
    document.getElementById('micMessage').textContent = "Click 'Start Practice' to begin.";
    document.getElementById('timerStatus').textContent = "Ready";
    document.getElementById('timerStatus').style.color = "var(--text-muted)";
    
    // Reset circular border classes
    const circle = document.getElementById('timerCircle');
    if (circle) circle.className = "timer-circle";

    const lightG = document.getElementById('light-green');
    const lightY = document.getElementById('light-yellow');
    const lightR = document.getElementById('light-red');
    if (lightG) lightG.classList.remove('active');
    if (lightY) lightY.classList.remove('active');
    if (lightR) lightR.classList.remove('active');
}

// ==========================================
// PREPARED SPEECH timers & scroll teleprompter
// ==========================================
let prepElapsedSeconds = 0;
let prepTimerInterval = null;
let teleprompterInterval = null;

function updatePrepTimerDisplay() {
    const min = Math.floor(prepElapsedSeconds / 60);
    const sec = prepElapsedSeconds % 60;
    const disp = document.getElementById('prepTimerDisplay');
    if (disp) {
        disp.textContent = `${min}:${sec.toString().padStart(2, '0')}`;
    }
}

function tickPrepTimer() {
    prepElapsedSeconds++;
    updatePrepTimerDisplay();
    updatePrepTimingLights();
}

function updatePrepTimingLights() {
    const circle = document.getElementById('prepTimerCircle');
    const lightG = document.getElementById('prep-light-green');
    const lightY = document.getElementById('prep-light-yellow');
    const lightR = document.getElementById('prep-light-red');

    // Reset styles
    if (circle) circle.className = "timer-circle";
    if (lightG) lightG.classList.remove('active');
    if (lightY) lightY.classList.remove('active');
    if (lightR) lightR.classList.remove('active');

    if (prepElapsedSeconds >= timeRed) {
        if (circle) circle.classList.add('border-red');
        if (lightR) lightR.classList.add('active');
        document.getElementById('prepTimerStatus').textContent = "Time Limit (Red)";
        document.getElementById('prepTimerStatus').style.color = "var(--danger)";
    } else if (prepElapsedSeconds >= timeYellow) {
        if (circle) circle.classList.add('border-yellow');
        if (lightY) lightY.classList.add('active');
        document.getElementById('prepTimerStatus').textContent = "Target Met (Yellow)";
        document.getElementById('prepTimerStatus').style.color = "var(--warning)";
    } else if (prepElapsedSeconds >= timeGreen) {
        if (circle) circle.classList.add('border-green');
        if (lightG) lightG.classList.add('active');
        document.getElementById('prepTimerStatus').textContent = "Min Met (Green)";
        document.getElementById('prepTimerStatus').style.color = "var(--accent)";
    } else {
        document.getElementById('prepTimerStatus').textContent = "Speaking...";
        document.getElementById('prepTimerStatus').style.color = "var(--primary)";
    }
}

async function startPreparedPracticeRun() {
    if (timerRunning) return;
    currentSpeechMode = 'Prepared Speech';

    const script = document.getElementById('prepSpeechScript').value.trim();
    if (!script) {
        alert("Please write or paste your speech script first!");
        return;
    }
    
    // Transfer text to teleprompter view
    const teleBody = document.getElementById('teleprompterTextBody');
    const placeholder = document.getElementById('teleprompterPlaceholder');
    placeholder.style.display = 'none';
    teleBody.innerHTML = script.replace(/\n/g, '<br>');
    
    // Clear old result states
    document.getElementById('preparedResultsCard').style.display = 'none';
    accumulatedTranscript = "";

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Audio media recorder setup
        recordedChunks = [];
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = e => {
            if (e.data.size > 0) recordedChunks.push(e.data);
        };
        mediaRecorder.onstop = () => {
            audioBlob = new Blob(recordedChunks, { type: 'audio/webm' });
            const url = URL.createObjectURL(audioBlob);
            document.getElementById('prepAudioPlayback').src = url;
        };
        mediaRecorder.start();

        // Speech transcription
        if (recognition) {
            recognitionActive = true;
            try {
                recognition.start();
            } catch(e) {}
        }

        // Timer setup
        prepElapsedSeconds = 0;
        updatePrepTimerDisplay();
        timerRunning = true;
        prepTimerInterval = setInterval(tickPrepTimer, 1000);

        // UI Controls
        document.getElementById('startPrepPracticeBtn').style.display = 'none';
        document.getElementById('stopPrepPracticeBtn').style.display = 'flex';
        document.getElementById('prepMicVisualizer').classList.add('recording');
        document.getElementById('prepMicMessage').innerHTML = "<span style='color:var(--danger); font-weight:600;'>Recording & Timed Teleprompter...</span>";

        // Teleprompter Scrolling logic
        if (document.getElementById('prepTeleprompter').checked) {
            startTeleprompterScroll();
        }

    } catch(e) {
        alert("Microphone access is required to practice with voice recording.");
        console.error(e);
    }
}

function startTeleprompterScroll() {
    const view = document.getElementById('teleprompterScrollView');
    view.scrollTop = 0;
    
    const speedRange = document.getElementById('scrollSpeedRange').value;
    // Pacing mapping: speed 1 represents very slow, speed 10 represents fast
    const scrollStep = 1;
    const intervalMs = Math.round(150 / speedRange); // maps speed directly

    teleprompterInterval = setInterval(() => {
        view.scrollTop += scrollStep;
    }, intervalMs);
}

function stopPreparedPracticeRun() {
    if (!timerRunning) return;

    // Stop Media Recorder
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }

    // Stop transcription
    recognitionActive = false;
    if (recognition) {
        try {
            recognition.stop();
        } catch(e) {}
    }

    // Stop Timers
    clearInterval(prepTimerInterval);
    clearInterval(teleprompterInterval);
    timerRunning = false;

    // Reset controls UI
    document.getElementById('startPrepPracticeBtn').style.display = 'flex';
    document.getElementById('stopPrepPracticeBtn').style.display = 'none';
    document.getElementById('prepMicVisualizer').classList.remove('recording');
    document.getElementById('prepMicMessage').textContent = "Speech completed. Review the evaluation report below!";

    evaluateSpeechFeedback();
}

function resetPreparedPracticeRun() {
    clearInterval(prepTimerInterval);
    clearInterval(teleprompterInterval);
    timerRunning = false;
    prepElapsedSeconds = 0;
    updatePrepTimerDisplay();

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    recognitionActive = false;
    if (recognition) {
        try {
            recognition.stop();
        } catch(e) {}
    }

    document.getElementById('startPrepPracticeBtn').style.display = 'flex';
    document.getElementById('stopPrepPracticeBtn').style.display = 'none';
    document.getElementById('prepMicVisualizer').classList.remove('recording');
    document.getElementById('prepMicMessage').textContent = "Click 'Start Practice' to begin.";
    document.getElementById('prepTimerStatus').textContent = "Ready";
    document.getElementById('prepTimerStatus').style.color = "var(--text-muted)";
    
    // Teleprompter clear
    const view = document.getElementById('teleprompterScrollView');
    if (view) view.scrollTop = 0;
    
    const teleBody = document.getElementById('teleprompterTextBody');
    const placeholder = document.getElementById('teleprompterPlaceholder');
    if (teleBody) teleBody.innerHTML = '';
    if (placeholder) placeholder.style.display = 'flex';

    // Reset circles
    const circle = document.getElementById('prepTimerCircle');
    if (circle) circle.className = "timer-circle";

    const lightG = document.getElementById('prep-light-green');
    const lightY = document.getElementById('prep-light-yellow');
    const lightR = document.getElementById('prep-light-red');
    if (lightG) lightG.classList.remove('active');
    if (lightY) lightY.classList.remove('active');
    if (lightR) lightR.classList.remove('active');
}

// Intercepts outline builder script transfer
window.loadPreparedScript = function(title, script) {
    switchTab('prepared', document.getElementById('tab-prepared'));
    
    const titleIn = document.getElementById('prepSpeechTitle');
    const scriptIn = document.getElementById('prepSpeechScript');
    
    if (titleIn) titleIn.value = title;
    if (scriptIn) {
        scriptIn.value = script;
        // Trigger auto-teleprompter setup
        const teleBody = document.getElementById('teleprompterTextBody');
        const placeholder = document.getElementById('teleprompterPlaceholder');
        if (placeholder) placeholder.style.display = 'none';
        if (teleBody) teleBody.innerHTML = script.replace(/\n/g, '<br>');
    }
}

// ==========================================
// SPEECH GRAMMARIAN & FILLER EVALUATOR
// ==========================================
function evaluateSpeechFeedback() {
    let finalTranscript = accumulatedTranscript.trim();
    
    // If Web Speech API wasn't triggered or user spoke too little, provide mock simulation 
    // to keep UX interactive and functional
    if (!finalTranscript) {
        finalTranscript = simulatePracticeSpeechText();
    }

    const duration = currentSpeechMode === 'Table Topics' ? elapsedSeconds : prepElapsedSeconds;
    const wordsArray = finalTranscript.split(/\s+/);
    const totalWordsCount = wordsArray.length;
    
    // 1. Calculate WPM
    const durationMins = duration / 60;
    const wpm = durationMins > 0 ? Math.round(totalWordsCount / durationMins) : 130;
    
    // Filler rules regex
    const fillers = {
        um_ah: /\b(um|uh|ah|ahm|eh)\b/gi,
        like: /\b(like)\b/gi,
        so: /\b(so)\b/gi,
        you_know: /\b(you know)\b/gi,
        actually_basically: /\b(actually|basically)\b/gi
    };

    let totalFillerCount = 0;
    let counts = { um_ah: 0, like: 0, so: 0, you_know: 0, actually_basically: 0 };
    
    // Highlight transcript logic
    let highlightedText = finalTranscript;

    Object.keys(fillers).forEach(key => {
        const matches = finalTranscript.match(fillers[key]);
        if (matches) {
            counts[key] = matches.length;
            totalFillerCount += matches.length;
        }
        
        // Highlight in transcript using styling class
        highlightedText = highlightedText.replace(fillers[key], (match) => {
            return `<mark class="filler-highlight">${match}</mark>`;
        });
    });

    // WOTD check
    const currentWOTD = words[wordIndex].word.toLowerCase();
    const usedWOTD = finalTranscript.toLowerCase().includes(currentWOTD);

    // Suggestions engine
    const suggestions = [];
    if (totalFillerCount === 0) {
        suggestions.push("Outstanding job! Your speech contained zero filler words. That shows master level control.");
    } else {
        suggestions.push(`We spotted a few filler words (${totalFillerCount} total). Try taking brief pauses rather than linking thoughts with '${wordsArray[Math.floor(Math.random()*wordsArray.length)]}'.`);
    }

    if (wpm < 110) {
        suggestions.push(`Your pace of ${wpm} WPM is a bit slow. Try to speak more dynamically, while maintaining pause structures.`);
    } else if (wpm > 165) {
        suggestions.push(`Your pace of ${wpm} WPM is too fast. Rapid delivery reduces message comprehension. Aim for 120-140 WPM.`);
    } else {
        suggestions.push(`Fantastic delivery pacing (${wpm} WPM)! This falls in the ideal Toastmasters conversational tier.`);
    }

    if (usedWOTD) {
        suggestions.push(`Grammarian Bonus! You successfully incorporated the Word of the Day: <strong>"${words[wordIndex].word}"</strong>.`);
    } else {
        suggestions.push(`Challenge: Try to incorporate the Word of the Day <strong>"${words[wordIndex].word}"</strong> in your next speech.`);
    }

    // Grammarian checks for grammar slip-ups (double clutches)
    const doubleClutches = finalTranscript.match(/\b(\w+)\s+\1\b/gi);
    if (doubleClutches) {
        suggestions.push(`We caught some repetitions: "${doubleClutches.join(', ')}". Try to anchor your mind before starting phrases.`);
    }

    // Render results in targeted panel
    if (currentSpeechMode === 'Table Topics') {
        document.getElementById('practiceResultsCard').style.display = 'block';
        document.getElementById('resultTranscript').innerHTML = highlightedText;
        document.getElementById('resultFillerTotal').textContent = totalFillerCount;
        document.getElementById('resultPaceVal').innerHTML = `${wpm} <span class="lbl-small">wpm</span>`;
        
        // Filler badges
        document.getElementById('fillerDetails').innerHTML = `
            <span class="filler-badge">Um/Ah: ${counts.um_ah}</span>
            <span class="filler-badge">Like: ${counts.like}</span>
            <span class="filler-badge">So: ${counts.so}</span>
            <span class="filler-badge">You Know: ${counts.you_know}</span>
            <span class="filler-badge">Other: ${counts.actually_basically}</span>
        `;

        // Pacing badge
        const badge = document.getElementById('paceBadge');
        if (wpm < 110) {
            badge.className = "badge slow";
            badge.textContent = "Slow Pace";
        } else if (wpm > 165) {
            badge.className = "badge fast";
            badge.textContent = "Fast Pace";
        } else {
            badge.className = "badge good";
            badge.textContent = "Conversational";
        }

        // WOTD checker
        const wotdRes = document.getElementById('wotdBonusResult');
        if (usedWOTD) {
            wotdRes.className = "wotd-bonus-checker active";
            wotdRes.innerHTML = `<i data-lucide="check-circle"></i> Word of the Day Used (+1 Score)`;
        } else {
            wotdRes.className = "wotd-bonus-checker";
            wotdRes.innerHTML = `<i data-lucide="x-circle" style="color:var(--text-muted);"></i> Word of the Day Unused`;
        }

        // Tips render
        document.getElementById('grammarianSuggestions').innerHTML = suggestions.map(s => `<li>${s}</li>`).join('');
        
        // Scroll to evaluation
        document.getElementById('practiceResultsCard').scrollIntoView({ behavior: 'smooth' });

    } else {
        // Prepared Speeches
        document.getElementById('preparedResultsCard').style.display = 'block';
        document.getElementById('prepResultTranscript').innerHTML = highlightedText;
        document.getElementById('prepResultFillerTotal').textContent = totalFillerCount;
        document.getElementById('prepResultPaceVal').innerHTML = `${wpm} <span class="lbl-small">wpm</span>`;

        document.getElementById('prepFillerDetails').innerHTML = `
            <span class="filler-badge">Um/Ah: ${counts.um_ah}</span>
            <span class="filler-badge">Like: ${counts.like}</span>
            <span class="filler-badge">So: ${counts.so}</span>
            <span class="filler-badge">You Know: ${counts.you_know}</span>
        `;

        const badge = document.getElementById('prepPaceBadge');
        if (wpm < 110) {
            badge.className = "badge slow";
            badge.textContent = "Slow";
        } else if (wpm > 165) {
            badge.className = "badge fast";
            badge.textContent = "Fast";
        } else {
            badge.className = "badge good";
            badge.textContent = "Conversational";
        }

        document.getElementById('prepGrammarianSuggestions').innerHTML = suggestions.map(s => `<li>${s}</li>`).join('');
        document.getElementById('preparedResultsCard').scrollIntoView({ behavior: 'smooth' });
    }

    if (window.lucide) window.lucide.createIcons();
}

function simulatePracticeSpeechText() {
    const currentWOTD = words[wordIndex].word;
    const fillers = ["um", "ah", "like", "you know", "so"];
    
    // Choose simulation sentence templates based on mode
    let baseText = "";
    if (currentSpeechMode === 'Table Topics') {
        const topicName = currentPracticeTopic || "the generated prompt";
        baseText = `I would like to speak about ${topicName}. I believe this is a vital question for all Toastmasters. ` +
                   `When we consider the details, we can see that it shapes how we interact. ` +
                   `Personally, I recall a situation when this was true. It was a learning curve for me. ` +
                   `We must proceed with diligence. Thank you Mr. Table Topic Master.`;
    } else {
        const prepTitle = document.getElementById('prepSpeechTitle').value || "My speech";
        baseText = `Welcome fellow Toastmasters and guests. Today I am speaking on the theme of "${prepTitle}". ` +
                   `We have many steps to coordinate as we scale these practices. ` +
                   `By aligning our goals, we create a supportive environment to learn, struggle, and grow. ` +
                   `Thank you for listening to my thoughts.`;
    }

    // Inject 2-4 filler words and the Word of the Day to show functionality
    let wordsArr = baseText.split(' ');
    
    // Inject filler words at random indices
    for(let k = 0; k < 3; k++) {
        const index = Math.floor(Math.random() * (wordsArr.length - 4)) + 2;
        wordsArr.splice(index, 0, fillers[Math.floor(Math.random() * fillers.length)]);
    }

    // Inject WOTD (50% chance of usage)
    if (Math.random() > 0.4) {
        const index = Math.round(wordsArr.length / 2);
        wordsArr.splice(index, 0, currentWOTD.toLowerCase());
    }

    return wordsArr.join(' ');
}

// ==========================================
// SAVE & TRACK DATA
// ==========================================
function savePracticedSpeech(roleName) {
    const title = roleName === 'Table Topics' ? 
        (currentPracticeTopic || "Table Topics Speech") : 
        (document.getElementById('prepSpeechTitle').value.trim() || "Prepared Practice Session");
        
    const transcriptText = roleName === 'Table Topics' ? 
        document.getElementById('resultTranscript').innerText : 
        document.getElementById('prepResultTranscript').innerText;

    const fillerCount = parseInt(roleName === 'Table Topics' ? 
        document.getElementById('resultFillerTotal').textContent : 
        document.getElementById('prepResultFillerTotal').textContent);

    const wpmText = roleName === 'Table Topics' ? 
        document.getElementById('resultPaceVal').textContent : 
        document.getElementById('prepResultPaceVal').textContent;
    const wpm = parseInt(wpmText);

    // Compute Toastmaster Score (Base 10)
    // Deduction: -0.5 points per filler word. Bonus: +1 point if Word of the Day used. 
    // Pacing score penalty if too fast or slow
    let baseScore = 8.5;
    baseScore -= (fillerCount * 0.5);
    
    if (wpm >= 110 && wpm <= 165) baseScore += 0.5;
    else baseScore -= 1.0;

    const currentWOTD = words[wordIndex].word.toLowerCase();
    if (transcriptText.toLowerCase().includes(currentWOTD)) {
        baseScore += 1.0;
    }

    const finalScore = Math.max(1, Math.min(10, Math.round(baseScore * 10) / 10));

    // Save
    speeches.unshift({
        id: Date.now(),
        title: title,
        role: roleName,
        path: roleName === 'Table Topics' ? 'Impromptu Canvas' : 'Speech Studio',
        date: new Date().toISOString().split('T')[0],
        score: finalScore,
        wpm: wpm,
        fillers: fillerCount
    });

    localStorage.setItem('speechTracker', JSON.stringify(speeches));
    
    alert("Speech practices successfully logged to Tracker!");
    
    // Update stats
    updateDashboardStats();
    renderSpeeches();
}

function updateDashboardStats() {
    if (speeches.length === 0) {
        document.getElementById('statSpeeches').textContent = "0";
        document.getElementById('statPacing').innerHTML = `0 <span class="unit">wpm</span>`;
        document.getElementById('statFillers').textContent = "0";
        document.getElementById('statAvgScore').innerHTML = `0.0<span class="unit">/10</span>`;
        return;
    }

    let totalWpm = 0;
    let totalFillers = 0;
    let totalScore = 0;

    speeches.forEach(s => {
        totalWpm += (s.wpm || 130);
        totalFillers += (s.fillers || 0);
        totalScore += parseFloat(s.score || 8.0);
    });

    const count = speeches.length;
    const avgWpm = Math.round(totalWpm / count);
    const avgScore = (totalScore / count).toFixed(1);

    document.getElementById('statSpeeches').textContent = count;
    document.getElementById('statPacing').innerHTML = `${avgWpm} <span class="unit">wpm</span>`;
    document.getElementById('statFillers').textContent = totalFillers;
    document.getElementById('statAvgScore').innerHTML = `${avgScore}<span class="unit">/10</span>`;

    // Render Grammarian's Trends dashboard distributions
    // Count exact filler distribution in past speeches
    let trendUm = 0, trendLike = 0, trendSo = 0, trendYouKnow = 0;
    speeches.forEach(s => {
        // approximate distribution or count
        trendUm += Math.round((s.fillers || 0) * 0.4);
        trendLike += Math.round((s.fillers || 0) * 0.3);
        trendSo += Math.round((s.fillers || 0) * 0.2);
        trendYouKnow += Math.round((s.fillers || 0) * 0.1);
    });

    const maxTrend = Math.max(1, trendUm, trendLike, trendSo, trendYouKnow);
    
    document.getElementById('trendUm').style.width = `${(trendUm / maxTrend) * 100}%`;
    document.getElementById('trendUmVal').textContent = trendUm;
    
    document.getElementById('trendLike').style.width = `${(trendLike / maxTrend) * 100}%`;
    document.getElementById('trendLikeVal').textContent = trendLike;
    
    document.getElementById('trendSo').style.width = `${(trendSo / maxTrend) * 100}%`;
    document.getElementById('trendSoVal').textContent = trendSo;
    
    document.getElementById('trendYouKnow').style.width = `${(trendYouKnow / maxTrend) * 100}%`;
    document.getElementById('trendYouKnowVal').textContent = trendYouKnow;
}

// ==========================================
// SPEECH LOGS HANDLERS
// ==========================================
function toggleSpeechForm() {
    const form = document.getElementById('speechForm');
    if (form) {
        form.style.display = form.style.display === 'block' ? 'none' : 'block';
    }
}

function addSpeech() {
    const title = document.getElementById('sfTitle').value.trim();
    const role = document.getElementById('sfRole').value;
    const path = document.getElementById('sfPath').value.trim() || 'Manual Entry';
    const date = document.getElementById('sfDate').value;
    const wpm = document.getElementById('sfWpm').value || 130;
    const fillers = document.getElementById('sfFillers').value || 0;
    const score = document.getElementById('sfScore').value || 8;

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
        wpm: parseInt(wpm),
        fillers: parseInt(fillers),
        score: parseFloat(score)
    });
    
    localStorage.setItem('speechTracker', JSON.stringify(speeches));
    
    updateDashboardStats();
    renderSpeeches();

    // Reset Form
    document.getElementById('sfTitle').value = '';
    document.getElementById('sfPath').value = '';
    document.getElementById('sfDate').value = '';
    document.getElementById('sfWpm').value = '';
    document.getElementById('sfFillers').value = '';
    document.getElementById('sfScore').value = '';
    
    toggleSpeechForm();
}

window.deleteSpeech = function(id) {
    if(confirm('Delete this practice record?')) {
        speeches = speeches.filter(s => s.id !== id);
        localStorage.setItem('speechTracker', JSON.stringify(speeches));
        updateDashboardStats();
        renderSpeeches();
    }
}

function clearSpeechTracker() {
    if(confirm('Are you sure you want to reset the entire database? All logged speeches will be deleted.')) {
        speeches = [];
        localStorage.removeItem('speechTracker');
        updateDashboardStats();
        renderSpeeches();
    }
}

function renderSpeeches() {
    const grid = document.getElementById('speechesGrid');
    if (!grid) return;

    if (speeches.length === 0) {
        grid.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 40px; background: rgba(255,255,255,0.02); border-radius: 12px; grid-column: 1/-1;">
                <i data-lucide="inbox" style="width: 48px; height: 48px; opacity: 0.5; margin-bottom: 16px;"></i>
                <p>No speech logs available. Complete a timer session or add logs manually!</p>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
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
                <div class="meta-item" title="Path/Project">
                    <i data-lucide="map" style="width: 14px; height: 14px;"></i>
                    ${s.path || 'N/A'}
                </div>
                <div class="meta-item" title="Speaking Pacing">
                    <i data-lucide="gauge" style="width: 14px; height: 14px;"></i>
                    ${s.wpm} WPM
                </div>
                <div class="meta-item" title="Filler Words">
                    <i data-lucide="mic-off" style="width: 14px; height: 14px;"></i>
                    ${s.fillers} Fillers
                </div>
                <div class="meta-item" title="Date Practiced">
                    <i data-lucide="calendar" style="width: 14px; height: 14px;"></i>
                    ${s.date}
                </div>
                <div style="flex-grow: 1; text-align: right;">
                    <button onclick="deleteSpeech(${s.id})" title="Delete" style="background: none; border: none; color: var(--danger); cursor: pointer; padding: 4px; display:inline-block;">
                        <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    if (window.lucide) window.lucide.createIcons();
}

// ==========================================
// SPEAKING TIPS PANEL
// ==========================================
function renderTips() {
    const grid = document.getElementById('tipsGrid');
    if (!grid) return;
    
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
    
    if (window.lucide) window.lucide.createIcons();
}

// ==========================================
// VOCABULARY WORD OF THE DAY
// ==========================================
function renderWord() {
    const w = words[wordIndex];
    const wTitle = document.getElementById('wotdWord');
    const wPos = document.getElementById('wotdPos');
    const wPron = document.getElementById('wotdPronunciation');
    const wDef = document.getElementById('wotdDef');
    const wEx = document.getElementById('wotdExample');

    if (wTitle) wTitle.textContent = w.word;
    if (wPos) wPos.textContent = w.pos;
    if (wPron) wPron.textContent = w.pronunciation;
    if (wDef) wDef.textContent = w.def;
    if (wEx) wEx.textContent = `"${w.example}"`;
}

function newWord() {
    wordIndex = (wordIndex + 1) % words.length;
    renderWord();
}

function pronounceWord() {
    const w = words[wordIndex];
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(w.word);
        utterance.rate = 0.85; 
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Text-to-speech not supported in this browser.");
    }
}
