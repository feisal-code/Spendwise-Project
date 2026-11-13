// =====================================
// SPENDWISE - Budget Tracker
// Accounts, budgets, expenses, savings goals,
// recurring payments and money challenges.
// All data is saved in the browser (localStorage).
// =====================================

const CATS = [["Food & Dining", "🍔"], ["Transport", "🚗"], ["Rent & Housing", "🏠"], ["Entertainment", "🎬"], ["Savings Goal", "🐷"], ["Utilities", "⚡"]];
const $ = id => document.getElementById(id);
const fmt = n => {
    try {
        return new Intl.NumberFormat(undefined, { style: "currency", currency: S.cur || "USD", maximumFractionDigits: 0 }).format(Math.round(n));
    } catch (e) {
        return Math.round(n).toLocaleString();
    }
};

// ============ Storage: accounts and each person's data (saved in the browser) ============
const UK = "spendwise_users", SK = "spendwise_session", dk = id => "spendwise_data_" + id;
const rd = k => {
    try {
        return JSON.parse(localStorage.getItem(k) || "null");
    } catch (e) {
        return null;
    }
};
const wr = (k, v) => {
    try {
        localStorage.setItem(k, JSON.stringify(v));
    } catch (e) { }
};
let users = rd(UK) || {}, uid = rd(SK) || "";
const saveUsers = () => wr(UK, users);

function loadUser(id) {
    S = Object.assign({ name: "", cur: "USD", limits: {}, expenses: [], theme: "" }, rd(dk(id)) || {});
}
let S = { name: "", cur: "USD", limits: {}, expenses: [], theme: "" };
if (uid && users[uid])
    loadUser(uid);
else
    uid = "";
const save = () => {
    if (uid)
        wr(dk(uid), S);
};
const spent = c => S.expenses.filter(e => e.category === c).reduce((a, e) => a + e.amount, 0);
const totB = () => CATS.reduce((a, c) => a + (S.limits[c[0]] || 0), 0);
const totE = () => S.expenses.reduce((a, e) => a + e.amount, 0);

// ============ Small helpers: messages, number animation, light/dark theme ============

function toast(t) {
    const d = document.createElement("div");
    d.className = "toast";
    d.textContent = t;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 2600);
}

function count(el, to) {
    const s = performance.now();
    (function f(t) {
        const p = Math.min(1, (t - s) / 500);
        el.textContent = fmt(to * p);
        if (p < 1)
            requestAnimationFrame(f);
    })(s);
}

function applyTheme() {
    if (S.theme)
        document.documentElement.dataset.theme = S.theme;
}

function flip() {
    const cur = document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light");
    S.theme = cur === "dark" ? "light" : "dark";
    applyTheme();
    save();
}
applyTheme();

// ============ Budget status, page switching and progress bars ============

function status(c) {
    const s = spent(c), l = S.limits[c] || 0;
    if (l === 0)
        return ["No limit", "wn"];
    if (s > l)
        return ["Over Budget", "bd"];
    if (s === l)
        return ["Budget Used", "wn"];
    if (s >= l * .8)
        return ["Almost Full", "wn"];
    return ["On Track", "ok"];
}

function go(p) {
    document.querySelectorAll(".page").forEach(x => x.classList.toggle("on", x.id === "p-" + p));
    document.querySelectorAll(".nav").forEach(x => x.classList.toggle("on", x.dataset.page === p));
    scrollTo(0, 0);
    if (p === "bud" || p === "ana" || p === "dash")
        setTimeout(bars, 50);
}

function bars() {
    document.querySelectorAll(".prog i").forEach(i => i.style.width = i.dataset.w + "%");
}

function prog(c) {
    const s = spent(c), l = S.limits[c] || 0, w = l ? Math.min(100, s / l * 100) : 0;
    return `<div class="prog"><i class="${s > l ? "over" : ""}" data-w="${w}"></i></div>`;
}

function item(e, del) {
    const d = document.createElement("div");
    d.className = "tx";
    d.innerHTML = `<div class="i"><div></div><div class="small"></div></div><b></b>` + (del ? `<button class="btn red sm" data-del="${e.id}">Delete</button>` : "");
    d.querySelector(".i div").textContent = e.name;
    d.querySelector(".small").textContent = e.category;
    d.querySelector("b").textContent = fmt(e.amount);
    return d;
}

function list(el, arr, del) {
    el.innerHTML = "";
    if (!arr.length) {
        el.innerHTML = '<p class="small">No expenses to show yet.</p>';
        return;
    }
    arr.forEach(e => el.appendChild(item(e, del)));
}

// ============ Drawing the screens: dashboard, transactions, budgets, analytics ============

function renderDash() {
    $("nm").textContent = S.name;
    $("av").textContent = (S.name.trim()[0] || "?").toUpperCase();
    $("hi").textContent = "Hello, " + S.name + " 👋";
    const b = totB(), e = totE(), r = b - e;
    count($("s-b"), b);
    count($("s-e"), e);
    count($("s-r"), r);
    $("msg").textContent = r < 0 ? "Warning! You have exceeded your total budget." : r === 0 ? "Your entire budget has been used." : "Good job! You are still within your budget.";
    $("cats").innerHTML = "";
    CATS.forEach(c => {
        const [st, cl] = status(c[0]);
        const d = document.createElement("div");
        d.className = "box cat";
        d.innerHTML = `<div class="h"><span class="ico" style="margin:0">${c[1]}</span><span class="pill ${cl}">${st}</span></div><h3></h3><b>${fmt(spent(c[0]))}</b><div class="small">of ${fmt(S.limits[c[0]] || 0)} budget</div>${prog(c[0])}`;
        d.querySelector("h3").textContent = c[0];
        d.onclick = () => {
            $("fc").value = c[0];
            renderTx();
            go("tx");
        };
        $("cats").appendChild(d);
    });
    list($("recent"), S.expenses.slice(-5).reverse(), true);
    setTimeout(bars, 50);
}

function renderTx() {
    const q = $("q").value.toLowerCase(), f = $("fc").value;
    list($("all"), S.expenses.filter(e => (!f || e.category === f) && (e.name.toLowerCase().includes(q) || e.category.toLowerCase().includes(q))).reverse(), true);
}

function renderBud() {
    $("bl").innerHTML = "";
    CATS.forEach(c => {
        const d = document.createElement("div");
        d.className = "box";
        d.innerHTML = `<div class="ico">${c[1]}</div><h3></h3><div class="small">Spent ${fmt(spent(c[0]))}</div>${prog(c[0])}<label style="display:block;margin:.8rem 0 .3rem">Limit (${S.cur})</label><input type="number" min="0" value="${S.limits[c[0]] || 0}">`;
        d.querySelector("h3").textContent = c[0];
        d.querySelector("input").onchange = ev => {
            S.limits[c[0]] = Math.max(0, Number(ev.target.value) || 0);
            save();
            renderAll();
            toast("Budget updated ✅");
        };
        $("bl").appendChild(d);
    });
}

function renderAna() {
    const t = totE();
    $("ab").innerHTML = "";
    if (!t) {
        $("ins").textContent = "Add some expenses to see your spending breakdown.";
        return;
    }
    const top = CATS.slice().sort((a, b) => spent(b[0]) - spent(a[0]))[0];
    $("ins").textContent = `Most of your money goes to ${top[0]} (${Math.round(spent(top[0]) / t * 100)}% of spending).`;
    CATS.forEach(c => {
        const p = spent(c[0]) / t * 100;
        const d = document.createElement("div");
        d.className = "abar";
        d.innerHTML = `<span>${c[1]} ${c[0].split(" ")[0]}</span><div class="prog" style="margin:0"><i data-w="${p}"></i></div><b>${Math.round(p)}%</b>`;
        $("ab").appendChild(d);
    });
}

function renderAll() {
    document.querySelectorAll(".cur").forEach(x => x.textContent = S.cur);
    $("scr").value = S.cur;
    renderDash();
    renderTx();
    renderBud();
    renderAna();
    renderGoals();
    renderRec();
    renderCh();
    $("sn").value = S.name;
}
/* setup */
CATS.forEach(c => {
    $("ec").innerHTML += `<option value="${c[0].replace("&", "&amp;")}">${c[0].replace("&", "&amp;")}</option>`;
    $("fc").innerHTML;
    $("sl").innerHTML += `<div><label>${c[1]} ${c[0].replace("&", "&amp;")}</label><input type="number" min="0" data-c="${c[0].replace("&", "&amp;")}" placeholder="Monthly limit" required></div>`;
});
$("ec").insertAdjacentHTML("afterbegin", '<option value="">Select category</option>');
$("fc").innerHTML = '<option value="">All categories</option>' + $("ec").innerHTML.replace('<option value="">Select category</option>', "");

function openApp() {
    if (!uid) {
        authMode("up");
        authType("email");
        $("auth").hidden = false;
        return;
    }
    if (!Object.values(S.limits).some(v => v > 0)) {
        $("setup").hidden = false;
        return;
    }
    $("landing").hidden = true;
    $("app").hidden = false;
    renderAll();
    go("dash");
}
document.querySelectorAll("[data-open]").forEach(b => b.onclick = openApp);
$("sf").onsubmit = ev => {
    ev.preventDefault();
    let any = 0;
    document.querySelectorAll("#sl input").forEach(i => {
        const v = Math.max(0, Number(i.value) || 0);
        S.limits[i.dataset.c] = v;
        any += v;
    });
    if (!any) {
        toast("Please set at least one limit");
        return;
    }
    S.cur = $("scur").value;
    save();
    $("setup").hidden = true;
    openApp();
    toast("All set, " + S.name + "! 🎉");
};
$("setup").onclick = ev => {
    if (ev.target.id === "setup")
        $("setup").hidden = true;
};
/* app events */
document.querySelectorAll(".nav").forEach(b => b.onclick = () => go(b.dataset.page));
$("home").onclick = () => {
    $("app").hidden = true;
    $("landing").hidden = false;
    scrollTo(0, 0);
};
$("theme").onclick = flip;
$("theme2").onclick = flip;
$("ef").onsubmit = ev => {
    ev.preventDefault();
    const name = $("en").value.trim(), amount = Number($("ea").value), cat = $("ec").value;
    if (!name || !Number.isFinite(amount) || amount <= 0 || !cat) {
        $("msg").textContent = "Please enter valid expense details.";
        return;
    }
    S.expenses.push({ id: Date.now(), name, amount, category: cat });
    save();
    $("ef").reset();
    renderAll();
    toast(spent(cat) > (S.limits[cat] || 0) ? "⚠️ Over budget in " + cat : "Expense added ✅");
};
document.addEventListener("click", ev => {
    const id = ev.target.dataset && ev.target.dataset.del;
    if (!id)
        return;
    S.expenses = S.expenses.filter(e => String(e.id) !== id);
    save();
    renderAll();
    toast("Expense deleted");
});
$("q").oninput = renderTx;
$("fc").onchange = renderTx;
$("sv").onclick = () => {
    const n = $("sn").value.trim();
    if (!n)
        return toast("Name cannot be empty");
    S.name = n;
    if (users[uid]) {
        users[uid].name = n;
        saveUsers();
    }
    save();
    renderAll();
    toast("Name saved ✅");
};
$("rs").onclick = () => {
    const b = $("rs");
    if (b.dataset.s) {
        S = { name: S.name, cur: "USD", limits: {}, expenses: [], theme: S.theme };
        save();
        location.reload();
    } else {
        b.dataset.s = 1;
        b.textContent = "Tap again to confirm reset";
        setTimeout(() => {
            delete b.dataset.s;
            b.textContent = "Reset all data";
        }, 3000);
    }
};

// ============ Currency list and the logo ============
const CURS = ["USD", "EUR", "GBP", "KES", "NGN", "ZAR", "INR", "AED", "SAR", "CAD", "AUD", "JPY", "CNY", "BRL"];

function curName(c) {
    try {
        return c + " · " + new Intl.DisplayNames(["en"], { type: "currency" }).of(c);
    } catch (e) {
        return c;
    }
}
["scur", "scr"].forEach(id => {
    $(id).innerHTML = CURS.map(c => `<option value="${c}">${curName(c)}</option>`).join("");
    $(id).value = S.cur || "USD";
});
$("scr").onchange = () => {
    S.cur = $("scr").value;
    save();
    renderAll();
    toast("Currency changed ✅");
};
const LOGO = '<svg viewBox="0 10 230 190" aria-hidden="true"><path d="M118 52C108 24 40 26 40 66C40 104 122 92 122 134C122 176 52 174 36 142" fill="none" stroke="#15803d" stroke-width="22" stroke-linecap="round"/><path d="M116 48C106 24 44 28 44 64C44 100 118 90 118 132" fill="none" stroke="#84cc16" stroke-width="5" stroke-linecap="round" opacity=".7"/><rect x="146" y="86" width="12" height="18" rx="3" fill="#16a34a"/><rect x="162" y="74" width="12" height="30" rx="3" fill="#15803d"/><rect x="178" y="62" width="12" height="42" rx="3" fill="#166534"/><path d="M88 96C130 80 168 60 200 34" fill="none" stroke="#f59e0b" stroke-width="7" stroke-linecap="round"/><polygon points="212,25 204.5,41.3 194.5,28.9" fill="#f59e0b"/><circle cx="92" cy="114" r="9" fill="#fbbf24"/><circle cx="92" cy="114" r="4.5" fill="none" stroke="#fffbeb" stroke-width="1.6"/><rect x="62" y="124" width="56" height="36" rx="9" fill="#064e3b" stroke="#fff" stroke-width="3"/><path d="M68 138H100" stroke="#bbf7d0" stroke-width="1.6" stroke-dasharray="4 3"/><circle cx="106" cy="142" r="5" fill="#f59e0b" stroke="#fff" stroke-width="1.5"/></svg>';
document.querySelectorAll(".lg").forEach(x => x.innerHTML = LOGO);

// ============ Illustrated people (SVG avatars on the landing page) ============

function av(sk, hr, sh, bg, lg) {
    return `<svg viewBox="0 0 100 100" role="img" aria-label="illustrated person"><rect width="100" height="100" fill="${bg}"/>${lg ? `<path d="M30 44Q24 80 36 84L38 52Z M70 44Q76 80 64 84L62 52Z" fill="${hr}"/>` : ""}<path d="M14 100Q50 58 86 100Z" fill="${sh}"/><rect x="44" y="58" width="12" height="14" fill="${sk}"/><ellipse cx="50" cy="46" rx="19" ry="21" fill="${sk}"/><path d="M30 46Q30 20 50 20Q70 20 70 46Q64 34 50 36Q36 34 30 46Z" fill="${hr}"/><ellipse cx="42" cy="50" rx="3.8" ry="5.4" fill="#1f2937"/><ellipse cx="58" cy="50" rx="3.8" ry="5.4" fill="#1f2937"/><circle cx="43.3" cy="48" r="1.5" fill="#fff"/><circle cx="59.3" cy="48" r="1.5" fill="#fff"/><ellipse cx="36" cy="58" rx="4" ry="2" fill="#f87171" opacity=".45"/><ellipse cx="64" cy="58" rx="4" ry="2" fill="#f87171" opacity=".45"/><path d="M46 61Q50 65 54 61" stroke="#7c2d12" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>`;
}
const PPL = [av("#f1c9a5", "#2b2118", "#f59e0b", "#d1fae5", 0), av("#8d5a3b", "#120d0a", "#10b981", "#fde68a", 1), av("#c68642", "#3b2412", "#047857", "#fed7aa", 0), av("#ffdbb4", "#b4532a", "#d97706", "#bbf7d0", 1)];
$("hp").innerHTML = PPL.join("");
[["Students", "📚", "Keep allowances and fees in check."], ["Freelancers", "💻", "Know what is left after every gig."], ["Families", "🏡", "Plan rent, food and bills together."], ["Travellers", "✈️", "Track spending in any currency."]].forEach((c, i) => {
    const d = document.createElement("div");
    d.className = "box pc";
    d.innerHTML = PPL[i] + `<h3>${c[1]} ${c[0]}</h3><p class="small">${c[2]}</p>`;
    $("ppl").appendChild(d);
});

// ============ Sign up and log in ============
let am = "up", at = "email";

function authMode(m) {
    am = m;
    document.querySelectorAll("[data-m]").forEach(b => b.classList.toggle("on", b.dataset.m === m));
    $("nmw").hidden = m !== "up";
    $("asub").textContent = m === "up" ? "Create account" : "Log in";
    $("aerr").textContent = "";
}

function authType(t) {
    at = t;
    document.querySelectorAll("[data-t]").forEach(b => b.classList.toggle("on", b.dataset.t === t));
    $("acl").textContent = t === "email" ? "Email address" : "Phone number (with country code)";
    $("ac").type = t === "email" ? "email" : "tel";
    $("ac").placeholder = t === "email" ? "you@example.com" : "+254 700 000 000";
    $("ac").value = "";
}
document.querySelectorAll("[data-m]").forEach(b => b.onclick = () => authMode(b.dataset.m));
document.querySelectorAll("[data-t]").forEach(b => b.onclick = () => authType(b.dataset.t));
const norm = v => at === "email" ? v.trim().toLowerCase() : v.replace(/[\s\-().]/g, "");
const okc = v => at === "email" ? /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) : /^\+?[0-9]{7,15}$/.test(v);

async function hash(pw, salt) {
    const b = new TextEncoder().encode(salt + pw);
    const h = await crypto.subtle.digest("SHA-256", b);
    return Array.from(new Uint8Array(h)).map(x => x.toString(16).padStart(2, "0")).join("");
}
$("af").onsubmit = async (ev) => {
    ev.preventDefault();
    const err = m => {
        $("aerr").textContent = m;
    };
    err("");
    const c = norm($("ac").value), pw = $("ap").value, n = $("an").value.trim();
    if (!okc(c))
        return err(at === "email" ? "Please enter a valid email address." : "Please enter a valid phone number, e.g. +254700000000.");
    if (pw.length < 8)
        return err("Password must be at least 8 characters.");
    const found = Object.keys(users).find(k => users[k].contact === c);
    try {
        if (am === "up") {
            if (!n)
                return err("Please enter your full name.");
            if (found)
                return err("An account with this " + at + " already exists. Please log in.");
            const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6), salt = Math.random().toString(36).slice(2);
            users[id] = { name: n, contact: c, salt: salt, hash: await hash(pw, salt) };
            saveUsers();
            uid = id;
            wr(SK, uid);
            loadUser(uid);
            S.name = n;
            save();
        } else {
            if (!found || users[found].hash !== await hash(pw, users[found].salt))
                return err("Incorrect " + at + " or password.");
            uid = found;
            wr(SK, uid);
            loadUser(uid);
            S.name = users[uid].name;
        }
    } catch (e) {
        return err("Something went wrong. Please try again.");
    }
    $("auth").hidden = true;
    $("ap").value = "";
    $("ac").value = "";
    applyTheme();
    updateCtas();
    openApp();
    toast(am === "up" ? "Welcome, " + S.name + "! 🎉" : "Welcome back, " + S.name + "!");
};
$("auth").onclick = ev => {
    if (ev.target.id === "auth")
        $("auth").hidden = true;
};

function updateCtas() {
    const on = !!uid;
    $("li").hidden = on;
    $("topcta").textContent = on ? "Open App" : "Sign up";
    $("cta").textContent = on ? "Open App" : "Get Started";
}

function logout() {
    uid = "";
    try {
        localStorage.removeItem(SK);
    } catch (e) { }
    S = { name: "", cur: "USD", limits: {}, expenses: [], theme: S.theme };
    $("app").hidden = true;
    $("landing").hidden = false;
    updateCtas();
    scrollTo(0, 0);
    toast("Logged out");
}
$("lo").onclick = logout;
$("lo2").onclick = logout;
$("li").onclick = () => {
    authMode("in");
    authType("email");
    $("auth").hidden = false;
};
authMode("up");
updateCtas();

// ============ Recurring expenses ============
const R = () => S.recurring || (S.recurring = []);
const C = () => S.ch || (S.ch = {});
const iso = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const dUntil = s => Math.round((new Date(s + "T12:00:00") - new Date(iso(new Date()) + "T12:00:00")) / 864e5);

function nextDue(r) {
    const d = new Date(r.due + "T12:00:00");
    if (r.freq === "weekly") {
        d.setDate(d.getDate() + 7);
        return iso(d);
    }
    const n = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    n.setDate(Math.min(r.day || d.getDate(), new Date(n.getFullYear(), n.getMonth() + 1, 0).getDate()));
    return iso(n);
}
$("rc").innerHTML = $("ec").innerHTML;
$("rd").value = iso(new Date());

function renderRec() {
    const el = $("rl");
    el.innerHTML = "";
    const rs = R();
    let tot = 0, now = 0;
    rs.forEach(r => {
        tot += r.freq === "weekly" ? r.amount * 52 / 12 : r.amount;
        if (dUntil(r.due) <= 0)
            now++;
    });
    $("rtot").textContent = fmt(tot);
    $("rnow").textContent = now;
    const b = $("rdue");
    b.hidden = !now;
    b.textContent = `🔔 ${now} recurring payment${now === 1 ? " is" : "s are"} due. Tap to review.`;
    if (!rs.length) {
        el.innerHTML = '<p class="small">No recurring payments yet. Add your rent, subscriptions or bills above 🔄</p>';
        return;
    }
    rs.slice().sort((a, b) => a.due.localeCompare(b.due)).forEach(r => {
        const dd = dUntil(r.due);
        const t = dd < 0 ? `Overdue by ${-dd} day${dd === -1 ? "" : "s"}` : dd === 0 ? "Due today" : `Due in ${dd} day${dd === 1 ? "" : "s"}`, c = dd < 0 ? "bd" : dd <= 3 ? "wn" : "ok";
        const d = document.createElement("div");
        d.className = "tx";
        d.style.flexWrap = "wrap";
        d.innerHTML = `<div class="i"><div></div><div class="small"></div><span class="pill ${c}">${t}</span></div><b></b><div style="display:flex;gap:.4rem"><button class="btn sm" data-rpay="${r.id}">Mark paid</button><button class="btn red sm" data-rdel="${r.id}">Delete</button></div>`;
        d.querySelector(".i div").textContent = r.name;
        d.querySelector(".small").textContent = `${r.category} · ${r.freq === "weekly" ? "Every week" : "Every month"} · ${r.due}`;
        d.querySelector("b").textContent = fmt(r.amount);
        el.appendChild(d);
    });
}
$("rf").onsubmit = ev => {
    ev.preventDefault();
    const name = $("rn").value.trim(), amount = Number($("ra").value), category = $("rc").value, due = $("rd").value;
    if (!name || !Number.isFinite(amount) || amount <= 0 || !category || !due)
        return toast("Please fill in all the details");
    R().push({ id: Date.now(), name: name, amount: amount, category: category, freq: $("rq").value, due: due, day: new Date(due + "T12:00:00").getDate() });
    save();
    $("rf").reset();
    $("rd").value = iso(new Date());
    renderAll();
    toast("Recurring payment added 🔄");
};
$("rdue").onclick = () => go("rec");

// ============ Money challenges ============
const CH = [["nospend", "🚫", "7-Day No-Spend Challenge", "Skip all non-essential spending for 7 days.", 7], ["lunch", "🍱", "Pack-Lunch Week", "Bring lunch from home for 5 days and keep the savings.", 5], ["streak", "🪙", "30-Day Savings Streak", "Set aside a small amount every single day for 30 days.", 30], ["track", "📝", "Track-Everything Week", "Log every purchase for 7 days to see where your money goes.", 7]];

function renderCh() {
    const el = $("cl");
    el.innerHTML = "";
    const today = iso(new Date());
    CH.forEach(c => {
        const st = C()[c[0]], n = st ? st.done.length : 0, fin = n >= c[4], did = st && st.done.includes(today);
        const btn = !st ? `<button class="btn" data-cs="${c[0]}">Start challenge</button>` : fin ? `<button class="btn ghost" disabled>🏆 Completed!</button>` : did ? `<button class="btn ghost" disabled>Done for today ✓</button>` : `<button class="btn" data-cd="${c[0]}">✅ Check in today</button>`;
        const d = document.createElement("div");
        d.className = "box";
        d.innerHTML = `<div class="ico">${fin ? "🏆" : c[1]}</div><h3>${c[2]}</h3><p class="small" style="margin:.3rem 0 .7rem">${c[3]}</p><div class="small">${n} of ${c[4]} days${st && !fin ? " · keep your streak going!" : ""}</div><div class="prog"><i data-w="${n / c[4] * 100}"></i></div><div style="display:flex;gap:.5rem;margin-top:.9rem;flex-wrap:wrap">${btn}${st ? `<button class="btn ghost" data-cq="${c[0]}">${fin ? "Reset" : "Quit"}</button>` : ""}</div>`;
        el.appendChild(d);
    });
    setTimeout(bars, 50);
}
document.addEventListener("click", ev => {
    const t = ev.target, d = t.dataset || {}, today = iso(new Date());
    if (d.rdel) {
        S.recurring = R().filter(x => String(x.id) !== d.rdel);
        save();
        renderAll();
        toast("Recurring payment deleted");
    }
    if (d.rpay) {
        const r = R().find(x => String(x.id) === d.rpay);
        if (r) {
            S.expenses.push({ id: Date.now(), name: r.name, amount: r.amount, category: r.category });
            r.due = nextDue(r);
            save();
            renderAll();
            toast(spent(r.category) > (S.limits[r.category] || 0) ? "⚠️ Over budget in " + r.category : "Payment recorded ✅");
        }
    }
    if (d.cs) {
        C()[d.cs] = { start: today, done: [] };
        save();
        renderCh();
        toast("Challenge started 💪");
    }
    if (d.cd) {
        const st = C()[d.cd], c = CH.find(x => x[0] === d.cd);
        if (st && !st.done.includes(today)) {
            st.done.push(today);
            save();
            renderCh();
            toast(st.done.length >= c[4] ? "🎉 Challenge completed: " + c[2] + "!" : "Day " + st.done.length + " done 🔥");
        }
    }
    if (d.cq) {
        delete C()[d.cq];
        save();
        renderCh();
    }
});

// ============ Privacy policy pop-up ============
$("pv").onclick = ev => {
    ev.preventDefault();
    $("priv").hidden = false;
};
$("pvc").onclick = () => {
    $("priv").hidden = true;
};
$("priv").onclick = ev => {
    if (ev.target.id === "priv")
        $("priv").hidden = true;
};

// ============ Savings goals ============
const G = () => S.goals || (S.goals = []);
$("gd").min = new Date().toISOString().slice(0, 10);

function renderGoals() {
    const el = $("gl");
    el.innerHTML = "";
    const g = G();
    if (!g.length) {
        el.innerHTML = '<p class="small">No goals yet. Create your first one above 🎯</p>';
        return;
    }
    g.forEach(x => {
        const pct = Math.min(100, x.saved / x.target * 100), done = x.saved >= x.target;
        let note = done ? "🎉 Goal reached! Amazing work." : pct >= 75 ? "Almost there, keep going! 🔥" : pct >= 50 ? "More than halfway there! 💪" : pct > 0 ? "Good start, every bit counts. 🌱" : "Add your first savings to begin.";
        if (x.deadline && !done) {
            const days = Math.ceil((new Date(x.deadline + "T23:59:59") - new Date()) / 864e5);
            note += days >= 0 ? ` ${days} day${days === 1 ? "" : "s"} left, save about ${fmt(Math.ceil((x.target - x.saved) / Math.max(days, 1)))} per day.` : " The target date has passed.";
        }
        const d = document.createElement("div");
        d.className = "box";
        d.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><span class="ico" style="margin:0">${done ? "🏆" : "🐷"}</span><button class="btn red sm" data-gdel="${x.id}">Delete</button></div><h3 style="margin-top:.5rem;overflow-wrap:anywhere"></h3><b style="font-size:1.5rem">${fmt(x.saved)}</b><div class="small">of ${fmt(x.target)} · ${Math.round(pct)}%</div><div class="prog"><i data-w="${pct}"></i></div><p class="small" style="margin:.7rem 0"></p>${done ? "" : `<div style="display:flex;gap:.5rem"><input type="number" min="1" step="0.01" placeholder="Amount" aria-label="Amount to add"><button class="btn sm" data-gadd="${x.id}">Add</button></div>`}`;
        d.querySelector("h3").textContent = x.name;
        d.querySelector("p.small").textContent = note;
        el.appendChild(d);
    });
    setTimeout(bars, 50);
}
$("gf").onsubmit = ev => {
    ev.preventDefault();
    const name = $("gn").value.trim(), target = Number($("gt").value);
    if (!name || !Number.isFinite(target) || target <= 0)
        return toast("Enter a goal name and a target amount");
    G().push({ id: Date.now(), name: name, target: target, saved: 0, deadline: $("gd").value || "" });
    save();
    $("gf").reset();
    renderGoals();
    toast("Goal created 🎯");
};
document.addEventListener("click", ev => {
    const t = ev.target, d = t.dataset || {};
    if (d.gdel) {
        S.goals = G().filter(x => String(x.id) !== d.gdel);
        save();
        renderGoals();
        toast("Goal deleted");
    }
    if (d.gadd) {
        const g = G().find(x => String(x.id) === d.gadd), v = Number(t.previousElementSibling.value);
        if (!g || !Number.isFinite(v) || v <= 0)
            return toast("Enter a valid amount");
        const was = g.saved >= g.target;
        g.saved = Math.round((g.saved + v) * 100) / 100;
        save();
        renderGoals();
        toast(!was && g.saved >= g.target ? "🎉 Goal reached: " + g.name + "!" : "Saved " + fmt(v) + " ✅");
    }
});
