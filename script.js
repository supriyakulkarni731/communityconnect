/* ===================================================
   COMMUNITY CONNECT+ — script.js
   Full feature implementation:
   - 5 Core Modules (Volunteer, FoodShare, ShareCare, HelpNear, Blood Donor)
   - Smart Community Care Network (Elderly, Medical, Medicine, Orphanage)
   - Smart Help Matcher
   - Kindness Points + Achievement Badges
   - QR Donation Confirmation (canvas-based)
   - Impact Dashboard
   - Well-being Daily Check-in
   - SOS Alert System (caregiver notification demo)
   - Medical Camp Locator
   - Volunteer Location Matching
   - Multilingual Labels (EN/KN/HI demo)
   - Elderly-Friendly & Text-to-Speech Toggles
   - Activity Feed
   - Leaderboard
   - Toast Notifications
   - Hamburger Navigation
   - Admin dashboard data support
   =================================================== */

"use strict";

// ============================================================
// CONSTANTS & CONFIG
// ============================================================
const STORAGE_KEYS = {
    volunteers:   "cc_volunteers",
    food:         "cc_food",
    share:        "cc_share",
    help:         "cc_help",
    blood:        "cc_blood",
    elderly:      "cc_elderly",
    medicine:     "cc_medicine",
    camps:        "cc_camps",
    campRegs:     "cc_camp_registrations",
    orphanEdu:    "cc_orphan_edu",
    orphanAct:    "cc_orphan_act",
    wellbeing:    "cc_wellbeing",
    sos:          "cc_sos",
    volmatch:     "cc_volmatch",
    points:       "cc_points",
    activity:     "cc_activity",
    elderlyMode:  "cc_elderly_mode",
    tts:          "cc_tts_mode",
    language:     "cc_language"
};

const POINTS_MAP = {
    volunteer: 50, food: 30, share: 20, help: 40, blood: 60,
    elderly: 40, medicine: 30, campReg: 20, orphanEdu: 50,
    orphanAct: 30, wellbeing: 10, sos: 0, volmatch: 10
};

const MODULE_INFO = {
    volunteer: { label: "Volunteer Connect",        icon: "🤝" },
    food:      { label: "FoodShare",                icon: "🍱" },
    share:     { label: "ShareCare",                icon: "📚" },
    help:      { label: "HelpNear",                 icon: "🏡" },
    blood:     { label: "Blood Donor Connect",      icon: "🩸" },
    elderly:   { label: "Elderly Healthcare",       icon: "👴" },
    medicine:  { label: "Medicine Assistance",      icon: "💊" },
    campReg:   { label: "Medical Camp Registration",icon: "🏕️" },
    orphanEdu: { label: "Orphanage Education",      icon: "🎓" },
    orphanAct: { label: "Orphanage Activities",     icon: "🎨" },
    wellbeing: { label: "Daily Well-being Check-in",icon: "💚" },
    sos:       { label: "SOS Alert",                icon: "🆘" },
    volmatch:  { label: "Location Matching",        icon: "📍" }
};

// Demo Medical Camps
const DEMO_CAMPS = [
    { id: "C001", name: "Free Eye Checkup Camp", date: "2026-11-15", time: "9:00 AM – 1:00 PM", location: "Community Hall, Jayanagar", type: "Eye", slots: 60, registered: 32 },
    { id: "C002", name: "Dental Health Camp",     date: "2026-11-20", time: "10:00 AM – 3:00 PM", location: "Primary School, Koramangala", type: "Dental", slots: 40, registered: 28 },
    { id: "C003", name: "General Health Checkup", date: "2026-11-28", time: "8:00 AM – 12:00 PM", location: "NGO Centre, BTM Layout",   type: "General", slots: 80, registered: 45 },
    { id: "C004", name: "Blood Pressure & Sugar", date: "2026-12-05", time: "9:00 AM – 2:00 PM", location: "Govt. School, Whitefield",   type: "General", slots: 100, registered: 70 }
];

// Language strings (demo)
const LANG = {
    en: { home: "Home", modules: "Modules", careNetwork: "Care Network", wellbeing: "Well-being", matcher: "Get Help", dashboard: "Dashboard", getInvolved: "Get Involved" },
    kn: { home: "ಮನೆ", modules: "ಮಾಡ್ಯೂಲ್‌ಗಳು", careNetwork: "ಆರೈಕೆ ನೆಟ್‌ವರ್ಕ್", wellbeing: "ಆರೋಗ್ಯ", matcher: "ಸಹಾಯ ಪಡೆಯಿರಿ", dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", getInvolved: "ಭಾಗವಹಿಸಿ" },
    hi: { home: "होम", modules: "मॉड्यूल", careNetwork: "देखभाल नेटवर्क", wellbeing: "स्वास्थ्य", matcher: "सहायता पाएं", dashboard: "डैशबोर्ड", getInvolved: "जुड़ें" }
};

// Achievement Badges
const BADGES = [
    { id: "first",    label: "First Contribution",  icon: "🌟", threshold: 1,   type: "any" },
    { id: "food",     label: "Food Saver",           icon: "🍱", threshold: 1,   type: "food" },
    { id: "share",    label: "Resource Sharer",      icon: "📚", threshold: 1,   type: "share" },
    { id: "helper",   label: "Community Helper",     icon: "❤️", threshold: 50,  type: "points" },
    { id: "champion", label: "Volunteer Champion",   icon: "🏆", threshold: 200, type: "points" },
    { id: "guardian", label: "Care Guardian",        icon: "👴", threshold: 1,   type: "elderly" },
    { id: "lifesaver",label: "Life Saver",           icon: "🩸", threshold: 1,   type: "blood" },
    { id: "centurion",label: "Centurion",            icon: "💯", threshold: 100, type: "points" }
];

// TTS state
let ttsEnabled = false;

// ============================================================
// STORAGE HELPERS
// ============================================================
function getStore(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch { return []; }
}
function setStore(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); }
    catch (e) { console.warn("localStorage unavailable:", e); }
}
function getObj(key) {
    try { return JSON.parse(localStorage.getItem(key)) || {}; }
    catch { return {}; }
}
function setObj(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); }
    catch (e) { console.warn("localStorage unavailable:", e); }
}
function getFlag(key) { return localStorage.getItem(key) === "true"; }
function setFlag(key, value) { localStorage.setItem(key, value ? "true" : "false"); }

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
let toastTimer = null;
function showToast(message, type = "info", duration = 3500) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.className = "toast show toast-" + type;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), duration);
}

// ============================================================
// MODAL SYSTEM
// ============================================================
function openModal(type) {
    const idMap = {
        volunteer: "volunteerModal", food: "foodModal", share: "shareModal",
        help: "helpModal", blood: "bloodModal", elderly: "elderlyModal",
        medicine: "medicineModal", campRegister: "campRegisterModal",
        orphanEdu: "orphanEduModal", orphanActivity: "orphanActivityModal",
        volmatch: "volmatchModal", sos: "sosModal",
        points: "pointsModal", confirm: "confirmModal", lang: "langModal"
    };
    const id = idMap[type];
    if (!id) return;
    const overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
    const firstInput = overlay.querySelector("input, select, textarea");
    if (firstInput) setTimeout(() => firstInput.focus(), 100);
}

function closeModal(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.classList.remove("active");
    document.body.style.overflow = "";
}

document.addEventListener("click", function(e) {
    if (e.target.classList.contains("modal-overlay")) {
        e.target.classList.remove("active");
        document.body.style.overflow = "";
    }
});

document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
        document.querySelectorAll(".modal-overlay.active").forEach(m => {
            m.classList.remove("active");
        });
        document.body.style.overflow = "";
    }
});

// ============================================================
// KINDNESS POINTS SYSTEM
// ============================================================
function getPoints() { return getObj(STORAGE_KEYS.points); }
function savePoints(pts) { setObj(STORAGE_KEYS.points, pts); }

function awardPoints(name, type, amount) {
    const pts = getPoints();
    const normName = name.trim().toLowerCase();

    // Prevent duplicate: same person, same type, same day
    const today = new Date().toDateString();
    const dupKey = normName + "_" + type + "_" + today;
    if (pts.__dup && pts.__dup[dupKey]) return false;

    if (!pts[normName]) {
        pts[normName] = { displayName: name.trim(), total: 0, history: [], types: {} };
    }
    pts[normName].total += amount;
    pts[normName].history.unshift({ type, amount, date: new Date().toLocaleString() });
    pts[normName].types = pts[normName].types || {};
    pts[normName].types[type] = (pts[normName].types[type] || 0) + 1;

    if (!pts.__dup) pts.__dup = {};
    pts.__dup[dupKey] = true;

    savePoints(pts);
    updateLeaderboard();
    updateMyPoints(name.trim());
    return true;
}

function getUserPoints(name) {
    const pts = getPoints();
    return pts[name.trim().toLowerCase()] || null;
}

function updateLeaderboard() {
    const pts = getPoints();
    const lb = document.getElementById("leaderboard");
    if (!lb) return;

    const users = Object.entries(pts)
        .filter(([k]) => k !== "__dup")
        .map(([, v]) => v)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

    lb.innerHTML = "";
    if (users.length === 0) {
        lb.innerHTML = '<p class="empty-state">No entries yet. Be the first!</p>';
        return;
    }
    users.forEach((user, i) => {
        const item = document.createElement("div");
        item.className = "leaderboard-item";
        item.setAttribute("role", "listitem");
        const medals = ["🥇", "🥈", "🥉"];
        const rankDisplay = i < 3 ? medals[i] : `#${i+1}`;
        const rankClass = i < 3 ? ` lb-rank-${i+1}` : "";
        item.innerHTML = `
            <span class="lb-rank${rankClass}">${rankDisplay}</span>
            <span class="lb-name">${escapeHtml(user.displayName)}</span>
            <span class="lb-points">⭐ ${user.total}</span>
        `;
        lb.appendChild(item);
    });
}

function updateMyPoints(name) {
    const pts = getPoints();
    const normName = (name || "").trim().toLowerCase();
    const user = pts[normName];
    const numEl = document.getElementById("myPoints");
    const breakdownEl = document.getElementById("pointsBreakdown");
    const badgesEl = document.getElementById("badgesGrid");

    if (!user || !numEl) return;
    numEl.textContent = user.total;

    if (breakdownEl) {
        if (!user.history || user.history.length === 0) {
            breakdownEl.innerHTML = '<p class="points-empty">No activities yet.</p>';
        } else {
            breakdownEl.innerHTML = "";
            user.history.slice(0, 6).forEach(h => {
                const item = document.createElement("div");
                item.className = "points-item";
                const info = MODULE_INFO[h.type] || { label: h.type, icon: "⭐" };
                item.innerHTML = `<span>${info.icon} ${info.label}</span><span class="pts">+${h.amount}</span>`;
                breakdownEl.appendChild(item);
            });
        }
    }

    // Update badges
    if (badgesEl) {
        badgesEl.innerHTML = "";
        BADGES.forEach(badge => {
            const earned = isBadgeEarned(badge, user);
            const badgeEl = document.createElement("div");
            badgeEl.className = "badge-item" + (earned ? " earned" : "");
            badgeEl.textContent = `${badge.icon} ${badge.label}`;
            badgeEl.title = earned ? "Earned!" : `Not yet earned`;
            badgesEl.appendChild(badgeEl);
        });
    }
}

function isBadgeEarned(badge, user) {
    if (!user) return false;
    if (badge.type === "points") return user.total >= badge.threshold;
    if (badge.type === "any") return user.total > 0;
    return (user.types && user.types[badge.type] >= badge.threshold);
}

function checkPoints() { openModal("points"); }

// ============================================================
// ACTIVITY FEED
// ============================================================
function getActivity() { return getStore(STORAGE_KEYS.activity); }

function addActivity(type, name, detail) {
    const acts = getActivity();
    const now = new Date();
    acts.unshift({
        type, name, detail,
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: now.toLocaleDateString()
    });
    if (acts.length > 50) acts.splice(50);
    setStore(STORAGE_KEYS.activity, acts);
    renderActivityFeed();
}

function renderActivityFeed() {
    const feedEl = document.getElementById("activityFeed");
    if (!feedEl) return;
    const acts = getActivity();
    feedEl.innerHTML = "";
    if (acts.length === 0) {
        feedEl.innerHTML = '<li class="feed-item" style="border-left-color:var(--accent);"><span class="feed-icon">🌟</span><span class="feed-text">Start contributing to see activity here</span><span class="feed-time">—</span></li>';
        return;
    }
    acts.forEach(a => {
        const info = MODULE_INFO[a.type] || { label: a.type, icon: "📋" };
        const li = document.createElement("li");
        li.className = "feed-item";
        li.innerHTML = `
            <span class="feed-icon">${info.icon}</span>
            <span class="feed-text"><strong>${escapeHtml(a.name)}</strong> — ${escapeHtml(info.label)}</span>
            <span class="feed-time">${a.time}</span>
        `;
        feedEl.appendChild(li);
    });
}

// ============================================================
// DASHBOARD & HERO STATS
// ============================================================
function updateDashboard() {
    const counts = {
        volunteer: getStore(STORAGE_KEYS.volunteers).length,
        food:      getStore(STORAGE_KEYS.food).length,
        share:     getStore(STORAGE_KEYS.share).length,
        help:      getStore(STORAGE_KEYS.help).length,
        blood:     getStore(STORAGE_KEYS.blood).length,
        elderly:   getStore(STORAGE_KEYS.elderly).length,
        medicine:  getStore(STORAGE_KEYS.medicine).length,
        wellbeing: getStore(STORAGE_KEYS.wellbeing).length,
        campRegs:  getStore(STORAGE_KEYS.campRegs).length
    };

    animateNumber("dashVolNum",   counts.volunteer);
    animateNumber("dashFoodNum",  counts.food);
    animateNumber("dashShareNum", counts.share);
    animateNumber("dashHelpNum",  counts.help);
    animateNumber("dashBloodNum", counts.blood);
    animateNumber("dashElderlyNum", counts.elderly);
    animateNumber("dashMedNum",   counts.medicine);

    const pts = getPoints();
    const totalPts = Object.entries(pts)
        .filter(([k]) => k !== "__dup")
        .reduce((sum, [, v]) => sum + (v.total || 0), 0);
    animateNumber("dashTotalPoints", totalPts);

    // Hero stats
    const totalDonations = counts.food + counts.share;
    const totalHelped = counts.help + counts.volunteer;
    animateNumber("statVolunteers", counts.volunteer);
    animateNumber("statDonations",  totalDonations);
    animateNumber("statHelped",     totalHelped);
    animateNumber("statCamps",      DEMO_CAMPS.length);
}

function animateNumber(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    const current = parseInt(el.textContent) || 0;
    if (current === target) return;
    const steps = 20;
    const increment = (target - current) / steps;
    let step = 0;
    const timer = setInterval(() => {
        step++;
        el.textContent = Math.round(current + increment * step);
        if (step >= steps) { el.textContent = target; clearInterval(timer); }
    }, 600 / steps);
}

// ============================================================
// QR CODE GENERATOR (Canvas-based, no external library)
// ============================================================
function generateQRCode(containerId, text) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    const canvas = document.createElement("canvas");
    const size = 160;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    const seed = hashCode(text);
    const modules = 21;
    const cellSize = size / modules;
    ctx.fillStyle = "#49301F";
    drawFinder(ctx, 0, 0, cellSize);
    drawFinder(ctx, (modules - 7) * cellSize, 0, cellSize);
    drawFinder(ctx, 0, (modules - 7) * cellSize, cellSize);
    const rng = seededRng(seed);
    for (let row = 0; row < modules; row++) {
        for (let col = 0; col < modules; col++) {
            if (isFinderZone(row, col, modules)) continue;
            if (rng() > 0.5) {
                ctx.fillRect(col * cellSize, row * cellSize, cellSize - 0.5, cellSize - 0.5);
            }
        }
    }
    for (let i = 8; i < modules - 8; i++) {
        if (i % 2 === 0) {
            ctx.fillRect(i * cellSize, 6 * cellSize, cellSize - 0.5, cellSize - 0.5);
            ctx.fillRect(6 * cellSize, i * cellSize, cellSize - 0.5, cellSize - 0.5);
        }
    }
    container.appendChild(canvas);
}

function drawFinder(ctx, x, y, cell) {
    ctx.fillStyle = "#49301F";
    ctx.fillRect(x, y, 7 * cell, 7 * cell);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + cell, y + cell, 5 * cell, 5 * cell);
    ctx.fillStyle = "#49301F";
    ctx.fillRect(x + 2 * cell, y + 2 * cell, 3 * cell, 3 * cell);
}

function isFinderZone(row, col, modules) {
    return (row < 8 && col < 8) || (row < 8 && col >= modules - 8) ||
           (row >= modules - 8 && col < 8) || (row === 6 || col === 6);
}

function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function seededRng(seed) {
    let s = seed;
    return function() {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
    };
}

function generateRefCode() {
    return "CC-" + Date.now().toString(36).toUpperCase().slice(-6) + "-" + Math.random().toString(36).slice(2, 5).toUpperCase();
}

// ============================================================
// FORM VALIDATION HELPERS
// ============================================================
function validateField(input) {
    const val = input.value.trim();
    if (input.required && !val) { input.style.borderColor = "var(--danger)"; return false; }
    if (input.type === "email" && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        input.style.borderColor = "var(--danger)"; return false;
    }
    if (input.type === "checkbox" && input.required && !input.checked) {
        return false;
    }
    input.style.borderColor = "";
    return true;
}

function validateForm(form) {
    let valid = true;
    form.querySelectorAll("input[required], select[required], textarea[required]").forEach(el => {
        if (!validateField(el)) valid = false;
    });
    return valid;
}

function showFormMsg(msgId, text, type) {
    const el = document.getElementById(msgId);
    if (!el) return;
    el.textContent = text;
    el.className = "form-msg " + type;
}

function clearFormMsg(msgId) {
    const el = document.getElementById(msgId);
    if (!el) return;
    el.textContent = "";
    el.className = "form-msg";
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function setupLiveValidation(form) {
    form.querySelectorAll("input, select, textarea").forEach(el => {
        el.addEventListener("blur", () => validateField(el));
        el.addEventListener("input", () => { el.style.borderColor = ""; });
    });
}

// ============================================================
// MODULE 1: VOLUNTEER CONNECT
// ============================================================
function setupVolunteerForm() {
    const form = document.getElementById("volunteerForm");
    if (!form) return;
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        clearFormMsg("volMsg");
        if (!validateForm(form)) { showFormMsg("volMsg", "⚠️ Please fill in all required fields.", "error"); return; }
        const name     = document.getElementById("volName").value.trim();
        const email    = document.getElementById("volEmail").value.trim();
        const phone    = document.getElementById("volPhone").value.trim();
        const skills   = document.getElementById("volSkills").value;
        const avail    = document.getElementById("volAvail").value;
        const location = document.getElementById("volLocation").value.trim();
        const locMatch = document.getElementById("volLocationMatch").checked;
        const notes    = document.getElementById("volNotes").value.trim();
        const record   = { name, email, phone, skills, availability: avail, location, locationMatch: locMatch, notes, date: new Date().toISOString(), status: "Active" };
        const volunteers = getStore(STORAGE_KEYS.volunteers);
        volunteers.unshift(record);
        setStore(STORAGE_KEYS.volunteers, volunteers);
        const wasNew = awardPoints(name, "volunteer", POINTS_MAP.volunteer);
        addActivity("volunteer", name, skills + " | " + avail);
        updateDashboard();
        showFormMsg("volMsg", `✅ Thank you ${name}! Registered as a volunteer.${wasNew ? " +50 Kindness Points! ⭐" : " (Points already awarded today.)"}`, "success");
        showToast(`🤝 ${name} joined as a volunteer!${wasNew ? " +50 ⭐" : ""}`, "success");
        speak(`Thank you ${name}. You have registered as a volunteer.`);
        form.reset();
    });
    setupLiveValidation(form);
}

// ============================================================
// MODULE 2: FOODSHARE
// ============================================================
function setupFoodForm() {
    const form = document.getElementById("foodForm");
    if (!form) return;
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        clearFormMsg("foodMsg");
        if (!validateForm(form)) { showFormMsg("foodMsg", "⚠️ Please fill in all required fields.", "error"); return; }
        const name     = document.getElementById("foodName").value.trim();
        const foodType = document.getElementById("foodType").value;
        const quantity = document.getElementById("foodQuantity").value.trim();
        const expiry   = document.getElementById("foodExpiry").value;
        const pickup   = document.getElementById("foodPickup").value.trim();
        const time     = document.getElementById("foodTime").value;
        const contact  = document.getElementById("foodContact").value.trim();
        const refCode  = generateRefCode();
        const record   = { name, foodType, quantity, expiry, pickup, pickupTime: time, contact, refCode, date: new Date().toISOString(), status: "Available" };
        const food = getStore(STORAGE_KEYS.food);
        food.unshift(record);
        setStore(STORAGE_KEYS.food, food);
        const wasNew = awardPoints(name, "food", POINTS_MAP.food);
        addActivity("food", name, foodType + " — " + quantity);
        updateDashboard();
        showFormMsg("foodMsg", `✅ Food donation registered! Ref: ${refCode}${wasNew ? " | +30 ⭐" : ""}`, "success");
        showToast(`🍱 Food donation by ${name}!${wasNew ? " +30 ⭐" : ""}`, "success");
        speak(`Food donation registered. Reference code ${refCode}.`);
        const qrSection = document.getElementById("foodQrSection");
        if (qrSection) {
            qrSection.style.display = "block";
            qrSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
            generateQRCode("foodQrCode", `CC-FOOD|${refCode}|${name}|${foodType}|${quantity}`);
            const refEl = document.getElementById("foodQrRef");
            if (refEl) refEl.textContent = "Reference: " + refCode + " (Demo — not for real transactions)";
        }
        form.reset();
    });
    setupLiveValidation(form);
}

// ============================================================
// MODULE 3: SHARECARE
// ============================================================
function setupShareForm() {
    const form = document.getElementById("shareForm");
    if (!form) return;
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        clearFormMsg("shareMsg");
        if (!validateForm(form)) { showFormMsg("shareMsg", "⚠️ Please fill in all required fields.", "error"); return; }
        const name      = document.getElementById("shareName").value.trim();
        const itemType  = document.getElementById("shareType").value;
        const desc      = document.getElementById("shareDesc").value.trim();
        const condition = document.getElementById("shareCondition").value;
        const location  = document.getElementById("shareLocation").value.trim();
        const contact   = document.getElementById("shareContact").value.trim();
        const record    = { name, itemType, description: desc, condition, location, contact, date: new Date().toISOString(), status: "Available" };
        const share = getStore(STORAGE_KEYS.share);
        share.unshift(record);
        setStore(STORAGE_KEYS.share, share);
        const wasNew = awardPoints(name, "share", POINTS_MAP.share);
        addActivity("share", name, itemType + " — " + condition);
        updateDashboard();
        showFormMsg("shareMsg", `✅ Resource listed! Thank you ${name}.${wasNew ? " +20 Kindness Points ⭐" : ""}`, "success");
        showToast(`📚 ${name} shared resources!${wasNew ? " +20 ⭐" : ""}`, "success");
        speak(`Resources listed successfully. Thank you ${name}.`);
        form.reset();
    });
    setupLiveValidation(form);
}

// ============================================================
// MODULE 4: HELPNEAR
// ============================================================
function setupHelpForm() {
    const form = document.getElementById("helpForm");
    if (!form) return;
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        clearFormMsg("helpMsg");
        if (!validateForm(form)) { showFormMsg("helpMsg", "⚠️ Please fill in all required fields.", "error"); return; }
        const name     = document.getElementById("helpName").value.trim();
        const helpType = document.getElementById("helpType").value;
        const category = document.getElementById("helpCategory").value;
        const urgency  = document.getElementById("helpUrgency").value;
        const desc     = document.getElementById("helpDesc").value.trim();
        const location = document.getElementById("helpLocation").value.trim();
        const contact  = document.getElementById("helpContact").value.trim();
        const record   = { name, helpType, category, urgency, description: desc, location, contact, date: new Date().toISOString(), status: "Open" };
        const help = getStore(STORAGE_KEYS.help);
        help.unshift(record);
        setStore(STORAGE_KEYS.help, help);
        const wasNew = awardPoints(name, "help", POINTS_MAP.help);
        addActivity("help", name, helpType + " — " + category);
        updateDashboard();
        const action = helpType === "Requesting Help" ? "request submitted" : "offer posted";
        showFormMsg("helpMsg", `✅ Help ${action}!${wasNew ? " +40 Kindness Points ⭐" : " Thank you!"}`, "success");
        showToast(`🏡 ${name} — help ${action}!${wasNew ? " +40 ⭐" : ""}`, "success");
        speak(`Help ${action} successfully. Thank you ${name}.`);
        form.reset();
    });
    setupLiveValidation(form);
}

// ============================================================
// MODULE 5: BLOOD DONOR CONNECT
// ============================================================
function setupBloodForm() {
    const form = document.getElementById("bloodForm");
    if (!form) return;
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        clearFormMsg("bloodMsg");
        if (!validateForm(form)) { showFormMsg("bloodMsg", "⚠️ Please fill in all required fields.", "error"); return; }
        const name       = document.getElementById("bloodName").value.trim();
        const bloodGroup = document.getElementById("bloodGroup").value;
        const type       = document.getElementById("bloodType").value;
        const location   = document.getElementById("bloodLocation").value.trim();
        const contact    = document.getElementById("bloodContact").value.trim();
        const notes      = document.getElementById("bloodNotes").value.trim();
        const record     = { name, bloodGroup, type, location, notes, date: new Date().toISOString(), status: "Active" };
        // Contact kept separate (privacy)
        const blood = getStore(STORAGE_KEYS.blood);
        blood.unshift(record);
        setStore(STORAGE_KEYS.blood, blood);
        const wasNew = awardPoints(name, "blood", POINTS_MAP.blood);
        addActivity("blood", name, type + " — " + bloodGroup + " @ " + location);
        updateDashboard();
        showFormMsg("bloodMsg", `✅ Registered as ${type} (${bloodGroup}). A coordinator will be in touch.${wasNew ? " +60 ⭐" : " Thank you!"}`, "success");
        showToast(`🩸 ${name} registered for Blood Donor Connect!${wasNew ? " +60 ⭐" : ""}`, "success");
        speak(`Blood donor registration successful. Thank you ${name}.`);
        form.reset();
    });
    setupLiveValidation(form);
}

// ============================================================
// ELDERLY HEALTHCARE SUPPORT
// ============================================================
function setupElderlyForm() {
    const form = document.getElementById("elderlyForm");
    if (!form) return;
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        clearFormMsg("eldMsg");
        if (!validateForm(form)) { showFormMsg("eldMsg", "⚠️ Please fill in all required fields.", "error"); return; }
        const name      = document.getElementById("eldName").value.trim();
        const age       = document.getElementById("eldAge").value;
        const location  = document.getElementById("eldLocation").value.trim();
        const caregiver = document.getElementById("eldCaregiver").value.trim();
        const conditions= document.getElementById("eldConditions").value.trim();
        const needs     = document.getElementById("eldNeeds").value;
        const record    = { name, age, location, caregiver, conditions, needs, date: new Date().toISOString(), status: "Active" };
        const elderly   = getStore(STORAGE_KEYS.elderly);
        elderly.unshift(record);
        setStore(STORAGE_KEYS.elderly, elderly);
        const wasNew = awardPoints(name, "elderly", POINTS_MAP.elderly);
        addActivity("elderly", name, needs + " | Age: " + age);
        updateDashboard();
        showFormMsg("eldMsg", `✅ Elderly profile registered for ${name}.${wasNew ? " +40 Kindness Points ⭐" : ""}`, "success");
        showToast(`👴 Elderly profile created for ${name}!`, "success");
        speak(`Elderly profile registered for ${name}.`);
        form.reset();
    });
    setupLiveValidation(form);
}

// ============================================================
// MEDICINE ASSISTANCE
// ============================================================
function setupMedicineForm() {
    const form = document.getElementById("medicineForm");
    if (!form) return;
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        clearFormMsg("medMsg");
        if (!validateForm(form)) { showFormMsg("medMsg", "⚠️ Please fill in all required fields.", "error"); return; }
        const name         = document.getElementById("medName").value.trim();
        const medicines    = document.getElementById("medMedicine").value.trim();
        const prescription = document.getElementById("medPrescription").value.trim();
        const location     = document.getElementById("medLocation").value.trim();
        const contact      = document.getElementById("medContact").value.trim();
        const urgency      = document.getElementById("medUrgency").value;
        const record       = { name, medicines, prescription, location, urgency, date: new Date().toISOString(), status: "Pending" };
        const medicine     = getStore(STORAGE_KEYS.medicine);
        medicine.unshift(record);
        setStore(STORAGE_KEYS.medicine, medicine);
        const wasNew = awardPoints(name, "medicine", POINTS_MAP.medicine);
        addActivity("medicine", name, "Medicine request — " + urgency);
        updateDashboard();
        showFormMsg("medMsg", `✅ Medicine request submitted for ${name}. Status: Pending.${wasNew ? " +30 ⭐" : ""}`, "success");
        showToast(`💊 Medicine request by ${name}!`, "success");
        speak(`Medicine assistance request submitted for ${name}.`);
        form.reset();
    });
    setupLiveValidation(form);
}

// ============================================================
// MEDICAL CAMPS
// ============================================================
function showMedicalCamps() {
    const section = document.getElementById("medical-camps");
    if (!section) return;
    section.style.display = "block";
    section.scrollIntoView({ behavior: "smooth" });
    renderMedicalCamps();
}

function renderMedicalCamps() {
    const grid = document.getElementById("campGrid");
    if (!grid) return;
    const campSelect = document.getElementById("campSelect");
    if (campSelect) campSelect.innerHTML = '<option value="">Select a camp...</option>';
    grid.innerHTML = "";
    DEMO_CAMPS.forEach(camp => {
        const remaining = camp.slots - camp.registered;
        const full = remaining <= 0;
        const card = document.createElement("div");
        card.className = "camp-card";
        card.innerHTML = `
            <div class="card-badge medical-badge">${camp.type}</div>
            <h4>${escapeHtml(camp.name)}</h4>
            <p>📅 ${camp.date} | ⏰ ${camp.time}</p>
            <p>📍 ${escapeHtml(camp.location)}</p>
            <span class="camp-slots${full ? ' full' : ''}">${full ? "Full" : remaining + " slots remaining"}</span>
            <br>
            <button class="button btn-sm" style="margin-top:10px;" onclick="openModal('campRegister')" ${full ? "disabled" : ""}>
                ${full ? "Camp Full" : "📋 Register Slot"}
            </button>
        `;
        grid.appendChild(card);
        if (campSelect && !full) {
            const opt = document.createElement("option");
            opt.value = camp.id;
            opt.textContent = `${camp.name} — ${camp.date}`;
            campSelect.appendChild(opt);
        }
    });
}

function setupCampRegisterForm() {
    const form = document.getElementById("campRegisterForm");
    if (!form) return;
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        clearFormMsg("campMsg");
        if (!validateForm(form)) { showFormMsg("campMsg", "⚠️ Please fill in all required fields.", "error"); return; }
        const name     = document.getElementById("campRegName").value.trim();
        const campId   = document.getElementById("campSelect").value;
        const phone    = document.getElementById("campRegPhone").value.trim();
        if (!campId) { showFormMsg("campMsg", "⚠️ Please select a camp.", "error"); return; }
        const camp     = DEMO_CAMPS.find(c => c.id === campId);
        const record   = { name, campId, campName: camp ? camp.name : campId, phone, date: new Date().toISOString() };
        const campRegs = getStore(STORAGE_KEYS.campRegs);
        campRegs.unshift(record);
        setStore(STORAGE_KEYS.campRegs, campRegs);
        awardPoints(name, "campReg", POINTS_MAP.campReg);
        addActivity("campReg", name, "Registered for " + (camp ? camp.name : campId));
        updateDashboard();
        showFormMsg("campMsg", `✅ ${name} registered for ${camp ? camp.name : "camp"}! +20 ⭐`, "success");
        showToast(`🏕️ ${name} registered for medical camp!`, "success");
        form.reset();
    });
}

// ============================================================
// ORPHANAGE SUPPORT
// ============================================================
function showOrphanSection() {
    const section = document.getElementById("orphanage");
    if (!section) return;
    section.style.display = "block";
    section.scrollIntoView({ behavior: "smooth" });
}

function setupOrphanTabs() {
    document.querySelectorAll(".orphan-tab").forEach(tab => {
        tab.addEventListener("click", function() {
            document.querySelectorAll(".orphan-tab").forEach(t => t.classList.remove("active"));
            this.classList.add("active");
            const panel = this.dataset.panel;
            document.querySelectorAll(".orphan-panel").forEach(p => p.classList.remove("active"));
            const target = document.getElementById("panel-" + panel);
            if (target) target.classList.add("active");
        });
    });
}

function setupOrphanEduForm() {
    const form = document.getElementById("orphanEduForm");
    if (!form) return;
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        clearFormMsg("orphEduMsg");
        if (!validateForm(form)) { showFormMsg("orphEduMsg", "⚠️ Please fill in all required fields.", "error"); return; }
        const name    = document.getElementById("orphSponsorName").value.trim();
        const type    = document.getElementById("orphSponsorType").value;
        const contact = document.getElementById("orphSponsorContact").value.trim();
        const note    = document.getElementById("orphSponsorNote").value.trim();
        const record  = { name, sponsorshipType: type, contact, note, date: new Date().toISOString() };
        const orphEdu = getStore(STORAGE_KEYS.orphanEdu);
        orphEdu.unshift(record);
        setStore(STORAGE_KEYS.orphanEdu, orphEdu);
        awardPoints(name, "orphanEdu", POINTS_MAP.orphanEdu);
        addActivity("orphanEdu", name, type);
        showFormMsg("orphEduMsg", `✅ Sponsorship submitted! Thank you ${name}. +50 ⭐`, "success");
        showToast(`🎓 Education sponsorship by ${name}!`, "success");
        form.reset();
    });
}

function setupOrphanActivityForm() {
    const form = document.getElementById("orphanActivityForm");
    if (!form) return;
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        clearFormMsg("orphActMsg");
        if (!validateForm(form)) { showFormMsg("orphActMsg", "⚠️ Please fill in all required fields.", "error"); return; }
        const name    = document.getElementById("orphActName").value.trim();
        const type    = document.getElementById("orphActType").value;
        const contact = document.getElementById("orphActContact").value.trim();
        const record  = { name, activityType: type, contact, date: new Date().toISOString() };
        const orphAct = getStore(STORAGE_KEYS.orphanAct);
        orphAct.unshift(record);
        setStore(STORAGE_KEYS.orphanAct, orphAct);
        awardPoints(name, "orphanAct", POINTS_MAP.orphanAct);
        addActivity("orphanAct", name, type);
        showFormMsg("orphActMsg", `✅ Activity support registered! Thank you ${name}. +30 ⭐`, "success");
        showToast(`🎨 Activity support by ${name}!`, "success");
        form.reset();
    });
}

function showOrphanRecords(panel) {
    showToast(`📋 ${panel} records coming from admin — connect backend for live data.`, "info");
}

// ============================================================
// DAILY WELL-BEING CHECK-IN
// ============================================================
let selectedWellbeing = null;

function setupWellbeing() {
    document.querySelectorAll(".wellbeing-opt").forEach(opt => {
        opt.addEventListener("click", function() {
            document.querySelectorAll(".wellbeing-opt").forEach(o => o.classList.remove("selected"));
            this.classList.add("selected");
            selectedWellbeing = this.dataset.response;
            const result = document.getElementById("wellbeingResult");
            if (!result) return;
            const messages = {
                good: { text: "😊 Great to hear! Your check-in has been noted.", cls: "good" },
                assist: { text: "🙏 Noted. A community volunteer will check in with you soon.", cls: "assist" },
                contact: { text: "📞 Noted. We will arrange for someone to contact you today.", cls: "contact" }
            };
            const m = messages[selectedWellbeing];
            result.textContent = m.text;
            result.className = "wellbeing-result show " + m.cls;
        });
    });
}

function submitWellbeing() {
    const name = document.getElementById("wellbeingName").value.trim();
    const msgEl = document.getElementById("wellbeingMsg");
    if (!name) { showFormMsg("wellbeingMsg", "⚠️ Please enter your name.", "error"); return; }
    if (!selectedWellbeing) { showFormMsg("wellbeingMsg", "⚠️ Please select how you are feeling.", "error"); return; }
    const record = { name, response: selectedWellbeing, date: new Date().toISOString() };
    const wb = getStore(STORAGE_KEYS.wellbeing);
    wb.unshift(record);
    setStore(STORAGE_KEYS.wellbeing, wb);
    awardPoints(name, "wellbeing", POINTS_MAP.wellbeing);
    addActivity("wellbeing", name, "Daily check-in: " + selectedWellbeing);
    updateDashboard();
    showFormMsg("wellbeingMsg", `✅ Check-in recorded for ${name}. Thank you! +10 ⭐`, "success");
    showToast(`💚 Well-being check-in by ${name}!`, "success");
    speak(`Check in recorded. Thank you ${name}.`);
    document.getElementById("wellbeingName").value = "";
    document.querySelectorAll(".wellbeing-opt").forEach(o => o.classList.remove("selected"));
    selectedWellbeing = null;
    const result = document.getElementById("wellbeingResult");
    if (result) result.className = "wellbeing-result";
}

// ============================================================
// SOS ALERT
// ============================================================
function triggerSOS() {
    openModal("sos");
}

function setupSOSForm() {
    const form = document.getElementById("sosForm");
    if (!form) return;
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        clearFormMsg("sosMsg");
        if (!validateForm(form)) { showFormMsg("sosMsg", "⚠️ Please fill in all required fields.", "error"); return; }
        const name     = document.getElementById("sosName").value.trim();
        const location = document.getElementById("sosLocation").value.trim();
        const medical  = document.getElementById("sosMedical").value.trim();
        const record   = { name, location, description: medical, date: new Date().toISOString(), status: "Alert Sent" };
        const sos = getStore(STORAGE_KEYS.sos);
        sos.unshift(record);
        setStore(STORAGE_KEYS.sos, sos);
        addActivity("sos", name, "SOS Alert from " + location);
        showFormMsg("sosMsg", `🆘 SOS alert recorded for ${name}. Caregivers and administrators have been notified. For genuine emergencies, call 112 immediately.`, "success");
        showToast(`🆘 SOS alert sent for ${name}!`, "error", 6000);
        speak(`SOS alert sent. If this is a genuine emergency, please call 1 1 2 immediately.`);
        form.reset();
    });
}

// ============================================================
// VOLUNTEER LOCATION MATCHING
// ============================================================
function setupVolmatchForm() {
    const form = document.getElementById("volmatchForm");
    if (!form) return;
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        clearFormMsg("vmMsg");
        const name    = document.getElementById("vmName").value.trim();
        const area    = document.getElementById("vmArea").value.trim();
        const consent = document.getElementById("vmConsent").checked;
        if (!name || !area) { showFormMsg("vmMsg", "⚠️ Please fill in all required fields.", "error"); return; }
        if (!consent) { showFormMsg("vmMsg", "⚠️ You must consent to location matching.", "error"); return; }
        const record = { name, area, date: new Date().toISOString(), active: true };
        const vm = getStore(STORAGE_KEYS.volmatch);
        vm.unshift(record);
        setStore(STORAGE_KEYS.volmatch, vm);
        awardPoints(name, "volmatch", POINTS_MAP.volmatch);
        addActivity("volmatch", name, "Location matching enabled — " + area);
        showFormMsg("vmMsg", `✅ Location matching enabled for ${name} in ${area}. +10 ⭐`, "success");
        showToast(`📍 ${name} enabled location-based matching!`, "success");
        form.reset();
    });
}

// ============================================================
// GENERAL COMMUNITY FORM
// ============================================================
function setupCommunityForm() {
    const form = document.getElementById("communityForm");
    if (!form) return;
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        const moduleVal = document.getElementById("module").value;
        const nameVal   = document.getElementById("nameGeneral").value.trim();
        const descVal   = document.getElementById("descriptionGeneral").value.trim();
        const msgEl     = document.getElementById("message");
        if (!moduleVal) { if (msgEl) { msgEl.textContent = "⚠️ Please select a module."; msgEl.className = "form-msg error"; } return; }
        if (!nameVal)   { if (msgEl) { msgEl.textContent = "⚠️ Please enter your name."; msgEl.className = "form-msg error"; } return; }
        if (!descVal)   { if (msgEl) { msgEl.textContent = "⚠️ Please enter details."; msgEl.className = "form-msg error"; } return; }
        const key = STORAGE_KEYS[moduleVal] || STORAGE_KEYS.volunteers;
        const store = getStore(key);
        store.unshift({ name: nameVal, description: descVal, module: moduleVal, date: new Date().toISOString(), source: "quick-form" });
        setStore(key, store);
        const wasNew = awardPoints(nameVal, moduleVal, POINTS_MAP[moduleVal] || 10);
        addActivity(moduleVal, nameVal, descVal.slice(0, 50));
        updateDashboard();
        const pts = POINTS_MAP[moduleVal] || 10;
        if (msgEl) {
            msgEl.textContent = `✅ Thank you ${nameVal}! Registered for ${MODULE_INFO[moduleVal]?.label || moduleVal}.${wasNew ? ` +${pts} ⭐` : ""}`;
            msgEl.className = "form-msg success";
        }
        showToast(`✅ ${nameVal} registered for ${MODULE_INFO[moduleVal]?.label}!`, "success");
        form.reset();
    });
}

// ============================================================
// POINTS LOOKUP MODAL
// ============================================================
function setupPointsLookup() {
    const form = document.getElementById("pointsLookupForm");
    if (!form) return;
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        const name = document.getElementById("lookupName").value.trim();
        const resultEl = document.getElementById("lookupResult");
        if (!name || !resultEl) return;
        const pts = getPoints();
        const user = pts[name.toLowerCase()];
        if (user) {
            const historyHtml = (user.history || []).slice(0, 6).map(h => {
                const info = MODULE_INFO[h.type] || { label: h.type, icon: "⭐" };
                return `<div class="points-item">${info.icon} ${info.label} <span class="pts">+${h.amount}</span></div>`;
            }).join("");
            const badgeHtml = BADGES.filter(b => isBadgeEarned(b, user))
                .map(b => `<span class="badge-item earned">${b.icon} ${b.label}</span>`).join("");
            resultEl.innerHTML = `
                <div class="lookup-found">
                    <h3>⭐ ${escapeHtml(user.displayName)}</h3>
                    <p><strong>Total Kindness Points: ${user.total}</strong></p>
                    ${historyHtml}
                    ${badgeHtml ? `<div class="badges-grid" style="margin-top:12px;">${badgeHtml}</div>` : ""}
                </div>`;
        } else {
            resultEl.innerHTML = `<div class="lookup-not-found">❌ No record found for "${escapeHtml(name)}". Use the same name as when you registered.</div>`;
        }
    });
}

// ============================================================
// SMART HELP MATCHER
// ============================================================
function setupMatcher() {
    const recommendations = {
        volunteer: {
            title: "Volunteer Connect 🤝",
            message: "Register your skills and join local community events. You'll earn 50 Kindness Points for registering!",
            action: "volunteer", section: "#volunteer-connect"
        },
        food: {
            title: "FoodShare 🍱",
            message: "Donate surplus food or request food assistance. We'll connect you with community organizations. QR confirmation included!",
            action: "food", section: "#foodshare"
        },
        items: {
            title: "ShareCare 📚",
            message: "Share books, clothes, toys, and essentials with families in need. Every item makes a difference.",
            action: "share", section: "#sharecare"
        },
        help: {
            title: "HelpNear 🏡",
            message: "For non-emergency assistance — errands, companionship, medical appointments, tech help, and more.",
            action: "help", section: "#helpnear"
        },
        blood: {
            title: "Blood Donor Connect 🩸",
            message: "Register as a voluntary blood donor or find donors for a patient. Privacy is guaranteed — all contact via a coordinator.",
            action: "blood", section: "#blood-donor-connect"
        },
        elderly: {
            title: "Elderly Healthcare Support 👴",
            message: "Register for elderly health support, medicine reminders, caregiver connections, and daily well-being check-ins.",
            action: "elderly", section: "#sccn"
        }
    };

    const opts = document.querySelectorAll(".matcher-opt");
    const resultEl = document.getElementById("matcherResult");

    opts.forEach(opt => {
        opt.addEventListener("click", function() {
            opts.forEach(o => o.classList.remove("selected"));
            this.classList.add("selected");
            const key = this.getAttribute("data-key");
            const rec = recommendations[key];
            if (!rec || !resultEl) return;
            resultEl.innerHTML = `
                <h3>${rec.title}</h3>
                <p>${rec.message}</p>
                <a href="${rec.section}" class="matcher-link" onclick="setTimeout(()=>openModal('${rec.action}'),600)">
                    📋 Register Now
                </a>
                <a href="${rec.section}" class="matcher-link" style="background:var(--soft-beige);color:var(--primary);">
                    👁️ View Module
                </a>
            `;
            resultEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
            speak(`${rec.title} selected. ${rec.message}`);
        });
    });
}

// ============================================================
// ELDERLY MODE TOGGLE
// ============================================================
function setupElderlyModeToggle() {
    const btn = document.getElementById("elderlyToggleBtn");
    if (!btn) return;
    const isOn = getFlag(STORAGE_KEYS.elderlyMode);
    if (isOn) { document.body.classList.add("elderly-mode"); btn.classList.add("active"); btn.setAttribute("aria-pressed", "true"); }
    btn.addEventListener("click", function() {
        const active = document.body.classList.toggle("elderly-mode");
        this.classList.toggle("active", active);
        this.setAttribute("aria-pressed", String(active));
        setFlag(STORAGE_KEYS.elderlyMode, active);
        showToast(active ? "👴 Elderly-Friendly Mode ON — Larger text & buttons!" : "👁️ Elderly Mode OFF", "info");
    });
}

// ============================================================
// TEXT-TO-SPEECH
// ============================================================
function speak(text) {
    if (!ttsEnabled) return;
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.9;
    utter.lang = "en-IN";
    window.speechSynthesis.speak(utter);
}

function setupTTS() {
    const btn = document.getElementById("ttsBtn");
    if (!btn) return;
    ttsEnabled = getFlag(STORAGE_KEYS.tts);
    if (ttsEnabled) { btn.classList.add("active"); btn.setAttribute("aria-pressed", "true"); }
    btn.addEventListener("click", function() {
        ttsEnabled = !ttsEnabled;
        this.classList.toggle("active", ttsEnabled);
        this.setAttribute("aria-pressed", String(ttsEnabled));
        setFlag(STORAGE_KEYS.tts, ttsEnabled);
        if (ttsEnabled) { speak("Read aloud mode is now on."); showToast("🔊 Read Aloud ON", "info"); }
        else { window.speechSynthesis && window.speechSynthesis.cancel(); showToast("🔇 Read Aloud OFF", "info"); }
    });
}

// ============================================================
// LANGUAGE SELECTOR
// ============================================================
function setLanguage(lang) {
    localStorage.setItem(STORAGE_KEYS.language, lang);
    closeModal("langModal");
    showToast(`🌐 Language set to ${lang === 'kn' ? 'Kannada' : lang === 'hi' ? 'Hindi' : 'English'} (Demo labels only)`, "info");
}

function setupLangBtn() {
    const btn = document.getElementById("langBtn");
    if (!btn) return;
    btn.addEventListener("click", () => openModal("lang"));
}

// ============================================================
// HAMBURGER MENU
// ============================================================
function setupHamburger() {
    const btn = document.getElementById("hamburger");
    const nav = document.getElementById("mainNav");
    if (!btn || !nav) return;
    btn.addEventListener("click", function() {
        const isOpen = nav.classList.toggle("open");
        this.setAttribute("aria-expanded", String(isOpen));
    });
    nav.querySelectorAll("a").forEach(a => {
        a.addEventListener("click", () => {
            nav.classList.remove("open");
            btn.setAttribute("aria-expanded", "false");
        });
    });
    document.addEventListener("click", function(e) {
        if (!nav.contains(e.target) && !btn.contains(e.target)) {
            nav.classList.remove("open");
            btn.setAttribute("aria-expanded", "false");
        }
    });
}

// ============================================================
// CARD KEYBOARD ACCESSIBILITY
// ============================================================
function setupCardKeys() {
    document.querySelectorAll(".card[tabindex='0']").forEach(card => {
        card.addEventListener("keydown", function(e) {
            if (e.key === "Enter" || e.key === " ") {
                const btn = this.querySelector(".card-btn");
                if (btn) btn.click();
            }
        });
    });
}

// ============================================================
// DATA CLEAR
// ============================================================
function confirmClear() { openModal("confirm"); }

function clearAllData() {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    closeModal("confirmModal");
    updateDashboard();
    updateLeaderboard();
    renderActivityFeed();
    showToast("🗑️ All demo data cleared.", "info");
    ["statVolunteers", "statDonations", "statHelped", "statCamps"].forEach(id => {
        const el = document.getElementById(id);
        if (el && id !== "statCamps") el.textContent = "0";
    });
    const numEl = document.getElementById("myPoints");
    if (numEl) numEl.textContent = "0";
    const bdEl = document.getElementById("pointsBreakdown");
    if (bdEl) bdEl.innerHTML = '<p class="points-empty">No activities yet. Start contributing to earn points!</p>';
    const badgesEl = document.getElementById("badgesGrid");
    if (badgesEl) badgesEl.innerHTML = "";
}

// ============================================================
// SCROLL ANIMATIONS
// ============================================================
function setupScrollAnimations() {
    if (!window.IntersectionObserver) return;
    const elements = document.querySelectorAll(".card, .dash-card, .how-step, .value-chip, .kindness-card, .leaderboard-card, .sccn-card");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = "slideUp 0.5s ease forwards";
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    elements.forEach((el, i) => {
        el.style.opacity = "0";
        el.style.animationDelay = `${i * 0.04}s`;
        observer.observe(el);
    });
}

// ============================================================
// ACTIVE NAV HIGHLIGHT
// ============================================================
function setupActiveNav() {
    const sections = document.querySelectorAll("section[id], div[id]");
    const navLinks = document.querySelectorAll("nav a[href^='#']");
    if (!navLinks.length) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
                });
            }
        });
    }, { threshold: 0.4 });
    sections.forEach(section => observer.observe(section));
}

// ============================================================
// INIT
// ============================================================
document.addEventListener("DOMContentLoaded", function() {
    // Core toggles
    setupElderlyModeToggle();
    setupTTS();
    setupLangBtn();
    setupHamburger();

    // Smart Help Matcher
    setupMatcher();

    // 5 Core Module Forms
    setupVolunteerForm();
    setupFoodForm();
    setupShareForm();
    setupHelpForm();
    setupBloodForm();

    // Smart Community Care Network
    setupElderlyForm();
    setupMedicineForm();
    setupCampRegisterForm();
    setupOrphanEduForm();
    setupOrphanActivityForm();
    setupOrphanTabs();

    // Well-being & SOS
    setupWellbeing();
    setupSOSForm();

    // Location matching
    setupVolmatchForm();

    // General form & points
    setupCommunityForm();
    setupPointsLookup();

    // UI enhancements
    setupCardKeys();
    setupScrollAnimations();
    setupActiveNav();

    // Initial data render
    updateDashboard();
    updateLeaderboard();
    renderActivityFeed();
    renderMedicalCamps();

    // Expose globals needed by inline onclick handlers
    window.openModal         = openModal;
    window.closeModal        = closeModal;
    window.confirmClear      = confirmClear;
    window.clearAllData      = clearAllData;
    window.checkPoints       = checkPoints;
    window.showMedicalCamps  = showMedicalCamps;
    window.showOrphanSection = showOrphanSection;
    window.showOrphanRecords = showOrphanRecords;
    window.submitWellbeing   = submitWellbeing;
    window.triggerSOS        = triggerSOS;
    window.setLanguage       = setLanguage;
});
