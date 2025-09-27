document.addEventListener("DOMContentLoaded", () => {

    const CONFIG = { sheetId: "1KVHueuaviZAXAwnJ8sI66MryqLO0jRD9ZgQjYGBNr2Y" };
    const container = document.getElementById("watch-content");
    let currentData = [];

    // --- Fetch CSV from Google Sheets ---
    async function loadWatch() {
        try {
            const url = `https://docs.google.com/spreadsheets/d/${CONFIG.sheetId}/export?format=csv&gid=0&cb=${Date.now()}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const rawCSV = await res.text();
            currentData = parseCSV(rawCSV); // Parse CSV manually
            renderWatch(currentData);
        } catch (err) {
            console.error(err);
            container.innerHTML = '<div class="error">Error loading videos.</div>';
        }
    }

    // --- Simple CSV parser (no library needed) ---
    function parseCSV(csvText) {
        const lines = csvText.trim().split("\n");
        const headers = lines[0].split(",");
        const rows = lines.slice(1).map(line => {
            const values = line.split(",");
            const obj = {};
            headers.forEach((header, i) => obj[header.trim()] = values[i] ? values[i].trim() : "");
            return obj;
        });
        return rows;
    }

    // --- Render videos ---
    function renderWatch(data) {
        if (!data.length) return container.innerHTML = '<div class="error">No videos available.</div>';

        const ordered = [...data].reverse(); // last entry first
        container.innerHTML = ordered.map(row => {
            let videoId = null;
            let timestamp = null;

            if (row.YouTubeURL) {
                try {
                    const url = new URL(row.YouTubeURL.trim());
                    if (url.hostname.includes('youtu.be')) videoId = url.pathname.split('/')[1].split(/[?&]/)[0];
                    else if (url.searchParams.get('v')) videoId = url.searchParams.get('v');
                    else videoId = url.pathname.split('/').pop().split(/[?&]/)[0];
                    timestamp = url.searchParams.get('t');
                } catch (e) { videoId = null; timestamp = null; }
            }

            return `
                <div class="video-card">
                    <div class="video-card-content">
                        <h3>${row.Title || "Untitled"}</h3>
                        <div class="driver">Driver: ${row.Driver || "Unknown"}</div>
                        <div class="date">${row.Date || ""}</div>

                        <div class="video-player" style="margin:1rem 0;">
                            <div class="youtube-lite" data-id="${videoId || ''}" data-start="${timestamp || ''}" style="position:relative;width:100%;padding-top:56.25%;background:#000;cursor:pointer;border-radius:6px;overflow:hidden;">
                                ${videoId
                ? `<img src="https://i.ytimg.com/vi/${videoId}/hqdefault.jpg" alt="Video Thumbnail" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;">`
                : `<div style="position:absolute;top:0;left:0;width:100%;height:100%;background:#222;display:flex;align-items:center;justify-content:center;color:white;font-size:0.9rem;">
                                            No Video Available
                                       </div>`
            }
                                ${videoId ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 67 60" fill="red" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:72px;height:72px;opacity:0.95;pointer-events:none;"><path d="M26.6 39.43L42.93 30 26.6 20.57z" fill="#fff"/></svg>` : ""}
                            </div>
                        </div>

                        ${videoId ? `<a href="${row.YouTubeURL}" target="_blank" class="watch-btn">WATCH VIDEO</a>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        document.querySelectorAll(".youtube-lite").forEach(el => {
            const videoId = el.dataset.id;
            const start = el.dataset.start;
            if (!videoId) return;

            let isClicked = false; // track if user clicked

            // Hover preview (muted)
            el.addEventListener("mouseenter", () => {
                if (!el.querySelector("iframe") && !isClicked) {
                    el.innerHTML = `<iframe 
                src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1${start ? `&start=${parseInt(start)}` : ''}&rel=0" 
                style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" 
                frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen></iframe>`;
                }
            });

            // Restore thumbnail on hover leave (if not clicked)
            el.addEventListener("mouseleave", () => {
                if (!isClicked) {
                    el.innerHTML = `
                <img src="https://i.ytimg.com/vi/${videoId}/hqdefault.jpg" alt="Video Thumbnail" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 67 60" fill="red" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:72px;height:72px;opacity:0.95;pointer-events:none;">
                    <path d="M26.6 39.43L42.93 30 26.6 20.57z" fill="#fff"/>
                </svg>
            `;
                }
            });

            // Click to load full video (unmuted)
            el.addEventListener("click", (e) => {
                // Make sure click works even if target is child
                const container = e.currentTarget;
                isClicked = true;
                container.innerHTML = `<iframe 
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" 
            style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" 
            frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen></iframe>`;
            });
        });



    }

    // --- Search functionality ---
    const searchInput = document.getElementById("watch-search");
    if (searchInput) searchInput.addEventListener("input", e => {
        const term = e.target.value.toLowerCase();
        const filtered = currentData.filter(row =>
            (row.Title || "").toLowerCase().includes(term) ||
            (row.Driver || "").toLowerCase().includes(term)
        );
        renderWatch(filtered);
    });

    // Load videos
    loadWatch();
});

