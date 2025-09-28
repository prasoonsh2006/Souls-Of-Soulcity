document.addEventListener("DOMContentLoaded", () => {
    const CONFIG = {
        sheetId: "1lGlymb5pOUI3YG1wf6g5SdO-hdUp291MfDXwlvGQJfg"
    };
    const container = document.getElementById("rankings-content");
    let currentData = [];

    async function loadRankings() {
        try {
            const url = `https://docs.google.com/spreadsheets/d/${CONFIG.sheetId}/export?format=csv&gid=0&cb=${Date.now()}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const raw = await res.text();

            currentData = parseCSV(raw);

            if (hasPointsColumn()) {
                sortRankings("points");
            } else {
                renderRankings(currentData, Object.keys(currentData[0] || {}), false);
            }

        } catch (err) {
            console.error(err);
            container.innerHTML = '<div class="error">Error loading rankings.</div>';
        }
    }

    // Basic CSV parser
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

    function hasPointsColumn() {
        return currentData.length > 0 && "Point" in currentData[0] && currentData.some(row => row.Point && !isNaN(row.Point));
    }

    function renderRankings(data, headers, dynamicRank = true) {
        if (!data.length) return container.innerHTML = '<div class="error">No rankings data.</div>';

        const imgColumn = headers.find(h => h.toLowerCase().includes("image")) || null;
        const defaultImage = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS52PCNDxLnQy9G3WX4HQYVzoELPct7cstLx5AWpRF6kB3fWVwgn1JIDFopeTe93PRQiVqo-g&s';

        container.innerHTML = data.map((row, index) => {
            let rankValue = dynamicRank ? `#${index + 1}` : row.Rank || "#";
            if (row.Rank && row.Rank.trim() !== "") rankValue = dynamicRank ? `#${index + 1} ${row.Rank}` : `#${row.Rank}`;

            const imgUrl = (imgColumn && row[imgColumn] && row[imgColumn].trim()) ? row[imgColumn].trim() : defaultImage;
            const showRowPoints = (row.Toggleforpoint || "").trim().toLowerCase() === "on";

            return `
                <div class="trump-card">
                    <div class="rank">${rankValue}</div>
                    ${imgColumn ? `<div class="image"><img src="${imgUrl}" alt="${row.Name || ''}" onerror="this.onerror=null;this.src='${defaultImage}'" /></div>` : ""}
                    <div class="name">${row.Name || ""}</div>
                    <div class="stats">
                        <div class="stat"><div class="stat-value">${row.Car || ""}</div></div>
                        <div class="stat"><div class="stat-value">${row.Winner || ""}</div></div>
                        ${showRowPoints && hasPointsColumn() ? `<div class="stat"><div class="stat-value">${row.Point || ""} pts</div></div>` : ""}
                    </div>
                </div>
            `;
        }).join('');
    }

    function sortRankings(sortBy) {
        if (!currentData.length) return;

        const sorted = [...currentData].sort((a, b) => {
            if (sortBy === "points") {
                const pointDiff = (parseInt(b.Point || 0) - parseInt(a.Point || 0));
                if (pointDiff !== 0) return pointDiff;
                return parseInt(b.Winner || 0) - parseInt(a.Winner || 0);
            }
            return 0;
        });

        renderRankings(sorted, Object.keys(currentData[0]), true);
    }

    window.loadRankings = loadRankings;
    window.sortRankings = sortRankings;

    loadRankings();
    setInterval(loadRankings, 10000);
});
