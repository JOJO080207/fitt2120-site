<script>
(async function () {
  const container = document.getElementById("monthly-programming");
  const notice = document.getElementById("programs-notice");

  function setNotice(msg){ if (notice) notice.textContent = msg; }

  try {
    // Use relative path to avoid any subpath/domain quirks
    const res = await fetch("./programs.json", { cache: "no-store" });
    if (!res.ok) throw new Error("programs.json fetch failed: " + res.status);

    const data = await res.json();

    // Header
    const header = document.createElement("div");
    header.className = "card";
    header.innerHTML = `
      <h2><span class="dot" aria-hidden="true"></span> ${data.cycle_title}</h2>
      <p class="small muted">${data.notes}</p>
    `;
    container.appendChild(header);

    // Tracks
    const grid = document.createElement("div");
    grid.className = "grid";
    (data.tracks || []).forEach(track => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${track.name}</h3>
        <p class="small">${track.summary || ""}</p>
      `;
      (track.weeks || []).forEach(week => {
        const weekEl = document.createElement("div");
        weekEl.style.marginTop = "10px";
        weekEl.innerHTML = `<h4 style="margin-bottom:6px">${week.title}</h4>`;
        (week.days || []).forEach(day => {
          const items = (day.items || []).map(i => `<li>${i}</li>`).join("");
          const block = document.createElement("div");
          block.style.margin = "6px 0 10px";
          block.innerHTML = `
            <div class="small" style="font-weight:600">${day.name}</div>
            <ul class="small" style="margin-top:4px">${items}</ul>
          `;
          weekEl.appendChild(block);
        });
        card.appendChild(weekEl);
      });
      grid.appendChild(card);
    });
    container.appendChild(grid);

    // Recovery
    if (data.recovery) {
      const rec = document.createElement("div");
      rec.className = "card";
      rec.innerHTML = `
        <h3>Recovery & Mobility</h3>
        <p><strong>Warm-up:</strong> ${data.recovery.warmup || ""}</p>
        <ul class="small">${(data.recovery.post || []).map(i => `<li>${i}</li>`).join("")}</ul>
        <p class="small muted">${data.recovery.notes || ""}</p>
      `;
      container.appendChild(rec);
    }

    setNotice("Updated monthly • Cycle: " + (data.cycle_code || ""));
  } catch (err) {
    console.error(err);
    setNotice("Could not load monthly programming.");
    if (container) {
      container.innerHTML = `
        <div class="card">
          <p>We’re updating the monthly plan. If this persists, make sure <code>programs.json</code> is in the site root and valid JSON.</p>
        </div>
      `;
    }
  }
})();
</script>
