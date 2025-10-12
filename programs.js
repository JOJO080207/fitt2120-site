<script>
(async function () {
  // Where to render
  const root = document.querySelector("#monthly-programming") || document.querySelector("#programs-root") || document.body;
  const notice = document.getElementById("programs-notice");

  const setNotice = (msg) => { if (notice) notice.textContent = msg; };
  const card = (html) => { const d = document.createElement("div"); d.className = "card"; d.innerHTML = html; return d; };

  async function loadData() {
    // Try external JSON first
    try {
      const r = await fetch("./programs.json", { cache: "no-store" });
      if (!r.ok) throw new Error("programs.json fetch failed " + r.status);
      return await r.json();
    } catch (e) {
      // Fallback to embedded JSON if present
      const embedded = document.getElementById("programs-embedded");
      if (embedded && embedded.textContent.trim()) {
        return JSON.parse(embedded.textContent);
      }
      throw e;
    }
  }

  try {
    const data = await loadData();

    // Clear any "Loading..." content
    root.innerHTML = "";

    // Header
    const cycleTitle = data.cycle_title || data.title || "Monthly Programming";
    const cycleNotes = data.notes || "";
    root.appendChild(card(`
      <h2><span class="dot" aria-hidden="true"></span> ${cycleTitle}</h2>
      <p class="small muted">${cycleNotes}</p>
    `));

    // Tracks grid
    const grid = document.createElement("div");
    grid.className = "grid";

    (data.tracks || []).forEach((track, idx) => {
      const trackTitle = track.name || track.title || `Program ${idx + 1}`;
      const trackSummary = track.summary || track.description || "";

      const t = document.createElement("div");
      t.className = "card";
      t.innerHTML = `<h3>${trackTitle}</h3><p class="small">${trackSummary}</p>`;

      (track.weeks || []).forEach((week, wIdx) => {
        const weekTitle = week.title || week.name || `Week ${wIdx + 1}`;
        const w = document.createElement("div");
        w.style.marginTop = "10px";
        w.innerHTML = `<h4 style="margin-bottom:6px">${weekTitle}</h4>`;

        (week.days || []).forEach(day => {
          const dayName = day.name || day.title || "Session";
          const items = (day.items || []).map(i => `<li>${i}</li>`).join("");
          const blk = document.createElement("div");
          blk.style.margin = "6px 0 10px";
          blk.innerHTML = `
            <div class="small" style="font-weight:600">${dayName}</div>
            <ul class="small" style="margin-top:4px">${items}</ul>
          `;
          w.appendChild(blk);
        });

        t.appendChild(w);
      });

      grid.appendChild(t);
    });

    root.appendChild(grid);

    // Recovery
    if (data.recovery) {
      const warmup = data.recovery.warmup || "";
      const post = (data.recovery.post || []).map(i => `<li>${i}</li>`).join("");
      const recNotes = data.recovery.notes || "";
      root.appendChild(card(`
        <h3>Recovery & Mobility</h3>
        <p><strong>Warm-up:</strong> ${warmup}</p>
        <ul class="small">${post}</ul>
        <p class="small muted">${recNotes}</p>
      `));
    }

    setNotice("Updated monthly • Cycle: " + (data.cycle_code || ""));
  } catch (err) {
    console.error(err);
    setNotice("Could not load monthly programming.");
    root.innerHTML = "";
    root.appendChild(card(`
      <p>We’re updating the monthly plan. If this persists, make sure <code>programs.json</code> is in the site root and valid JSON.</p>
    `));
  }
})();
</script>
