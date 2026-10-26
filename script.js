/* ===================================================
   COMMUNITY CONNECT — script.js
   Full feature implementation:
   - 5 Module Forms with localStorage
   - Smart Help Matcher
   - Kindness Points System
   - QR Donation Confirmation (canvas-based)
   - Impact Dashboard
   - Activity Feed
   - Elderly-Friendly & Dark Mode Toggles
   - Leaderboard
   - Toast Notifications
   - Hamburger Navigation
   - General Form Handler
   =================================================== */

"use strict";

// ============================================================
// CONSTANTS & CONFIG
// ============================================================
const STORAGE_KEYS = {
    volunteers: "cc_volunteers",
    food:       "cc_food",
    share:      "cc_share",
    help:       "cc_help",
    blood:      "cc_blood",
    points:     "cc_points",
    activity:   "cc_activity",
    elderly:    "cc_elderly_mode",
    dark:       "cc_dark_mode"
};

const POINTS_MAP = {
    volunteer: 50,
    food:      30,
    share:     20,
    help:      40,
    blood:     60
};

const MODULE_INFO = {
    volunteer: { label: "Volunteer Connect", icon: "🤝" },
    food:      { label: "FoodShare",          icon: "🍱" },
    share:     { label: "ShareCare",          icon: "📚" },
    help:      { label: "HelpNear",           icon: "🏡" },
    blood:     { label: "Blood Donor Connect",icon: "🩸" }
};

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
function getFlag(key) {
    return localStorage.getItem(key) === "true";
}
function setFlag(key, value) {
    localStorage.setItem(key, value ? "true" : "false");
}

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
    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, duration);
}

// ============================================================
// MODAL SYSTEM
// ============================================================
function openModal(type) {
    const idMap = {
        volunteer: "volunteerModal",
        food:      "foodModal",
        share:     "shareModal",
        help:      "helpModal",
        blood:     "bloodModal"
    };
    const id = idMap[type];
    if (!id) return;
    const overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
    // Focus first input in modal
    const firstInput = overlay.querySelector("input, select, textarea");
    if (firstInput) setTimeout(() => firstInput.focus(), 100);
}

function closeModal(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.classList.remove("active");
    document.body.style.overflow = "";
}

// Close modal when clicking overlay background
document.addEventListener("click", function(e) {
    if (e.target.classList.contains("modal-overlay")) {
        e.target.classList.remove("active");
        document.body.style.overflow = "";
    }
});

// Close modal on Escape key
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

    // Prevent duplicate: same person, same type, within same day
    const today = new Date().toDateString();
    const dupKey = normName + "_" + type + "_" + today;
    if (pts.__dup && pts.__dup[dupKey]) {
        return false; // duplicate — don't award again
    }

    // Init user
    if (!pts[normName]) {
        pts[normName] = { displayName: name.trim(), total: 0, history: [] };
    }
    pts[normName].total += amount;
    pts[normName].history.unshift({ type, amount, date: new Date().toLocaleString() });

    // Mark duplicate
    if (!pts.__dup) pts.__dup = {};
    pts.__dup[dupKey] = true;

    savePoints(pts);
    updateLeaderboard();
    updateMyPoints(name.trim());
    return true;
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
        const rankClass = i < 3 ? ` lb-rank-${i+1}` : "";
        const medals = ["🥇","🥈","🥉"];
        const rankDisplay = i < 3 ? medals[i] : `#${i+1}`;
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

    if (!user || !numEl) return;
    numEl.textContent = user.total;

    if (breakdownEl) {
        if (!user.history || user.history.length === 0) {
            breakdownEl.innerHTML = '<p class="points-empty">No activities yet.</p>';
        } else {
            breakdownEl.innerHTML = "";
            user.history.slice(0, 5).forEach(h => {
                const item = document.createElement("div");
                item.className = "points-item";
                const info = MODULE_INFO[h.type] || { label: h.type, icon: "⭐" };
                item.innerHTML = `
                    <span>${info.icon} ${info.label}</span>
                    <span class="pts">+${h.amount}</span>
                `;
                breakdownEl.appendChild(item);
            });
        }
    }
}

function checkPoints() {
    openModal("points");
}

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
    // Keep only latest 50
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
        feedEl.innerHTML = '<li class="empty-state">No activity yet. Be the first to contribute!</li>';
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
        blood:     getStore(STORAGE_KEYS.blood).length
    };

    animateNumber("dashVolNum", counts.volunteer);
    animateNumber("dashFoodNum", counts.food);
    animateNumber("dashShareNum", counts.share);
    animateNumber("dashHelpNum", counts.help);
    animateNumber("dashBloodNum", counts.blood);

    // Total points
    const pts = getPoints();
    const totalPts = Object.entries(pts)
        .filter(([k]) => k !== "__dup")
        .reduce((sum, [, v]) => sum + (v.total || 0), 0);
    animateNumber("dashTotalPoints", totalPts);

    // Hero stats
    const totalDonations = counts.food + counts.share;
    const totalHelped = counts.help + counts.volunteer;
    animateNumber("statVolunteers", counts.volunteer);
    animateNumber("statDonations", totalDonations);
    animateNumber("statHelped", totalHelped);
}

function animateNumber(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    const current = parseInt(el.textContent) || 0;
    if (current === target) return;
    const duration = 600;
    const steps = 20;
    const increment = (target - current) / steps;
    let step = 0;
    const timer = setInterval(() => {
        step++;
        el.textContent = Math.round(current + increment * step);
        if (step >= steps) {
            el.textContent = target;
            clearInterval(timer);
        }
    }, duration / steps);
}

// ============================================================
// QR CODE GENERATOR (Canvas-based, no external library)
// ============================================================
function generateQRCode(containerId, text) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    // Simple visual QR-like pattern using canvas
    const canvas = document.createElement("canvas");
    const size = 160;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    // Generate pseudo-random pattern from text
    const seed = hashCode(text);
    const modules = 21;
    const cellSize = size / modules;

    ctx.fillStyle = "#1a1a1a";

    // Draw finder patterns (corners)
    drawFinder(ctx, 0, 0, cellSize);
    drawFinder(ctx, (modules - 7) * cellSize, 0, cellSize);
    drawFinder(ctx, 0, (modules - 7) * cellSize, cellSize);

    // Draw data modules
    const rng = seededRng(seed);
    for (let row = 0; row < modules; row++) {
        for (let col = 0; col < modules; col++) {
            // Skip finder pattern areas
            if (isFinderZone(row, col, modules)) continue;
            if (rng() > 0.5) {
                ctx.fillRect(col * cellSize, row * cellSize, cellSize - 0.5, cellSize - 0.5);
            }
        }
    }

    // Draw timing patterns
    for (let i = 8; i < modules - 8; i++) {
        if (i % 2 === 0) {
            ctx.fillRect(i * cellSize, 6 * cellSize, cellSize - 0.5, cellSize - 0.5);
            ctx.fillRect(6 * cellSize, i * cellSize, cellSize - 0.5, cellSize - 0.5);
        }
    }

    container.appendChild(canvas);
}

function drawFinder(ctx, x, y, cell) {
    // Outer 7x7 black square
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(x, y, 7 * cell, 7 * cell);
    // Inner 5x5 white square
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + cell, y + cell, 5 * cell, 5 * cell);
    // Inner 3x3 black square
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(x + 2 * cell, y + 2 * cell, 3 * cell, 3 * cell);
}

function isFinderZone(row, col, modules) {
    return (row < 8 && col < 8) ||
           (row < 8 && col >= modules - 8) ||
           (row >= modules - 8 && col < 8) ||
           (row === 6 || col === 6);
}

function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
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
    return "CC-" + Date.now().toString(36).toUpperCase().slice(-6) + "-" + Math.random().toString(36).slice(2,5).toUpperCase();
}

// ============================================================
// FORM VALIDATION HELPERS
// ============================================================
function validateField(input) {
    const val = input.value.trim();
    if (input.required && !val) {
        input.style.borderColor = "var(--danger)";
        return false;
    }
    if (input.type === "email" && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        input.style.borderColor = "var(--danger)";
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
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
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

        if (!validateForm(form)) {
            showFormMsg("volMsg", "⚠️ Please fill in all required fields.", "error");
            return;
        }

        const name     = document.getElementById("volName").value.trim();
        const email    = document.getElementById("volEmail").value.trim();
        const phone    = document.getElementById("volPhone").value.trim();
        const skills   = document.getElementById("volSkills").value;
        const avail    = document.getElementById("volAvail").value;
        const location = document.getElementById("volLocation").value.trim();
        const notes    = document.getElementById("volNotes").value.trim();

        const record = { name, email, phone, skills, availability: avail, location, notes, date: new Date().toISOString(), status: "Active" };
        const volunteers = getStore(STORAGE_KEYS.volunteers);
        volunteers.unshift(record);
        setStore(STORAGE_KEYS.volunteers, volunteers);

        const wasNew = awardPoints(name, "volunteer", POINTS_MAP.volunteer);
        addActivity("volunteer", name, skills + " | " + avail);
        updateDashboard();

        showFormMsg("volMsg", `✅ Thank you ${name}! You've registered as a volunteer${wasNew ? " and earned 50 Kindness Points! ⭐" : " (points already awarded today)."}`, "success");
        showToast(`🤝 ${name} joined as a volunteer! ${wasNew ? "+50 ⭐" : ""}`, "success");

        form.reset();
    });

    // Live validation
    form.querySelectorAll("input, select").forEach(el => {
        el.addEventListener("blur", () => validateField(el));
        el.addEventListener("input", () => { el.style.borderColor = ""; });
    });
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

        if (!validateForm(form)) {
            showFormMsg("foodMsg", "⚠️ Please fill in all required fields.", "error");
            return;
        }

        const name     = document.getElementById("foodName").value.trim();
        const foodType = document.getElementById("foodType").value;
        const quantity = document.getElementById("foodQuantity").value.trim();
        const expiry   = document.getElementById("foodExpiry").value;
        const pickup   = document.getElementById("foodPickup").value.trim();
        const time     = document.getElementById("foodTime").value;
        const contact  = document.getElementById("foodContact").value.trim();

        const refCode = generateRefCode();
        const record = { name, foodType, quantity, expiry, pickup, pickupTime: time, contact, refCode, date: new Date().toISOString(), status: "Pending Pickup" };
        const food = getStore(STORAGE_KEYS.food);
        food.unshift(record);
        setStore(STORAGE_KEYS.food, food);

        const wasNew = awardPoints(name, "food", POINTS_MAP.food);
        addActivity("food", name, foodType + " — " + quantity);
        updateDashboard();

        showFormMsg("foodMsg", `✅ Food donation registered! Ref: ${refCode}${wasNew ? " | +30 ⭐" : ""}`, "success");
        showToast(`🍱 Food donation by ${name}! ${wasNew ? "+30 ⭐" : ""}`, "success");

        // Show QR code
        const qrSection = document.getElementById("foodQrSection");
        if (qrSection) {
            qrSection.style.display = "block";
            qrSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
            generateQRCode("foodQrCode", `CC-FOOD|${refCode}|${name}|${foodType}|${quantity}`);
            const refEl = document.getElementById("foodQrRef");
            if (refEl) refEl.textContent = "Reference: " + refCode;
        }

        form.reset();
    });

    form.querySelectorAll("input, select").forEach(el => {
        el.addEventListener("blur", () => validateField(el));
        el.addEventListener("input", () => { el.style.borderColor = ""; });
    });
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

        if (!validateForm(form)) {
            showFormMsg("shareMsg", "⚠️ Please fill in all required fields.", "error");
            return;
        }

        const name      = document.getElementById("shareName").value.trim();
        const itemType  = document.getElementById("shareType").value;
        const desc      = document.getElementById("shareDesc").value.trim();
        const condition = document.getElementById("shareCondition").value;
        const location  = document.getElementById("shareLocation").value.trim();
        const contact   = document.getElementById("shareContact").value.trim();

        const record = { name, itemType, description: desc, condition, location, contact, date: new Date().toISOString(), status: "Available" };
        const share = getStore(STORAGE_KEYS.share);
        share.unshift(record);
        setStore(STORAGE_KEYS.share, share);

        const wasNew = awardPoints(name, "share", POINTS_MAP.share);
        addActivity("share", name, itemType + " — " + condition);
        updateDashboard();

        showFormMsg("shareMsg", `✅ Resource listed! Thank you ${name}${wasNew ? " — you earned 20 Kindness Points! ⭐" : "."}`, "success");
        showToast(`📚 ${name} shared resources! ${wasNew ? "+20 ⭐" : ""}`, "success");

        form.reset();
    });

    form.querySelectorAll("input, select, textarea").forEach(el => {
        el.addEventListener("blur", () => validateField(el));
        el.addEventListener("input", () => { el.style.borderColor = ""; });
    });
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

        if (!validateForm(form)) {
            showFormMsg("helpMsg", "⚠️ Please fill in all required fields.", "error");
            return;
        }

        const name     = document.getElementById("helpName").value.trim();
        const helpType = document.getElementById("helpType").value;
        const category = document.getElementById("helpCategory").value;
        const desc     = document.getElementById("helpDesc").value.trim();
        const location = document.getElementById("helpLocation").value.trim();
        const contact  = document.getElementById("helpContact").value.trim();

        const record = { name, helpType, category, description: desc, location, contact, date: new Date().toISOString(), status: "Open" };
        const help = getStore(STORAGE_KEYS.help);
        help.unshift(record);
        setStore(STORAGE_KEYS.help, help);

        const wasNew = awardPoints(name, "help", POINTS_MAP.help);
        addActivity("help", name, helpType + " — " + category);
        updateDashboard();

        const action = helpType === "Requesting Help" ? "request submitted" : "offer posted";
        showFormMsg("helpMsg", `✅ Help ${action}! ${wasNew ? "+40 Kindness Points ⭐" : "Thank you!"}`, "success");
        showToast(`🏡 ${name} — help ${action}! ${wasNew ? "+40 ⭐" : ""}`, "success");

        form.reset();
    });

    form.querySelectorAll("input, select, textarea").forEach(el => {
        el.addEventListener("blur", () => validateField(el));
        el.addEventListener("input", () => { el.style.borderColor = ""; });
    });
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

        if (!validateForm(form)) {
            showFormMsg("bloodMsg", "⚠️ Please fill in all required fields.", "error");
            return;
        }

        const name      = document.getElementById("bloodName").value.trim();
        const bloodGroup= document.getElementById("bloodGroup").value;
        const type      = document.getElementById("bloodType").value;
        const location  = document.getElementById("bloodLocation").value.trim();
        const contact   = document.getElementById("bloodContact").value.trim();
        const notes     = document.getElementById("bloodNotes").value.trim();

        const record = { name, bloodGroup, type, location, contact, notes, date: new Date().toISOString(), status: "Active" };
        const blood = getStore(STORAGE_KEYS.blood);
        blood.unshift(record);
        setStore(STORAGE_KEYS.blood, blood);

        const wasNew = awardPoints(name, "blood", POINTS_MAP.blood);
        addActivity("blood", name, type + " — " + bloodGroup + " @ " + location);
        updateDashboard();

        showFormMsg("bloodMsg", `✅ Registered as ${type} (${bloodGroup}). A coordinator will be in touch. ${wasNew ? "+60 ⭐" : "Thank you!"}`, "success");
        showToast(`🩸 ${name} registered for Blood Donor Connect! ${wasNew ? "+60 ⭐" : ""}`, "success");

        form.reset();
    });

    form.querySelectorAll("input, select, textarea").forEach(el => {
        el.addEventListener("blur", () => validateField(el));
        el.addEventListener("input", () => { el.style.borderColor = ""; });
    });
}

// ============================================================
// GENERAL COMMUNITY FORM (Index Page Quick Form)
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

        if (!moduleVal) {
            if (msgEl) { msgEl.textContent = "⚠️ Please select a module."; msgEl.className = "form-msg error"; }
            return;
        }
        if (!nameVal) {
            if (msgEl) { msgEl.textContent = "⚠️ Please enter your name."; msgEl.className = "form-msg error"; }
            return;
        }
        if (!descVal) {
            if (msgEl) { msgEl.textContent = "⚠️ Please enter details."; msgEl.className = "form-msg error"; }
            return;
        }

        // Store in the appropriate module
        const store = getStore(STORAGE_KEYS[moduleVal] || STORAGE_KEYS.volunteers);
        store.unshift({ name: nameVal, description: descVal, module: moduleVal, date: new Date().toISOString(), source: "quick-form" });
        setStore(STORAGE_KEYS[moduleVal] || STORAGE_KEYS.volunteers, store);

        const wasNew = awardPoints(nameVal, moduleVal, POINTS_MAP[moduleVal] || 10);
        addActivity(moduleVal, nameVal, descVal.slice(0, 50));
        updateDashboard();

        const pts = POINTS_MAP[moduleVal] || 10;
        if (msgEl) {
            msgEl.textContent = `✅ Thank you ${nameVal}! Registered for ${MODULE_INFO[moduleVal]?.label || moduleVal}.${wasNew ? ` +${pts} ⭐` : ""}`;
            msgEl.className = "form-msg success";
        }
        showToast(`✅ ${nameVal} registered for ${MODULE_INFO[moduleVal]?.label}! ${wasNew ? "+" + pts + " ⭐" : ""}`, "success");
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
        const normName = name.toLowerCase();
        const user = pts[normName];

        if (user) {
            let historyHtml = "";
            if (user.history && user.history.length > 0) {
                historyHtml = user.history.slice(0, 5).map(h => {
                    const info = MODULE_INFO[h.type] || { label: h.type, icon: "⭐" };
                    return `<div class="points-item">${info.icon} ${info.label} <span class="pts">+${h.amount}</span></div>`;
                }).join("");
            }
            resultEl.innerHTML = `
                <div class="lookup-found">
                    <h3>⭐ ${escapeHtml(user.displayName)}</h3>
                    <p><strong>Total Kindness Points: ${user.total}</strong></p>
                    ${historyHtml}
                </div>`;
        } else {
            resultEl.innerHTML = `<div class="lookup-not-found">❌ No record found for "${escapeHtml(name)}". Make sure you use the same name as when you registered.</div>`;
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
            message: "You want to give back — great! Volunteer Connect matches your skills with local community needs. You'll earn 50 Kindness Points for registering.",
            action: "volunteer",
            section: "#volunteer-connect"
        },
        food: {
            title: "FoodShare 🍱",
            message: "Whether you have surplus food to donate or need food assistance, FoodShare connects donors with verified community organizations. You'll get a QR confirmation!",
            action: "food",
            section: "#foodshare"
        },
        items: {
            title: "ShareCare 📚",
            message: "ShareCare lets you share books, clothes, toys, and everyday essentials with families in need — or find items you need yourself.",
            action: "share",
            section: "#sharecare"
        },
        help: {
            title: "HelpNear 🏡",
            message: "For non-emergency help — errands, companionship, or transport — HelpNear connects community members locally and privately.",
            action: "help",
            section: "#helpnear"
        },
        blood: {
            title: "Blood Donor Connect 🩸",
            message: "Register as a willing blood donor or request blood for a patient. Privacy is guaranteed — all contact goes through a coordinator.",
            action: "blood",
            section: "#blood-donor-connect"
        }
    };

    const opts = document.querySelectorAll(".matcher-opt");
    const resultEl = document.getElementById("matcherResult");

    opts.forEach(opt => {
        opt.addEventListener("click", function() {
            // Deselect all
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
                <a href="${rec.section}" class="matcher-link" style="margin-left:0;margin-top:8px;background:rgba(8,127,112,0.15);color:var(--teal);">
                    👁️ View Module
                </a>
            `;
            // Don't scroll on mobile to avoid jarring UX
            resultEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
    });
}

// ============================================================
// ELDERLY MODE TOGGLE
// ============================================================
function setupElderlyMode() {
    const btn = document.getElementById("elderlyToggleBtn");
    if (!btn) return;

    const isOn = getFlag(STORAGE_KEYS.elderly);
    if (isOn) {
        document.body.classList.add("elderly-mode");
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");
    }

    btn.addEventListener("click", function() {
        const active = document.body.classList.toggle("elderly-mode");
        this.classList.toggle("active", active);
        this.setAttribute("aria-pressed", String(active));
        setFlag(STORAGE_KEYS.elderly, active);
        showToast(active ? "👴 Elderly-Friendly Mode ON — Larger text & buttons!" : "👁️ Elderly Mode OFF", "info");
    });
}

// ============================================================
// DARK MODE TOGGLE
// ============================================================
function setupDarkMode() {
    const btn = document.getElementById("darkModeBtn");
    if (!btn) return;

    const isOn = getFlag(STORAGE_KEYS.dark);
    if (isOn) {
        document.body.classList.add("dark-mode");
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");
    }

    btn.addEventListener("click", function() {
        const active = document.body.classList.toggle("dark-mode");
        this.classList.toggle("active", active);
        this.setAttribute("aria-pressed", String(active));
        setFlag(STORAGE_KEYS.dark, active);
        showToast(active ? "🌙 Dark Mode ON" : "☀️ Light Mode ON", "info");
    });
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

    // Close nav when a link is clicked
    nav.querySelectorAll("a").forEach(a => {
        a.addEventListener("click", () => {
            nav.classList.remove("open");
            btn.setAttribute("aria-expanded", "false");
        });
    });

    // Close on outside click
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
function confirmClear() {
    openModal("confirm");
}

function clearAllData() {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    closeModal("confirmModal");
    updateDashboard();
    updateLeaderboard();
    renderActivityFeed();
    showToast("🗑️ All demo data cleared.", "info");
    // Reset hero stats
    ["statVolunteers", "statDonations", "statHelped"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = "0";
    });
    // Reset points display
    const numEl = document.getElementById("myPoints");
    if (numEl) numEl.textContent = "0";
    const bdEl = document.getElementById("pointsBreakdown");
    if (bdEl) bdEl.innerHTML = '<p class="points-empty">No activities yet. Start contributing to earn points!</p>';
}

// ============================================================
// SCROLL ANIMATIONS (Intersection Observer)
// ============================================================
function setupScrollAnimations() {
    if (!window.IntersectionObserver) return;
    const elements = document.querySelectorAll(".card, .dash-card, .how-step, .value-chip, .kindness-card, .leaderboard-card");
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
        el.style.animationDelay = `${i * 0.05}s`;
        observer.observe(el);
    });
}

// ============================================================
// INIT
// ============================================================
document.addEventListener("DOMContentLoaded", function () {

    // Setup all features
    setupElderlyMode();
    setupDarkMode();
    setupHamburger();
    setupMatcher();
    setupVolunteerForm();
    setupFoodForm();
    setupShareForm();
    setupHelpForm();
    setupBloodForm();
    setupCommunityForm();
    setupPointsLookup();
    setupCardKeys();
    setupScrollAnimations();

    // Initial data render
    updateDashboard();
    updateLeaderboard();
    renderActivityFeed();

    // Expose globals needed by inline onclick handlers
    window.openModal   = openModal;
    window.closeModal  = closeModal;
    window.confirmClear = confirmClear;
    window.clearAllData = clearAllData;
    window.checkPoints  = checkPoints;

});
