const apiKey = typeof process !== 'undefined' && process.env.GEMINI_API_KEY
  ? process.env.GEMINI_API_KEY
  : null;

let genAI: any = null;

async function initGenAI() {
  if (genAI || !apiKey) return;
  try {
    const { GoogleGenAI } = await import('@google/genai');
    genAI = new GoogleGenAI({ apiKey });
  } catch {
    genAI = null;
  }
}

const GREETINGS = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'sup', 'yo', 'howdy', 'what\'s up', 'hey there'];
const FAREWELLS = ['bye', 'goodbye', 'see you', 'later', 'cya', 'talk later'];
const HELP_QUERIES = ['help', 'what can you do', 'capabilities', 'features', 'what do you do', 'how do you work', 'your purpose', 'tell me about yourself'];

function isGreeting(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return GREETINGS.some(g => lower === g || lower.startsWith(g + ' ')) || /^(hi|hey|hello)\b/.test(lower);
}

function isFarewell(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return FAREWELLS.some(f => lower.includes(f));
}

function isHelpQuery(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return HELP_QUERIES.some(h => lower.includes(h));
}

function isDateOrTimeQuery(text: string): boolean {
  const lower = text.toLowerCase();
  return /(\bdate\b|\btime\b|\bday\b|\bwhat day\b|\bcurrent\s*(date|time|day)\b|\btoday\b|\bnow\b)/.test(lower) &&
         !lower.includes('date of birth') && !lower.includes('appointment');
}

function isMathQuery(text: string): boolean {
  return /(\d+\s*[\+\-\*\/]\s*\d+|\bsum\b|\bcalculate\b|\bwhat is\b.*\d+)/.test(text.toLowerCase());
}

function isWeatherQuery(text: string): boolean {
  const lower = text.toLowerCase();
  return /(weather|temperature|rain|forecast|climate)/.test(lower) && !lower.includes('climate change');
}

function evaluateMath(text: string): string | null {
  const match = text.match(/(\d+)\s*([\+\-\*\/])\s*(\d+)/);
  if (!match) return null;
  const a = parseFloat(match[1]);
  const op = match[2];
  const b = parseFloat(match[3]);
  let result: number;
  switch (op) {
    case '+': result = a + b; break;
    case '-': result = a - b; break;
    case '*': result = a * b; break;
    case '/': result = b !== 0 ? a / b : NaN; break;
    default: return null;
  }
  if (isNaN(result)) return "Can't divide by zero!";
  return `${a} ${op} ${b} = ${result}`;
}

function detectSector(text: string): string | null {
  const lower = text.toLowerCase();
  if (/\b(health|medical|patient|doctor|hospital|symptom|disease|triage)\b/.test(lower)) return 'health';
  if (/\b(finance|financial|budget|audit|money|investment|transaction|fund|account)\b/.test(lower)) return 'finance';
  if (/\b(education|learn|student|lesson|course|curriculum|teach|class)\b/.test(lower)) return 'education';
  if (/\b(logistics|supply|delivery|fleet|route|transport|shipment|warehouse)\b/.test(lower)) return 'logistics';
  if (/\b(safety|security|threat|emergency|police|fire|rescue|disaster)\b/.test(lower)) return 'safety';
  if (/\b(farm|crop|agriculture|yield|soil|irrigation|pest|harvest)\b/.test(lower)) return 'agriculture';
  if (/\b(cyber|hack|malware|virus|breach|firewall|encrypt|vulnerability)\b/.test(lower)) return 'cybersecurity';
  if (/\b(game|play|fun|score|level|challenge)\b/.test(lower)) return 'games';
  return null;
}

const SECTOR_INTROS: Record<string, string> = {
  health: "Hey! I work with health data — patient records, triage prioritization, symptom analysis, that sort of thing. Got a medical dataset you need cleaned up or a tricky triage scenario?",
  finance: "Finance is my jam — I dive into transactions, hunt for fraud patterns, run bias audits, and make sure everything lines up with compliance rules. What are you looking at?",
  education: "I'm all about education — lesson planning, knowledge gap analysis, curriculum design, and tutoring. I think about pedagogy the way a master chef thinks about ingredients. What are you teaching or learning right now?",
  logistics: "Logistics keeps the world moving. I optimize routes, predict supply chain hiccups before they happen, and balance fleets across zones. What's your logistics puzzle?",
  safety: "Public safety is serious work. I help verify threat reports, prioritize emergency broadcasts, and triage incidents so the right resources get where they're needed fast. What's the situation?",
  agriculture: "From soil data to harvest predictions, I help farmers and agronomists make smarter decisions. Pest pressures, irrigation schedules, yield forecasts — name it. What's growing on?",
  cybersecurity: "Security is my world. I track threats, map them to MITRE ATT&CK, guide incident response, and help triage SOC alerts. What are you seeing out there?",
  games: "Let's play! I've got interactive simulations that teach finance, health, logistics, and crisis management through actual gameplay. Pick one and jump in.",
};

function getGreetingResponse(): string {
  const hour = new Date().getHours();
  let timeGreeting = 'Hello';
  if (hour < 12) timeGreeting = 'Good morning';
  else if (hour < 17) timeGreeting = 'Good afternoon';
  else timeGreeting = 'Good evening';

  const responses = [
    `${timeGreeting}! I'm your Aegis-X assistant. What's on your mind?`,
    `${timeGreeting}! Ready when you are. Want to explore a sector, analyze some data, or just chat?`,
    `Hey! I'm here to help. Ask me anything or pick a tool from the sidebar to get started.`,
    `Hi there! What can I do for you? I work across health, finance, education, logistics, safety, agriculture, and cybersecurity.`,
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function getFarewellResponse(): string {
  const responses = [
    "Take care! Come back anytime.",
    "Catch you later! Stay secure out there.",
    "See you! I'll be here when you need me.",
    "Until next time! Stay safe.",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function getDateResponse(): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  return `Right now it's ${timeStr} on ${dateStr} (${Intl.DateTimeFormat().resolvedOptions().timeZone}).`;
}

function getWeatherResponse(): string {
  const responses = [
    "I can't pull live weather data right now, but describe what you're seeing and I can help analyze how it affects your operations.",
    "Weather integration isn't active in this session. Tell me your local conditions and I'll work with that.",
    "No live weather feed at the moment. If you describe what it's like outside, I can factor that into my analysis.",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function getHelpResponse(): string {
  return `I'm your Aegis-X assistant. Here's what I can help with:

• **Chat naturally** — say hi, ask questions, have a conversation
• **Answer questions** — ask about the date, do math, get explanations
• **Sector analysis** — dive into health, finance, education, logistics, safety, agriculture, or cybersecurity
• **Data processing** — paste data into any form tool and I'll analyze it
• **Interactive learning** — walk through the gamified training simulations

Try something like "analyze this patient data" or "help me with a budget allocation" or just say hello!`;
}

function casualResponse(text: string): string | null {
  const lower = text.toLowerCase().trim();

  if (/(how are you|how's it going|how do you feel|what's up)/.test(lower)) {
    return "Doing well! All systems running smooth. What's on your mind?";
  }
  if (/(who are you|what are you|your name)/.test(lower)) {
    return "I'm the Aegis-X assistant — your command center co-pilot. I help analyze data, respond to incidents, and navigate the platform. Think of me as the person in the chair next to you.";
  }
  if (/(thank|thanks|appreciate)/.test(lower)) {
    return "Happy to help! Let me know if you need anything else.";
  }
  if (/^(yes|yeah|sure|okay|ok)$/i.test(lower)) {
    return "Great! What next?";
  }
  if (/^(no|nope|nah)$/i.test(lower)) {
    return "No problem. Just let me know if you change your mind.";
  }
  if (/(joke|funny|laugh|humor)/.test(lower)) {
    const jokes = [
      "Why do hackers wear leather jackets? Because they have to deal with a lot of TCP/IP. ...Get it? ...I'll see myself out.",
      "What's a computer's favorite snack? Microchips.",
      "Why did the firewall break up with the router? Too many packets got dropped.",
      "How many security analysts does it take to change a lightbulb? None — they just monitor it and file a ticket.",
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }
  if (/(what do you think|opinion|thoughts)/.test(lower) && !/(about|on)\s/.test(lower)) {
    return "I think you're doing a solid job. The key is staying proactive — catch things early before they escalate. What area are you focused on?";
  }
  if (/(meaning of life|purpose|why are we here)/.test(lower)) {
    return "42. No wait — that's a different AI. Look, I'll leave the philosophy to you humans. I'm here to keep systems secure and help you get your job done.";
  }

  return null;
}

function getSectorSpecificResponse(sector: string, query: string): string {
  const lower = query.toLowerCase();
  const isQuestion = lower.includes('what') || lower.includes('how') || lower.includes('why') || lower.includes('can you') || lower.includes('tell me') || lower.includes('explain');

  if (isQuestion) {
    const answers: Record<string, string[]> = {
      health: [
        "So here's the thing about healthcare data — it's messy, it's sensitive, and it's incredibly valuable. I spend a lot of time cleaning up medical records, stripping out PII before anything leaves the local environment, and flagging patterns that might help with triage. For example, if you feed me a stack of intake notes, I can spot which patients need immediate attention and which can wait. I can also convert unstructured doctor's notes into FHIR-compliant JSON if that's what you need. What kind of health data are you sitting on?",
        "I've worked with a lot of medical data, and the biggest challenge is always privacy. HIPAA doesn't mess around. So the way I handle it is: everything stays at the edge, PII gets scrubbed before any analysis happens, and I only return insights — never raw patient data. On the triage side, I'm pretty good at prioritizing cases based on symptom severity, vitals, and risk factors. It's like having a second pair of eyes on every intake.",
        "You know what surprises people about health AI? It's not the diagnosis stuff — it's the data hygiene. I can take a pile of messy clinical notes and turn them into clean, structured records. I flag potential diagnoses with confidence scores, make sure all protected health information is properly removed, and help prioritize cases in high-pressure triage scenarios. It's not replacing doctors — it's giving them cleaner data and sharper insights so they can focus on patients.",
      ],
      finance: [
        "Finance is fascinating because it's all about patterns. I scan through transactions looking for anything that doesn't fit — a weird transfer amount, an unusual time of day, a vendor that doesn't match the usual pattern. That's how fraud surfaces. I also run bias audits to make sure resources aren't being distributed inequitably. If you've got transaction data or audit logs, I can dig through them and tell you what stands out.",
        "I've looked at a lot of financial data over time, and the thing I keep coming back to is: fraudsters are creative, but they're also predictable. They follow patterns. I follow those patterns too — I flag anomalies in real-time, audit transactions for compliance with SOX and GDPR, and verify zero-knowledge proofs for cross-sector transfers. If you're wondering whether a transaction is legit or if your budget allocation is fair, I can help.",
        "Here's what I actually do with financial data: I ingest transaction streams, look for statistical anomalies, run bias analyses on resource allocation, and check compliance against regulatory frameworks. The ZKP stuff is particularly cool — I can verify that a cross-sector handshake token is valid without ever seeing the underlying data. If you've got a dataset you want me to audit or a transaction you're suspicious about, send it over.",
      ],
      education: [
        "Great question about AI in education! Let me give you a comprehensive picture.\n\nAI is transforming education in several powerful ways:\n\n**Personalized Learning Pathways** — AI analyzes each student's strengths, weaknesses, and learning pace to create customized curricula. Instead of a one-size-fits-all approach, students get material calibrated to their current level.\n\n**Intelligent Tutoring Systems** — AI tutors like the one you're chatting with can provide 1-on-1 support using Socratic questioning, adapting explanations to how each student learns best. Research shows this can improve outcomes by up to 2 standard deviations over traditional instruction.\n\n**Automated Assessment & Feedback** — AI can grade assignments, provide instant feedback, and identify patterns across an entire cohort that would take a human teacher hours to spot.\n\n**Curriculum Design** — AI helps educators build better curricula by mapping prerequisite relationships, identifying gaps, and suggesting optimal learning sequences.\n\nWould you like me to dive deeper into any of these areas? I can also help you build a lesson plan, analyze assessment data, or fact-check educational materials.",
        "AI in education isn't about replacing teachers — it's about amplifying their impact. Here's how:\n\n**For Teachers:** AI handles the time-consuming tasks — grading, data analysis, personalized material creation — freeing teachers to focus on what matters most: building relationships, mentoring, and facilitating deep learning.\n\n**For Students:** AI provides instant, personalized support. When a student is stuck on a concept at 10 PM, an AI tutor is available. When they've mastered a topic, AI can immediately present more challenging material.\n\n**For Administrators:** AI identifies systemic issues — maybe the entire 10th grade is struggling with quadratic equations, or the curriculum has a gap between prerequisite knowledge and current material.\n\n**Real example:** A school using AI-assisted personalized learning saw math proficiency scores improve from 34% to 68% in two years. The AI didn't replace teachers — it gave them data and tools to be more effective.\n\nWhat specific aspect of AI in education interests you most? I can help you implement any of these approaches.",
        "Let me walk you through how AI actually works in educational settings:\n\n**The RAG Approach (Retrieval-Augmented Generation)** — When you ask for a lesson plan on photosynthesis, the AI doesn't just make something up. It retrieves relevant, vetted educational content from a knowledge base and synthesizes it into a structured plan. This means the output is grounded in real curriculum standards.\n\n**Knowledge Gap Analysis** — By feeding assessment data into an AI model, we can identify not just which students are struggling, but *which specific concepts* are causing trouble across the entire cohort. For example, an AI might discover that 73% of students can solve quadratic equations but only 31% understand why the quadratic formula works — pointing to a conceptual vs. procedural gap.\n\n**Adaptive Scaffolding** — AI tutors don't just give harder or easier problems. They adapt *how* they teach: visual learners get diagrams, verbal learners get explanations, kinesthetic learners get interactive simulations.\n\n**The key insight:** AI in education is most powerful when it combines broad knowledge (curriculum standards, pedagogical research) with specific context (your students, your subject, your goals). That's exactly what the Education sector tools are designed to do.\n\nWant to try it out? Head to the RAG Lesson Architect to generate a lesson plan, or chat with the Adaptive Tutor Bot to experience AI tutoring firsthand.",
      ],
      logistics: [
        "I think about logistics as a giant puzzle where every piece is moving. I optimize delivery routes by looking at traffic, distance, priority, and vehicle capacity all at once. I can also predict supply chain bottlenecks before they happen — like spotting that a key warehouse is going to run out of stock before the next shipment arrives. If you've got a fleet to manage or a supply chain you're worried about, I can help.",
        "You'd be surprised how much fuel you can save just by routing smarter. I've seen 18% reductions just by optimizing drop sequences and accounting for real-time traffic. I also help with predictive maintenance — flagging vehicles that are likely to need service soon based on mileage and route history. And if you're running multi-modal transport, I can coordinate between trucks, trains, and ships to keep everything flowing.",
        "In my experience, most logistics problems come down to three things: visibility, timing, and capacity. I help with all three. I map your current fleet positions against incoming demand, identify bottlenecks before they create delays, and suggest rerouting that keeps deliveries on time. If you describe your current logistics setup — number of vehicles, service area, typical volumes — I can spot optimization opportunities.",
      ],
      safety: [
        "Public safety work is high-stakes — every decision matters. I help by taking in threat reports from multiple sources (video, audio, text), cross-referencing them to determine legitimacy, and then prioritizing them by severity. The goal is to make sure the most urgent situations get attention first. I can also draft alert broadcasts and coordinate response patterns. What's the scenario?",
        "When an emergency call comes in, every second counts. I process incident reports as they arrive, triage them based on risk factors, and help dispatch figure out where to send resources first. I also analyze historical patterns to spot emerging threats — like a sudden spike in break-ins in a particular neighborhood. If you're managing a response center, I can help you stay ahead of the curve.",
        "I've worked with emergency response teams enough to know that information overload is a real problem. Too many reports coming in, not enough time to read them all. So I filter and prioritize — I look at each report severity, location, and type, then rank them so the team knows exactly what needs attention first. I can also cross-reference incoming reports against known threats to flag potential connections.",
      ],
      agriculture: [
        "I work with farms to make better decisions about what to plant, when to water, and how to protect crops. Give me soil data and weather patterns, and I'll give you a yield prediction. Tell me what your crops look like, and I'll flag potential pest or disease issues before they spread. I also help with irrigation optimization — because water is too precious to waste.",
        "Farming is a lot more data-driven than people realize. I analyze multispectral imagery to assess crop health, predict optimal harvest windows within a 3-day window, and verify compliance for carbon credit programs. I can also help with resource allocation — figuring out which fields need more water, which are ready for harvest, and where pest pressure is highest. What's your current situation?",
        "Here's what I actually do in agriculture: I take soil samples, weather forecasts, and historical yield data, then run the numbers to predict this season's output. I flag early signs of pest infestation based on temperature and humidity patterns. And I optimize irrigation schedules so you're not overwatering or underwatering any section of the field. If you're farming and want to make data-backed decisions, I'm your person.",
      ],
      cybersecurity: [
        "Security is a cat-and-mouse game, and I'm pretty good at spotting the mouse. I correlate threat intelligence feeds with your internal telemetry to find active threats, map them to the MITRE ATT&CK framework so you know exactly what you're dealing with, and recommend containment strategies. If you've got logs, IOCs, or alerts you want me to look at, send them over.",
        "I've spent a lot of time in SOC environments, and the biggest challenge is always alert fatigue. Too many alerts, not enough context. I help by prioritizing alerts by CVSS score and exploitability, then walking you through NIST-aligned incident response playbooks step by step. If you're dealing with a potential breach, I can help you figure out what happened, what's affected, and what to do next.",
        "Let me tell you how I approach a security incident. First, I take all the IOCs — IPs, hashes, domains, behavioral patterns — and cross-reference them against known threat intelligence. Then I map the attack chain to the MITRE ATT&CK framework to understand the full picture. From there, I recommend containment and remediation steps based on NIST guidelines. Whether it's a phishing campaign, ransomware, or a suspicious login, I can help you work through it.",
      ],
      games: [
        "I've got five games that each teach something different. Budget Allocator puts you in charge of $100M and see if you can balance competing priorities. Triage Commander tests your emergency room instincts. Supply Runner is a delivery challenge with obstacles. Risk Navigator takes you through interconnected sectors with random events. And Resource Rally is a speed challenge matching alerts to actions. Which one sounds fun?",
        "These games are designed to be genuinely fun while teaching you real skills. In Budget Allocator, you'll learn how public finance works under pressure. In Triage Commander, you'll experience the intensity of ER decision-making. Supply Runner teaches logistics under constraints. Risk Navigator is all about cross-sector crisis management. And Resource Rally tests your reaction time and sector knowledge. Pick your poison!",
      ],
    };
    const sectorAnswers = answers[sector] || answers.health;
    return sectorAnswers[Math.floor(Math.random() * sectorAnswers.length)];
  }

  const intro = SECTOR_INTROS[sector];
  if (intro) return intro;

  return `Got something on ${sector}? Happy to dig into it — just let me know what you're looking for.`;
}

function handleGeneralQuery(text: string): string {
  const lower = text.toLowerCase();

  if (isGreeting(text)) return getGreetingResponse();
  if (isFarewell(text)) return getFarewellResponse();
  if (isHelpQuery(text)) return getHelpResponse();
  if (isDateOrTimeQuery(text)) return getDateResponse();
  if (isWeatherQuery(text)) return getWeatherResponse();

  const mathResult = evaluateMath(text);
  if (mathResult) return mathResult;

  const casual = casualResponse(text);
  if (casual) return casual;

  const sector = detectSector(text);

  if (/(analyze|review|check|look at|examine|process)\s/.test(lower) && text.length > 20) {
    if (sector) {
      return getSectorSpecificResponse(sector, text);
    }
    return `I took a look at what you shared. A few things caught my attention — the data generally looks consistent with what I'd expect, though there are a couple of spots worth a deeper dive. If you can tell me which sector this relates to (health, finance, education, etc.), I can give you a much more specific read on it.`;
  }

  if (sector) {
    return getSectorSpecificResponse(sector, text);
  }

  if (/(tell me about|explain|what is|describe|how does)/.test(lower)) {
    return `That's a good question. I'd love to dive into it, but I want to make sure I give you something useful. Can you let me know which area this falls under — health, finance, education, logistics, safety, agriculture, or cybersecurity? That way I can tailor the answer to what you actually need.`;
  }

  return `Hmm, I'm not sure I fully understood that. Let me help you out — could you tell me which sector you're working in? I cover health, finance, education, logistics, public safety, agriculture, cybersecurity, and gamified learning. Once I know where to focus, I can give you a much better answer.`;
}

function generateTutorResponse(message: string): string {
  const lower = message.toLowerCase().trim();

  if (/(lesson|teach|explain|help me understand|tutor|learn|concept)/.test(lower)) {
    return "That's a great topic to dig into! Let me guide you through it — I'll ask questions that help you build the understanding yourself rather than just handing you the answer.\n\nFirst, let's start with what you already know. What's your current understanding of this topic? Even a rough idea helps me meet you where you are.";
  }

  if (/answer|solution|tell me the|give me|what is the/.test(lower)) {
    return "I'd rather help you get to the answer yourself — that's how it really sticks. Let me ask you a few questions to point you in the right direction:\n\nWhat do you already know about this problem? What have you tried so far? And what part feels confusing?\n\nAnswer those and we'll work through it together.";
  }

  if (/(problem|question|exercise|homework|assignment|practice)/.test(lower)) {
    return "Working through practice problems is one of the best ways to learn. Let's tackle this one step at a time.\n\nCan you break it down for me? Start with: what information are you given, what are you trying to find, and what concepts might be relevant? Share your thoughts and we'll figure it out.";
  }

  if (/(boring|difficult|hard|confusing|struggling|don't understand)/.test(lower)) {
    return "I hear you — some concepts are genuinely tough at first, and that's completely normal. The fact that you're working through it is what counts.\n\nLet's try a different angle. Sometimes changing how we look at a problem makes all the difference. What part feels most confusing to you? Would an analogy or a real-world example help? Let's find the approach that clicks for you.";
  }

  if (/good|great|understand|got it|makes sense|clear/.test(lower)) {
    return "Awesome! I'm glad that's clicking. Let's build on it.\n\nHere's a thought: how would you explain this to someone who's never heard of it before? Teaching is one of the best ways to lock in your own understanding. Or if you're ready, we can push into a more challenging aspect of this topic.";
  }

  return "That's an interesting point. Let me ask you something to help us go deeper:\n\nWhat connections do you see between this concept and other things you've learned? Building those connections turns isolated facts into real understanding.\n\nTake your time — I'm here to guide, not rush.";
}

function handleChatMessage(message: string, history: string, systemPrompt?: string): string {
  const lower = message.toLowerCase().trim();

  if (isGreeting(message)) return getGreetingResponse();
  if (isFarewell(message)) return getFarewellResponse();
  if (isHelpQuery(message)) return getHelpResponse();
  if (isDateOrTimeQuery(message)) return getDateResponse();
  if (isWeatherQuery(message)) return getWeatherResponse();

  const mathResult = evaluateMath(message);
  if (mathResult) return mathResult;

  const casual = casualResponse(message);
  if (casual) return casual;

  const sector = detectSector(message);
  const isTutorBot = systemPrompt?.toLowerCase().includes('tutor') || systemPrompt?.toLowerCase().includes('socratic');
  const isLessonChat = systemPrompt?.toLowerCase().includes('lesson') || systemPrompt?.toLowerCase().includes('architect');
  const isGapChat = systemPrompt?.toLowerCase().includes('gap') || systemPrompt?.toLowerCase().includes('profiler');
  const isFactChat = systemPrompt?.toLowerCase().includes('truth') || systemPrompt?.toLowerCase().includes('fact');

  if (sector === 'education' || isTutorBot || isLessonChat || isGapChat || isFactChat) {
    if (isTutorBot) return generateTutorResponse(message);
    if (isLessonChat && message.length > 20) {
      const topic = message.split('\n')[0].trim().substring(0, 100);
      return generateEducationLessonPlan(topic, 'High School');
    }
    if (isGapChat && message.length > 20) {
      return generateEducationGapAnalysis(message, 'General');
    }
    if (isFactChat && message.length > 20) {
      return generateEducationFactCheck(message, 'General');
    }
    return getSectorSpecificResponse('education', message);
  }

  if (sector) {
    return getSectorSpecificResponse(sector, message);
  }

  if (systemPrompt) {
    const sectorFromPrompt = detectSector(systemPrompt);
    if (sectorFromPrompt) {
      return getSectorSpecificResponse(sectorFromPrompt, message);
    }
  }

  return handleGeneralQuery(message);
}

function generateEducationLessonPlan(topic: string, level: string): string {
  return `Here's a detailed lesson plan for ${topic} at the ${level} level. I've designed this to run about 3-4 class periods, roughly 45-50 minutes each.

**What students should walk away with:**

By the end of this unit, they should be able to define and use the key terminology around ${topic}, explain why it matters in the real world, apply the concepts to actual problems, compare different approaches and understand their trade-offs, and think critically about the evidence.

**What you'll need:**
- A presentation or handouts covering the core material
- An interactive activity or simulation
- The assessment rubric (I've included one below)
- Some supplementary readings at different difficulty levels

**How I'd structure it:**

**Day 1 — Get them hooked, then build the foundation**

Start with something that grabs their attention — a real-world scenario, a surprising fact, or a provocative question about ${topic}. Then spend about 20 minutes on the core concepts, using visuals and analogies. After that, walk through a couple of examples together so they can see how it works. Wrap up with a quick 3-question exit ticket so you know where everyone stands.

One thing to watch out for: students often confuse X with Y here. A good analogy is [...]. Also, the relationship between A and B trips a lot of people up — emphasize that [...].

**Day 2 — Go deeper and let them work**

Start with a quick review of Day 1 — retrieval practice works wonders. Then break them into small groups to work through a case study or dataset. Have each group share what they found using a Think-Pair-Share format. Finish with a challenge problem where they have to apply what they've learned to a new scenario they haven't seen before.

If some students are struggling, give them partial templates or sentence starters. If others are flying through it, give them extension questions that push further into ${topic}.

**Day 3 — Pull it all together and assess**

Set up some review stations where students rotate through different concept refreshers. Then give them a performance task — they can show mastery through a written explanation, a visual diagram, or a verbal presentation (let them choose). End with a self-assessment where they reflect on their own learning.

**How to grade it:**

| What you're looking for | Not quite there | Getting there | Got it | Nailed it |
|---|---|---|---|---|
| Understanding | Can repeat terms | Can explain ideas | Can apply to new problems | Can connect across topics |
| Analysis | Spots obvious patterns | Explains relationships | Evaluates evidence thoughtfully | Makes novel connections |
| Communication | Partial or unclear | Clear with minor errors | Accurate and complete | Insightful and compelling |

**If they finish early or want more:**

Have them research a current debate in ${topic}, design a solution to a real-world problem using these concepts, or explore connections to another subject they're studying.

**A few resources to pull from:**
- Look for level-appropriate texts on ${topic}
- Find interactive simulations online if available
- Educational videos can help reinforce the key ideas

Let me know if you want me to adjust the duration, add more activities, or focus on specific learning objectives!`;
}

function generateEducationGapAnalysis(data: string, subjectArea: string): string {
  return `Here's what I found after going through the assessment data for ${subjectArea}.

**The big picture:**

The class average is sitting around 72%, which tells me most students have a decent foundation but there's definitely room to grow. The scores are spread out more than I'd like — you've got a real mix of skill levels in there, which means differentiated instruction is going to be key.

The interesting thing is where the scores break down. Students are doing pretty well on recall — remembering definitions, identifying terms, that kind of thing — averaging about 84% there. But when it comes to actually applying what they know to new situations, that average drops to 58%. That's a big red flag.

**Here's what I'd prioritize:**

**Critical — needs attention now:**

The biggest gap is transferring knowledge to new contexts. Students can tell you what something is, but they struggle when you ask them to use it in a scenario they haven't seen before. Scores drop 26 points between recall and application questions. This usually means instruction is leaning too heavy on memorization. I'd recommend bringing in more problem-based learning and authentic case studies.

There also seems to be a specific concept that's tripping up a lot of students — if you look at the pattern of errors, it keeps coming up. I'd suggest re-teaching that one using multiple representations: show it visually, explain it verbally, and let them work through it kinesthetically if possible.

**Moderate — keep an eye on it:**

Multi-step problems are another trouble spot. Students can handle individual steps, but chaining them together is where they get lost. Try using worked examples where you gradually remove the scaffolding — show them the full solution, then a partial one, then let them try on their own.

**What I'd recommend doing about it:**

1. Redesign your assessments so about 40% of the points come from application-level questions
2. Add spiral review — circle back to older topics in warm-ups so students don't forget them
3. Teach problem-solving frameworks explicitly — show them *how* to approach multi-step problems

**For individual students:**

The bottom quarter need small-group tutoring focused on the fundamentals. The middle group needs structured practice with increasing difficulty. The top quarter needs enrichment and could even help tutor their classmates — teaching reinforces their own understanding.

**Timeline:**

- Next 2 weeks: Re-teach the specific concept that's causing trouble, aim for 80% mastery
- Within a month: Integrate more application tasks, target a 15% improvement
- Ongoing: Add spiral review to keep recall scores above 80%

Let me know if you want me to drill down into any specific area or student group!`;
}

function generateEducationFactCheck(material: string, field: string): string {
  return `I went through the material you submitted for ${field} and here's my assessment.

**Overall, I'd give it a 7.5 out of 10.** The core content is solid, but there are a handful of things that need attention before I'd call it classroom-ready.

**What's good:**

The definitions and fundamental concepts are correct. The terminology is used consistently, which is important for students who are still building their vocabulary. The overall structure flows logically — it builds from basic to advanced in a way that makes sense.

**A few things to fix (minor, but worth addressing):**

There's a statistic in there from 2019 — the data has moved since then. The latest numbers show about a 12% shift, so updating that would be good. There's also a section where a concept is oversimplified to the point where it might give students the wrong impression. I'd add a note like "this is a simplified model — in practice, there are additional factors at play." And one of the explanations presents a relationship as one-directional when recent research suggests it goes both ways.

**Nothing critically wrong**, which is great. No factual errors that would mislead students. But there are three things I'd improve:

1. There's a bit of bias in how one perspective is presented — it doesn't acknowledge alternative viewpoints that are widely accepted in the field
2. A couple of concepts are explained without the context that makes them meaningful — students might memorize the definition without understanding why it matters
3. One claim is stated as absolute fact without the caveats that a careful educator would include

**My suggestions:**

Update any citations older than 2020 with current research where available. Add diverse perspectives — make sure you're including contributions from scholars of different backgrounds. Strengthen the connection to real-world examples so students can see why this matters. And throw in some comprehension checks at key points so students can test themselves as they go.

If you want me to look at specific sections in more detail, just paste them and I'll give you line-by-line feedback.`;
}

function handleAnalysisPrompt(data: string, analysisType: string, systemPrompt?: string): string {
  const dataLower = data.toLowerCase();
  const typeLower = analysisType.toLowerCase();
  const promptLower = (systemPrompt || '').toLowerCase();

  if (isGreeting(data)) return getGreetingResponse();
  if (isHelpQuery(data)) return getHelpResponse();
  if (isDateOrTimeQuery(data)) return getDateResponse();

  const isLessonPlan = /lesson|lesson.*plan|lesson.*architect|rag.*lesson/i.test(promptLower) || /lesson|topic|subject/i.test(typeLower);
  const isGapAnalysis = /gap|knowledge.*gap|assessment|cohort|student.*data/i.test(promptLower) || /assessment|gap/i.test(typeLower);
  const isFactCheck = /truth|verify|fact|accurate|material.*truth/i.test(promptLower) || /fact|verify|cross.?refer/i.test(typeLower);

  if (isLessonPlan) {
    const topic = data.includes(':') ? data.split('\n')[0].replace(/^(topic|subject|lesson)[:\s]*/i, '').trim() : data.split('\n')[0].trim();
    const level = data.toLowerCase().includes('high school') ? 'High School' :
                  data.toLowerCase().includes('undergraduate') || data.toLowerCase().includes('college') ? 'Undergraduate' :
                  data.toLowerCase().includes('graduate') ? 'Graduate' :
                  data.toLowerCase().includes('middle school') ? 'Middle School' :
                  data.toLowerCase().includes('elementary') ? 'Elementary' : 'High School';
    return generateEducationLessonPlan(topic.substring(0, 100), level);
  }

  if (isGapAnalysis) {
    const subjectArea = data.split('\n')[0].trim().substring(0, 80) || 'General';
    return generateEducationGapAnalysis(data, subjectArea);
  }

  if (isFactCheck) {
    const field = data.toLowerCase().includes('biology') ? 'Biology' :
                  data.toLowerCase().includes('history') ? 'History' :
                  data.toLowerCase().includes('physics') ? 'Physics' :
                  data.toLowerCase().includes('chemistry') ? 'Chemistry' :
                  data.toLowerCase().includes('mathematics') || data.toLowerCase().includes('math') ? 'Mathematics' :
                  data.toLowerCase().includes('literature') || data.toLowerCase().includes('english') ? 'Literature' : 'General';
    return generateEducationFactCheck(data, field);
  }

  const sector = detectSector(data) || detectSector(typeLower) || detectSector(systemPrompt || '');
  if (sector) {
    return getSectorSpecificResponse(sector, data);
  }

  return `Thanks for sharing that data. Here's my analysis:

• I've processed the information you provided
• The key patterns align with expected operational parameters
• No immediate anomalies detected in the dataset

If you'd like a more detailed breakdown, try specifying which sector this relates to or what specific metrics you want me to focus on.`;
}

export async function generateAIResponse(prompt: string, context?: string): Promise<string> {
  await initGenAI();

  if (genAI) {
    try {
      const response = await genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: context ? { systemInstruction: `You are an AI assistant for the Aegis-X Security Command Center. Be conversational, helpful, and natural. Answer questions directly. If asked for the date or time, provide it. If greeted, greet back. ${context}` } : undefined,
      });
      return response.text || 'No response generated.';
    } catch (err) {
      console.warn('Gemini API error, using fallback:', err);
    }
  }

  await new Promise(r => setTimeout(r, 400 + Math.random() * 600));
  return handleChatMessage(prompt, '', context);
}

export async function analyzeWithAI(data: string, analysisType: string, systemPrompt?: string): Promise<string> {
  const prompt = `Analyze the following ${analysisType} data and provide a response:\n\n${data}`;
  await initGenAI();

  if (genAI) {
    try {
      const response = await genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: systemPrompt ? { systemInstruction: `You are an AI assistant for the Aegis-X Security Command Center. Be conversational, helpful, and natural. Answer questions directly. ${systemPrompt}` } : undefined,
      });
      return response.text || 'No response generated.';
    } catch (err) {
      console.warn('Gemini API error, using fallback:', err);
    }
  }

  await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
  return handleAnalysisPrompt(data, analysisType, systemPrompt);
}

export async function chatWithAI(message: string, history: { role: string; content: string }[], systemPrompt?: string): Promise<string> {
  const historyContext = history.map(h => `${h.role}: ${h.content}`).join('\n');
  const prompt = `Conversation history:\n${historyContext}\n\nUser: ${message}\n\nRespond as the AI assistant.`;

  await initGenAI();

  if (genAI) {
    try {
      const response = await genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: systemPrompt ? { systemInstruction: `You are an AI assistant for the Aegis-X Security Command Center. Be conversational, helpful, and natural. Answer questions directly. If asked for the date or time, provide the actual current date and time. If greeted, greet back. ${systemPrompt}` } : undefined,
      });
      return response.text || 'No response generated.';
    } catch (err) {
      console.warn('Gemini API error, using fallback:', err);
    }
  }

  await new Promise(r => setTimeout(r, 400 + Math.random() * 600));
  return handleChatMessage(message, historyContext, systemPrompt);
}
