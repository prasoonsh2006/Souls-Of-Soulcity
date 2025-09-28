
document.addEventListener("DOMContentLoaded", () => {
    const CONFIG = {
        sheetId: "1voqzdmNKaFEaDCJEA5Dblqgcf9XQhQAjmZmf-6H6bHY", // your sheet ID
        redirectUrl: "user_page.html"
    };

    const loginForm = document.getElementById("loginForm");
    const msgBox = document.getElementById("loginMessage");

    // Fetch users from Google Sheet (CSV export)
    async function fetchUsers() {
        const url = `https://docs.google.com/spreadsheets/d/${CONFIG.sheetId}/export?format=csv&gid=0&cb=${Date.now()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const raw = await res.text();
        return parseCSV(raw);
    }

    // Parse CSV text into objects (normalize headers to lowercase)
    function parseCSV(csvText) {
        const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== "");
        if (!lines.length) return [];
        const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
        return lines.slice(1).map(line => {
            const values = line.split(",").map(v => v.trim());
            const row = {};
            headers.forEach((h, i) => row[h] = values[i] || "");
            return row;
        });
    }

    async function handleLogin(e) {
        e.preventDefault(); // stop form reload

        const username = document.getElementById("username").value.trim().toLowerCase();
        const password = document.getElementById("password").value.trim();

        if (!username || !password) {
            msgBox.textContent = "⚠️ Please enter both username and password.";
            return;
        }

        try {
            const users = await fetchUsers();

            // Check credentials (matching lowercase username)
            const match = users.find(u =>
                u.username?.trim().toLowerCase() === username &&
                u.password?.trim() === password
            );

            if (match) {
                msgBox.style.color = "green";
                msgBox.textContent = "✅ Login successful! Redirecting...";
                localStorage.setItem("loggedInUser", username);

                // Use relative redirect (works on localhost and hosted subfolder)
                window.location.href = CONFIG.redirectUrl;
            } else {
                msgBox.style.color = "red";
                msgBox.textContent = "❌ Invalid username or password.";
            }
        } catch (err) {
            console.error(err);
            msgBox.style.color = "red";
            msgBox.textContent = "🚫 Error connecting to server (check if sheet is public).";
        }
    }

    loginForm.addEventListener("submit", handleLogin);
});

