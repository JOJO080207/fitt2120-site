(async function(){
  // Load the month’s data
  const res = await fetch('/programs.json', {cache:'no-store'});
  const data = await res.json();

  const tracks = data.tracks || [];
  const root   = document.getElementById('program-root');
  const weekTabs = document.getElementById('week-tabs');
  const trackButtons = document.getElementById('track-buttons');
  const icalBtn = document.getElementById('subscribe-ical');

  let currentTrack = tracks[0]?.id || null;
  let currentWeek  = 1;

  // Build track buttons
  function renderTracks(){
    trackButtons.innerHTML = '';
    tracks.forEach(t=>{
      const b = document.createElement('button');
      b.className = 'tab';
      b.textContent = t.name;
      b.setAttribute('aria-pressed', t.id===currentTrack ? 'true' : 'false');
      b.onclick = ()=>{ currentTrack = t.id; currentWeek=1; renderWeeks(); renderWeek(); };
      trackButtons.appendChild(b);
    });
  }

  // Build week tabs (1..4)
  function renderWeeks(){
    weekTabs.innerHTML = '';
    const weeks = getTrack()?.weeks?.length || 4;
    for(let i=1;i<=weeks;i++){
      const w = document.createElement('button');
      w.className = 'tab';
      w.textContent = `Week ${i}`;
      w.setAttribute('aria-selected', i===currentWeek ? 'true' : 'false');
      w.onclick = ()=>{ currentWeek=i; renderWeeks(); renderWeek(); };
      weekTabs.appendChild(w);
    }
  }

  function getTrack(){
    return tracks.find(t=>t.id===currentTrack);
  }

  function renderWeek(){
    const track = getTrack();
    const week  = track.weeks[currentWeek-1];
    root.innerHTML = '';

    week.days.forEach(day=>{
      const card = document.createElement('article');
      card.className = 'day';

      const h = document.createElement('h4');
      h.textContent = day.name;
      card.appendChild(h);

      const meta = document.createElement('div');
      meta.className = 'meta';
      ['type','time','intensity'].forEach(k=>{
        if(day[k]){ const s=document.createElement('span'); s.textContent = `${k[0].toUpperCase()+k.slice(1)}: ${day[k]}`; meta.appendChild(s); }
      });
      card.appendChild(meta);

      // steps list
      const ul = document.createElement('ul');
      day.steps.forEach(step=>{
        const li = document.createElement('li');
        li.className = 'step';
        li.textContent = step;
        ul.appendChild(li);
      });
      card.appendChild(ul);

      root.appendChild(card);
    });

    // Build a simple downloadable ICS for the selected track/week (one all-day per day)
    const ics = buildICS(track, week);
    const blob = new Blob([ics], {type:'text/calendar'});
    const url = URL.createObjectURL(blob);
    icalBtn.href = url;
    icalBtn.download = `${slug(data.title||'fitt-program')}-${slug(track.name)}-week${currentWeek}.ics`;
  }

  function slug(s){ return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }

  function buildICS(track, week){
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth()+1).padStart(2,'0');

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//FITT 21-20//Programs//EN'
    ];

    week.days.forEach((day,i)=>{
      const d = String(i+1).padStart(2,'0');
      const dt = `${y}${m}${d}`;
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${cryptoRandom()}@fitt2120`);
      lines.push(`DTSTAMP:${y}${m}${d}T090000Z`);
      lines.push(`DTSTART;VALUE=DATE:${dt}`);
      lines.push(`DTEND;VALUE=DATE:${dt}`);
      lines.push(`SUMMARY:${track.name} – ${day.name}`);
      lines.push(`DESCRIPTION:${(day.steps||[]).join('\\n')}`);
      lines.push('END:VEVENT');
    });

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  function cryptoRandom(){
    return (crypto.getRandomValues(new Uint32Array(1))[0]).toString(16);
  }

  // init
  if(!currentTrack){ root.textContent = 'No programs found.'; return; }
  renderTracks(); renderWeeks(); renderWeek();
})();
