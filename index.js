const content = document.getElementById("content");
const uid = document.getElementById("uid");
const uidAlt = document.getElementById("uidAlt");
const submitUID = document.getElementById("submitUid");
const submitUIDAlt = document.getElementById("submitUidAlt");
const sidebar = document.getElementById("sidebar");
const sidebarInfo = document.getElementById("sidebarInfo");
const signIn = document.getElementById("signIn");
const leaderboard = document.getElementById("leaderboard");

let userID = localStorage.getItem('userID') || -1;
let lightMode = (localStorage.getItem('lightMode') === 'true') || false;
let leaderboardEnabled = (localStorage.getItem('leaderboardEnabled') === 'true') || true;

if (userID != -1) {
    signIn.style.display = "none";
    sidebarInfo.innerHTML = "<h1>Loading...</h1>";
    uidAlt.value = userID;
}

if (leaderboardEnabled) {
    document.getElementById("leaderboardOption").checked = true;
    document.querySelector("#leaderboard").style.display = "table";
}

if (lightMode) {
    document.getElementById("lightmode").checked = true;
    document.querySelector("link[href='./dark.css']").href = './light.css';
    document.querySelector(".close-modal>svg>path").setAttribute("fill", "rgb(111, 111, 111)");
}

function secondsToDhm(seconds) {
    seconds = Number(seconds);
    if (seconds === 0) return "0s";
    let d = Math.floor(seconds / 86400)
    var h = Math.floor(seconds % 86400 / 3600);
    var m = Math.floor(seconds % 86400 % 3600 / 60);

    var dDisplay = d > 0 ? d + "d " : "";
    var hDisplay = h > 0 ? h + "h " : "";
    var mDisplay = m > 0 ? m + "m " : "";
    return dDisplay + hDisplay + mDisplay;
}

submitUID.addEventListener("click", async () => {
    const response = await fetch("https://stablehorde.net/api/v2/users/" + uid.value);
    if (!response.ok) return;

    userID = uid.value;
    uidAlt.value = uid.value;
    localStorage.setItem("userID", userID);
    signIn.style.display = "none";
    updateSidebarInfo();
})

submitUIDAlt.addEventListener("click", async () => {
    const response = await fetch("https://stablehorde.net/api/v2/users/" + uidAlt.value);
    if (!response.ok) return;

    userID = uidAlt.value;
    localStorage.setItem("userID", userID);
    signIn.style.display = "none";
    updateSidebarInfo();
})

async function updateSidebarInfo() {
    if (userID === -1) return;

    let response = await fetch("https://stablehorde.net/api/v2/users/" + userID);
    if (!response.ok) return;
    let user = await response.json();

    let statsResponse = await fetch("https://stablehorde.net/api/v2/status/performance");
    if (!statsResponse.ok) return;
    let stats = await statsResponse.json();

    sidebarInfo.innerHTML = `
        <h1>Welcome back, ${user.username}</h1>
        <div>You have <b>${user.kudos}</b> kudos remaining.</div>
        <div>You have contributed <b>${user.contributions.megapixelsteps}</b> MPS and fulfilled <b>${user.contributions.fulfillments} </b>requests.</div>
        <br>
        <div>There are <b>${stats.queued_requests}</b> queued requests (<b>${stats.queued_megapixelsteps}</b> MPS) with <b>${stats.worker_count}</b> workers.</div>
        <div>In the past minute, there have been <b>${stats.past_minute_megapixelsteps}</b> MPS processed.</div>
    `;
}

// Can only call once per 30s
async function updateLeaderboard() {
    if (!leaderboardEnabled) return;
    let response = await fetch("https://stablehorde.net/api/v2/users");
    if (!response.ok) return;
    let users = await response.json();

    users.sort((a, b) => b.kudos - a.kudos);
    leaderboard.innerHTML = `
        <tr>
            <th>#</th>
            <th>User</th>
            <th>Kudos</th>
        </tr>
    `;
    for (let i = 0; i < 10; i++) {
        const user = users[i];
        leaderboard.innerHTML += `
            <tr>
                <td>${i+1}</td>
                <td>${user.username}</td>
                <td>${Math.floor(user.kudos)}</td>
            </tr>
        `;
    }
}

async function updateWorkers() {
    const response = await fetch("https://stablehorde.net/api/v2/workers");
    if (!response.ok) return;
    let workers = await response.json();
    
    content.innerHTML = "";
    for (let j = 0; j < workers.length; j++) {
        const worker = workers[j];
        const person = document.createElement("div");
        const max_size = Math.round(Math.sqrt(worker.max_pixels));
        person.innerHTML = `
            ==================<br><br>
            <div style="font-size:20px;font-weight:800">${worker.name} - ${secondsToDhm(worker.uptime)}</div>
            <div style="font-size:12px; margin-bottom: 10px">ID: ${worker.id}</div>
            <div>Max Size: ${max_size}x${max_size}</div>
            <div>Requests Fufilled: ${worker.requests_fulfilled}</div>
            <div>MPS Generated: ${worker.megapixelsteps_generated} - ${worker.performance.split(" ")[0]} MPS/s</div>
            <div>Kudos Gained: ${worker.kudos_rewards}</div>
            <ul style="margin: 0"><li>From Generating: ${worker.kudos_details.generated}</li><li>From Uptime: ${worker.kudos_details.uptime}</li></ul><br>
            ==================<br>
        `;
        content.appendChild(person);
    }
}


function openOptions() {
    document.querySelector("#options").style.display = "block";
}

function closeOptions() {
    document.querySelector("#options").style.display = "none";
}

document.getElementById("lightmode").addEventListener("change", () => {
    lightMode = document.getElementById("lightmode").checked;
    localStorage.setItem("lightMode", lightMode);
    
    if (lightMode) {
        document.querySelector("link[href='./dark.css']").href = './light.css';
        document.querySelector(".close-modal>svg>path").setAttribute("fill", "rgb(111, 111, 111)");
        return;
    }
    document.querySelector("link[href='./light.css']").href = './dark.css';
    document.querySelector(".close-modal>svg>path").setAttribute("fill", "#909090");
})

document.getElementById("leaderboardOption").addEventListener("change", () => {
    leaderboardEnabled = document.getElementById("leaderboardOption").checked;
    localStorage.setItem("leaderboardEnabled", leaderboardEnabled);
    
    if (leaderboardEnabled) {
        document.querySelector("#leaderboard").style.display = "table";
        return;
    }
    document.querySelector("#leaderboard").style.display = "none";
})

function moveLeaderboard() {
    if (window.innerWidth < 650) {
        if (leaderboard.parentElement.id != 'content') {
            content.parentElement.prepend(leaderboard);
        }
        return;
    }
    if (leaderboard.parentElement.id != 'sidebar') {
        sidebar.appendChild(leaderboard);
    }
}

window.addEventListener('resize', moveLeaderboard);

moveLeaderboard();
updateSidebarInfo();
updateWorkers();
updateLeaderboard();
setInterval(updateWorkers, 1000 * 5);
setInterval(updateSidebarInfo, 1000 * 5);
setInterval(updateLeaderboard, 1000 * 30);