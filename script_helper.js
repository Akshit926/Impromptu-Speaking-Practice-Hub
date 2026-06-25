// ==========================================
// SPEECH OUTLINE TEMPLATES & HELPERS
// ==========================================

const speechTemplates = {
    persuade: {
        title: "Persuade (Problem-Cause-Solution)",
        description: "Best for convincing the audience to adopt a viewpoint, take action, or change a habit.",
        outline: {
            introduction: {
                label: "Introduction (Hook, Topic, & Thesis)",
                prompt: "Hook the audience (story, stat, question). Introduce the topic and clearly state your core proposition/thesis.",
                placeholder: "Capture attention. e.g., 'Imagine a world where... Today, we face a silent crisis...'"
            },
            body1: {
                label: "Body Point 1: The Problem",
                prompt: "Detail the problem. Why is it significant? Who does it affect? Establish urgency and build empathy.",
                placeholder: "e.g., 'The core challenge we face today is... Thousands of people are affected by...'"
            },
            body2: {
                label: "Body Point 2: The Cause",
                prompt: "Explain why this problem exists. What is the root cause? Analyze the structural or behavioral barriers.",
                placeholder: "e.g., 'This problem persists because... We have ignored the underlying cause, which is...'"
            },
            body3: {
                label: "Body Point 3: The Solution",
                prompt: "Propose a clear, actionable solution. Explain how it solves the problem and address counterarguments.",
                placeholder: "e.g., 'The solution lies in three simple steps... By implementing this, we can...'"
            },
            conclusion: {
                label: "Conclusion (Summary & Call to Action)",
                prompt: "Summarize the key points, re-state the core benefit, and issue a clear, compelling Call to Action.",
                placeholder: "e.g., 'Let us take the first step today by... Remember, the power to change is in our hands.'"
            }
        }
    },
    inspire: {
        title: "Inspire (Hero's Journey / Motivational)",
        description: "Best for sharing a personal story, overcoming adversity, and motivating the audience to achieve greatness.",
        outline: {
            introduction: {
                label: "Introduction (The Setup)",
                prompt: "Set the scene. Introduce the initial state before the challenge. Grab attention with a vivid description of normalcy.",
                placeholder: "e.g., 'It was a cold morning in winter when... I was comfortable, thinking nothing could go wrong...'"
            },
            body1: {
                label: "Body Point 1: The Challenge (The Descent)",
                prompt: "Detail the conflict, struggle, or massive challenge you faced. What was at stake? Build tension.",
                placeholder: "e.g., 'Suddenly, everything fell apart... I found myself standing at the edge of failure, wondering...'"
            },
            body2: {
                label: "Body Point 2: The Turning Point (The Discovery)",
                prompt: "Share the moment of realization, help received, or breakthrough. What did you learn or decide?",
                placeholder: "e.g., 'In that moment of absolute darkness, I realized... A small voice inside me said...'"
            },
            body3: {
                label: "Body Point 3: The Resolution (The Rise)",
                prompt: "Describe the outcome and the positive transformation. How are things different now? Show progress.",
                placeholder: "e.g., 'Today, I stand before you transformed. I didn't just rebuild; I grew...'"
            },
            conclusion: {
                label: "Conclusion (The Takeaway & Core Message)",
                prompt: "Synthesize the lesson. Make it universal. Inspire the audience to apply this lesson to their own lives.",
                placeholder: "e.g., 'We all have our giants to fight. So when you face your storm, remember that you are stronger than...'"
            }
        }
    },
    inform: {
        title: "Inform (Topical / Educational)",
        description: "Best for explaining a complex concept, educating the audience, or teaching a new skill/topic.",
        outline: {
            introduction: {
                label: "Introduction (Hook & Purpose)",
                prompt: "Hook the audience. Establish credibility. State clearly what they will learn and why it matters to them.",
                placeholder: "e.g., 'Did you know that... Today, we will explore the three pillars of... By the end, you'll see...'"
            },
            body1: {
                label: "Body Point 1: Concept/Pillar One",
                prompt: "Introduce your first main point. Support it with data, examples, or an analogy.",
                placeholder: "e.g., 'First, let's look at... This operates under the principle of... For instance...'"
            },
            body2: {
                label: "Body Point 2: Concept/Pillar Two",
                prompt: "Introduce your second main point. Connect it to the first point. Provide a concrete example.",
                placeholder: "e.g., 'Second, and equally important, is... This relates directly to our first pillar because...'"
            },
            body3: {
                label: "Body Point 3: Concept/Pillar Three",
                prompt: "Introduce your third main point. Keep it distinct. Explain its practical application.",
                placeholder: "e.g., 'Finally, the third aspect is... This is where the theory meets reality...'"
            },
            conclusion: {
                label: "Conclusion (Summary & Application)",
                prompt: "Summarize the three pillars. Give a final takeaway. Leave the audience with a sense of understanding.",
                placeholder: "e.g., 'To summarize, we examined... Armed with this knowledge, you can now...'"
            }
        }
    },
    entertain: {
        title: "Entertain (Humorous / Anecdotal)",
        description: "Best for sharing lighthearted stories, humorous observations, or engaging narratives to amuse the audience.",
        outline: {
            introduction: {
                label: "Introduction (The Hook & Setup)",
                prompt: "Hook the audience with humor, a surprising claim, or an eccentric setup. Set a fun, relaxed tone.",
                placeholder: "e.g., 'I have a confession to make. I am addicted to... It all started when...'"
            },
            body1: {
                label: "Body Point 1: The Inciting Incident",
                prompt: "Introduce the funny scenario or story. Describe characters and paint a comical picture of the situation.",
                placeholder: "e.g., 'It was a simple task. My friend suggested we... What could possibly go wrong?'"
            },
            body2: {
                label: "Body Point 2: Escalation (The Complication)",
                prompt: "Build up the scenario. How did things go from bad to worse? Highlight the absurdity.",
                placeholder: "e.g., 'Naturally, instead of doing the sensible thing, I... Within minutes, the situation became...'"
            },
            body3: {
                label: "Body Point 3: The Climax (The Funny Payoff)",
                prompt: "The peak of your funny story or the punchline situation. Describe the chaotic peak.",
                placeholder: "e.g., 'That was when I looked up and saw... The expression on their face was priceless...'"
            },
            conclusion: {
                label: "Conclusion (The Witty Moral & Close)",
                prompt: "Wrap up the story. Provide a mock 'lesson' or a clever callback to the beginning of the speech.",
                placeholder: "e.g., 'So the moral of the story is simple... Next time you are tempted to... Just walk away!'"
            }
        }
    }
};

// State for the speech builder
let activeTemplateKey = 'persuade';

function initSpeechBuilder() {
    renderTemplateOptions();
    loadTemplate(activeTemplateKey);
}

function renderTemplateOptions() {
    const selector = document.getElementById('sbObjective');
    if (!selector) return;

    selector.innerHTML = Object.keys(speechTemplates).map(key => `
        <option value="${key}">${speechTemplates[key].title}</option>
    `).join('');

    selector.value = activeTemplateKey;
}

function loadTemplate(key) {
    activeTemplateKey = key;
    const template = speechTemplates[key];
    const container = document.getElementById('outlineInputs');
    if (!container) return;

    document.getElementById('objectiveDesc').innerHTML = `
        <strong>${template.title}</strong>: ${template.description}
    `;

    container.innerHTML = Object.keys(template.outline).map(sectionKey => {
        const sec = template.outline[sectionKey];
        return `
            <div class="outline-section-card glass-panel" style="margin-bottom: 20px; padding: 16px;">
                <label style="font-weight: 600; color: var(--text-main); display: block; margin-bottom: 6px; font-size: 1rem;">
                    ${sec.label}
                </label>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 10px;">
                    <i data-lucide="help-circle" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-right: 4px;"></i>
                    ${sec.prompt}
                </p>
                <textarea 
                    id="outline-text-${sectionKey}" 
                    class="outline-textarea" 
                    placeholder="${sec.placeholder}" 
                    rows="4" 
                    style="width: 100%; padding: 12px; border-radius: 8px; background: rgba(255,255,255,0.02); border: 1px solid var(--panel-border); color: white; resize: vertical; outline: none; font-family: inherit;"
                    onkeyup="updateSpeechStats()"></textarea>
            </div>
        `;
    }).join('');

    // Re-create icons for the new elements
    if (window.lucide) {
        window.lucide.createIcons();
    }

    updateSpeechStats();
}

function updateSpeechStats() {
    let totalWords = 0;
    const template = speechTemplates[activeTemplateKey];

    Object.keys(template.outline).forEach(sectionKey => {
        const el = document.getElementById(`outline-text-${sectionKey}`);
        if (el) {
            const val = el.value.trim();
            if (val.length > 0) {
                totalWords += val.split(/\s+/).length;
            }
        }
    });

    document.getElementById('sbWordCount').textContent = totalWords;

    // Toastmasters standard: 130 - 150 Words Per Minute. Let's use 130 WPM as benchmark.
    const wpm = 130;
    const totalSeconds = Math.round((totalWords / wpm) * 60);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    document.getElementById('sbEstDuration').textContent = `${mins}m ${secs.toString().padStart(2, '0')}s`;
}

function generateSpeechIdeas() {
    const topic = document.getElementById('sbTopic').value.trim();
    if (!topic) {
        alert("Please enter a speech topic/theme first!");
        return;
    }

    // Provide some structured ideas into the outline boxes to help them get started
    const template = speechTemplates[activeTemplateKey];

    // Local simple idea generator rules depending on objective
    let ideas = {};
    if (activeTemplateKey === 'persuade') {
        ideas = {
            introduction: `Did you know that ${topic} affects millions of people daily? Today, I want to show you why we must pay attention to this and how it shapes our future.`,
            body1: `The real problem with ${topic} is that it goes unnoticed. We see its impact when we look at our daily stress, lost productivity, and the strain on our relationships.`,
            body2: `Why does this happen? The root cause is simple: lack of awareness and old systems. We continue doing things the old way without questioning them.`,
            body3: `But we can change this. The solution is threefold: first, educate ourselves on ${topic}; second, make small changes in our daily routine; and third, encourage others to join us.`,
            conclusion: `Imagine the impact of a world that embraces this change. Let us commit today to take charge of ${topic}. Start small, but start now.`
        };
    } else if (activeTemplateKey === 'inspire') {
        ideas = {
            introduction: `I used to believe that ${topic} was something only experts could master. I was comfortable in my small world, avoiding any challenges.`,
            body1: `Then came the turning point. I faced a major setback when my first attempt failed completely. I was ready to quit and walk away forever.`,
            body2: `In that quiet moment, I learned that failure is not the end, but the classroom. I realized that my passion for ${topic} was stronger than my fear.`,
            body3: `I worked, practiced, and slowly rebuilt my skills. Step by step, the obstacles began to turn into stepping stones.`,
            conclusion: `Today, I know that whatever challenge you face, you have the inner strength to overcome it. Don't let fear stop you from pursuing your passion.`
        };
    } else if (activeTemplateKey === 'inform') {
        ideas = {
            introduction: `Today, let's demystify ${topic}. We will break it down into three simple pillars that define how it works and why it matters in our lives.`,
            body1: `The first pillar of ${topic} is understanding its history and origin. It was designed to solve a fundamental need: connectivity and efficiency.`,
            body2: `The second pillar is its modern application. We see it used in industries, schools, and homes to streamline daily tasks.`,
            body3: `The third pillar is the future outlook. As technology advances, this concept will continue to evolve, opening new opportunities.`,
            conclusion: `By understanding these three aspects, you are now equipped to navigate ${topic} successfully. Keep exploring and learning!`
        };
    } else {
        ideas = {
            introduction: `I have a funny confession to make: my relationship with ${topic} is complicated, to say the least!`,
            body1: `It all started when I was convinced to try it for the first time. I thought, 'How hard could this possibly be?'`,
            body2: `Naturally, everything that could go wrong did. I found myself in the most awkward situation, trying to explain my way out.`,
            body3: `The peak of the chaos was when everyone stopped and stared. I realized the only way through was to laugh at myself!`,
            conclusion: `So next time you struggle with this, just smile. Remember that a good story is always worth a little embarrassment!`
        };
    }

    // Fill textareas
    Object.keys(template.outline).forEach(sectionKey => {
        const el = document.getElementById(`outline-text-${sectionKey}`);
        if (el) {
            el.value = ideas[sectionKey] || '';
        }
    });

    updateSpeechStats();
}

function clearSpeechBuilder() {
    if (confirm("Are you sure you want to clear your speech script draft?")) {
        const template = speechTemplates[activeTemplateKey];
        Object.keys(template.outline).forEach(sectionKey => {
            const el = document.getElementById(`outline-text-${sectionKey}`);
            if (el) el.value = '';
        });
        updateSpeechStats();
    }
}

function transferToPractice() {
    // Compile script
    const template = speechTemplates[activeTemplateKey];
    let fullScript = "";
    let valid = false;

    Object.keys(template.outline).forEach(sectionKey => {
        const label = template.outline[sectionKey].label;
        const val = document.getElementById(`outline-text-${sectionKey}`).value.trim();
        if (val) {
            fullScript += `[${label}]\n${val}\n\n`;
            valid = true;
        }
    });

    if (!valid) {
        alert("Please write something in your outline script before transferring!");
        return;
    }

    const title = document.getElementById('sbTopic').value.trim() || `Speech on ${template.title}`;

    // Switch to practice panel and load the script
    // We'll set up script mode in the practice dashboard
    if (window.loadPreparedScript) {
        window.loadPreparedScript(title, fullScript);
    } else {
        alert("Script Practice Mode initialization is still loading. Please try again in a moment.");
    }
}
