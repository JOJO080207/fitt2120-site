<script>
async function loadPrograms() {
  try {
    const res = await fetch('/programs.json?v=' + Date.now());
    const data = await res.json();
    renderPrograms(data);
  } catch (e) {
    console.error('Failed to load programs.json', e);
    const container = document.getElementById('programs-root');
    if (container) container.innerHTML = '<div class="card"><p>Unable to load programming right now.</p></div>';
  }
}

function renderPrograms(data) {
  const root = document.getElementById('programs-root');
  if (!root) return;

  // Header
  root.innerHTML = `
    <div class="card" style="margin-bottom:16px">
      <h2 style="margin:0 0 6px"><span class="dot"></span> Monthly Programming</h2>
      <p class="small" style="margin:0">Block: <strong>${escapeHtml(data.monthLabel || '')}</strong> — ${escapeHtml(data.note || '')}</p>
    </div>
  `;

  // Tracks
  const grid = document.createElement('div');
  grid.className = 'grid';

  (data.tracks || []).forEach(track => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${escapeHtml(track.title)}</h3>
      <p class="small">${escapeHtml(track.summary || '')}</p>
      ${renderWeeks(track.weeks || [])}
    `;
    grid.appendChild(card);
  });

  root.appendChild(grid);

  // Conditioning + Recovery
  const extras = document.createElement('div');
  extras.className = 'grid';
  extras.innerHTML = `
    <div class="card">
      <h3>Conditioning Options</h3>
      <ul>${(data.conditioning || []).map(c => `<li><strong>${escapeHtml(c.title)}:</strong> ${escapeHtml(c.detail)}</li>`).join('')}</ul>
    </div>
    <div class="card">
      <h3>Recovery</h3>
      <ul>${(data.recovery || []).map(r => `<li>${escapeHtml(r)}</li>`).join('')}</ul>
      <p style="margin-top:8px"><a class="btn btn-outline" href="/benefits-ir-sauna.html">Sauna Benefits</a> <a class="btn btn-outline" href="/pre-lift.html">Pre-Lift Mobility</a></p>
    </div>
  `;
  root.appendChild(extras);

  // Expand/collapse behavior
  document.querySelectorAll('[data-accordion]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.getAttribute('aria-controls'));
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      if (target) target.hidden = expanded;
    });
  });
}

function renderWeeks(weeks) {
  return weeks.map(wk => {
    // If week copies from another, display note
    let body = '';
    if (wk.copyFromWeek) {
      body = `<p class="small muted">Same exercises as Week ${wk.copyFromWeek}. ${wk.progression ? escapeHtml(wk.progression) : ''}</p>`;
    } else {
      body = `
        <div class="grid" style="margin-top:6px">
          ${wk.days.map(d =>
            `<div class="card" style="border:1px dashed rgba(255,255,255,.08)">
               <h4 style="margin:0 0 6px">${escapeHtml(d.name)}</h4>
               <ul>${(d.items||[]).map(it => `<li>${escapeHtml(it)}</li>`).join('')}</ul>
             </div>`
          ).join('')}
        </div>
        ${wk.progression ? `<p class="small muted" style="margin-top:6px">${escapeHtml(wk.progression)}</p>` : ''}
      `;
    }

    const sectionId = `week-${wk.week}-${Math.random().toString(36).slice(2,7)}`;
    return `
      <div class="week">
        <button class="btn btn-outline" data-accordion aria-expanded="false" aria-controls="${sectionId}" style="width:100%; text-align:left; display:flex; justify-content:space-between; align-items:center; margin:10px 0">
          <span>Week ${wk.week}</span>
          <span aria-hidden="true">▸</span>
        </button>
        <div id="${sectionId}" hidden>
          ${body}
        </div>
      </div>
    `;
  }).join('');
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}

document.addEventListener('DOMContentLoaded', loadPrograms);
</script>
