// RFS LinkedIn Fast-Scout & Runner Invite — popup logic

const STORAGE_KEY = "rfs_fast_scout_draft";

const els = {
  candidateName: document.getElementById("candidateName"),
  startupStage: document.getElementById("startupStage"),
  runningPace: document.getElementById("runningPace"),
  output: document.getElementById("output"),
  generateInvite: document.getElementById("generateInvite"),
  generateIcebreaker: document.getElementById("generateIcebreaker"),
  copyBtn: document.getElementById("copyBtn"),
  copyStatus: document.getElementById("copyStatus"),
  clearDraft: document.getElementById("clearDraft"),
  statusDot: document.getElementById("statusDot"),
};

// ---------- Template engine ----------

const STAGE_HOOKS = {
  Ideation: [
    "still shaping the idea",
    "in the earliest build-and-validate phase",
  ],
  MVP: ["heads-down shipping the MVP", "in full build mode"],
  Seed: ["fresh off (or chasing) a seed round", "scaling past the early seed grind"],
  "Round A": ["deep in Series A execution mode", "scaling the team post-Series A"],
  "VC Investor": ["meeting founders all week", "sourcing the next great deal"],
};

const STAGE_TOPICS = {
  Ideation: ["problem validation", "first 10 customer interviews", "finding a co-founder"],
  MVP: ["shipping velocity", "first real user feedback", "scrappy growth hacks"],
  Seed: ["fundraising strategy", "hiring the first 10", "finding product-market fit"],
  "Round A": ["scaling go-to-market", "building out leadership", "board dynamics"],
  "VC Investor": ["deal flow", "what makes a founder fundable", "portfolio support"],
};

function firstNameOf(fullNameAndRole) {
  const trimmed = (fullNameAndRole || "").trim();
  if (!trimmed) return "there";
  const namePart = trimmed.split(",")[0].trim();
  const first = namePart.split(" ")[0];
  return first || "there";
}

function roleOf(fullNameAndRole) {
  const trimmed = (fullNameAndRole || "").trim();
  const parts = trimmed.split(",");
  if (parts.length > 1) return parts.slice(1).join(",").trim();
  return "";
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateInviteMessage() {
  const nameRole = els.candidateName.value.trim();
  const stage = els.startupStage.value;
  const pace = els.runningPace.value;
  const first = firstNameOf(nameRole);
  const role = roleOf(nameRole);
  const hook = pick(STAGE_HOOKS[stage] || ["building something great"]);

  const roleLine = role ? ` — always great to see a ${role} pushing something forward` : "";

  const isInvestor = stage === "VC Investor";
  const angle = isInvestor
    ? "swap notes on what you're seeing across your portfolio and the deals that excite you right now"
    : `talk through where things stand at your ${stage.toLowerCase()} stage`;

  return `Hi ${first},

Loved connecting${roleLine}. Sounds like you're ${hook} right now — respect the grind.

I run "Run For Startups" (RFS): a no-pitch, no-ego 10km morning run for founders and investors, followed by a casual fireside chat over coffee. We keep the pace relaxed (~${pace}), so it's really just good conversation with your feet moving.

Would love to have you join the next session — a great chance to ${angle}, and meet a few other sharp people in the ecosystem along the way.

No agenda, no slides — just running shoes and honest conversation.

Any chance you're free for the next one? Happy to send over the date/location.

Best,
[Your Name]
Founder, Run For Startups`;
}

function generateIcebreakers() {
  const nameRole = els.candidateName.value.trim();
  const stage = els.startupStage.value;
  const first = firstNameOf(nameRole);
  const topics = STAGE_TOPICS[stage] || ["what you're building"];
  const t1 = topics[0];
  const t2 = topics.length > 1 ? topics[1] : topics[0];

  const isInvestor = stage === "VC Investor";

  const q1 = isInvestor
    ? `${first}, what's one signal in a founder's first 10 minutes that makes you lean in — and one that makes you check out?`
    : `${first}, what's the one thing about ${t1} that's harder than it looked from the outside?`;

  const q2 = isInvestor
    ? `Across your portfolio, what's a piece of advice you find yourself repeating to almost every founder?`
    : `If you had one extra pair of hands on ${t2} this month, what would you have them do first?`;

  return `Running Icebreakers for ${first || "them"} (${stage}):

1. ${q1}

2. ${q2}`;
}

// ---------- Clipboard ----------

async function copyToClipboard(text) {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for contexts where the async clipboard API is blocked
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    let success = false;
    try {
      success = document.execCommand("copy");
    } catch (e) {
      success = false;
    }
    document.body.removeChild(textarea);
    return success;
  }
}

function showCopyStatus(message, ok) {
  els.copyStatus.textContent = message;
  els.copyStatus.classList.add("visible");
  els.copyBtn.classList.toggle("copied", !!ok);
  const label = els.copyBtn.textContent;
  if (ok) els.copyBtn.textContent = "Copied ✓";
  setTimeout(() => {
    els.copyStatus.classList.remove("visible");
    els.copyBtn.classList.remove("copied");
    els.copyBtn.textContent = "Copy to Clipboard";
  }, 1800);
}

// ---------- Draft persistence ----------

let saveTimeout = null;

function currentDraft() {
  return {
    candidateName: els.candidateName.value,
    startupStage: els.startupStage.value,
    runningPace: els.runningPace.value,
    output: els.output.value,
  };
}

function saveDraft() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    chrome.storage.local.set({ [STORAGE_KEY]: currentDraft() }, () => {
      pulseStatusDot();
    });
  }, 300);
}

function pulseStatusDot() {
  els.statusDot.style.background = "#2ee6a6";
  els.statusDot.style.boxShadow = "0 0 8px #2ee6a6";
  setTimeout(() => {
    els.statusDot.style.background = "";
    els.statusDot.style.boxShadow = "";
  }, 400);
}

function loadDraft() {
  chrome.storage.local.get([STORAGE_KEY], (result) => {
    const draft = result[STORAGE_KEY];
    if (!draft) return;
    els.candidateName.value = draft.candidateName || "";
    if (draft.startupStage) els.startupStage.value = draft.startupStage;
    if (draft.runningPace) els.runningPace.value = draft.runningPace;
    els.output.value = draft.output || "";
  });
}

function clearDraft() {
  chrome.storage.local.remove(STORAGE_KEY, () => {
    els.candidateName.value = "";
    els.startupStage.selectedIndex = 0;
    els.runningPace.selectedIndex = 0;
    els.output.value = "";
    els.copyStatus.textContent = "";
    els.copyStatus.classList.remove("visible");
  });
}

// ---------- Wiring ----------

els.generateInvite.addEventListener("click", () => {
  els.output.value = generateInviteMessage();
  saveDraft();
});

els.generateIcebreaker.addEventListener("click", () => {
  els.output.value = generateIcebreakers();
  saveDraft();
});

els.copyBtn.addEventListener("click", async () => {
  const ok = await copyToClipboard(els.output.value);
  showCopyStatus(ok ? "Copied to clipboard!" : "Copy failed — select & copy manually.", ok);
});

els.clearDraft.addEventListener("click", clearDraft);

[els.candidateName, els.startupStage, els.runningPace, els.output].forEach((el) => {
  el.addEventListener("input", saveDraft);
  el.addEventListener("change", saveDraft);
});

document.addEventListener("DOMContentLoaded", loadDraft);
loadDraft();
