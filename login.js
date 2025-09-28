document.addEventListener("DOMContentLoaded", () => {
    const CONFIG = {
        sheetId: "1voqzdmNKaFEaDCJEA5Dblqgcf9XQhQAjmZmf-6H6bHY",
        redirectUrl: "user_page.html"
    };

    const loginForm = document.getElementById("loginForm");
    const msgBox = document.getElementById("loginMessage");

    async function fetchUsers() {
        const url = `https://docs.google.com/spreadsheets/d/${CONFIG.sheetId}/export?format=csv&gid=0&cb=${Date.now()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const raw = await res.text();
        return parseCSV(raw);
    }

    function parseCSV(csvText) {
        const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== "");
        if (!lines.length) return [];
        const headers = lines[0].split(",").map(h => h.trim());
        return lines.slice(1).map(line => {
            const values = line.split(",").map(v => v.trim());
            const row = {};
            headers.forEach((h, i) => row[h] = values[i] || "");
            return row;
        });
    }

    async function handleLogin(e) {
        e.preventDefault(); // prevent form from reloading the page

        const username = document.getElementById("username").value.trim().toLowerCase();
        const password = document.getElementById("password").value.trim();

        if (!username || !password) {
            msgBox.textContent = "⚠️ Please enter both username and password.";
            return;
        }

        try {
            const users = await fetchUsers();
            const match = users.find(u =>
                u.Username?.trim().toLowerCase() === username &&
                u.Password?.trim() === password
            );

            if (match) {
                msgBox.textContent = "✅ Login successful! Redirecting...";
                localStorage.setItem("loggedInUser", username);
                window.location.href = window.location.origin + "/user_page.html";
            } else {
                msgBox.textContent = "❌ Invalid username or password.";
            }
        } catch (err) {
            console.error(err);
            msgBox.textContent = "🚫 Error connecting to server.";
        }
    }

    loginForm.addEventListener("submit", handleLogin);
});

