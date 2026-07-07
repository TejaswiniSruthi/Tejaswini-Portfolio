/* ============================================
   Tejaswini Thambabathula — Portfolio JS
   ============================================ */

const GH_USER = 'TejaswiniSruthi';

/* ── Scroll reveal ─────────────────────────────────── */
const reveals = document.querySelectorAll('.reveal');
const revealIO = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); } });
}, { threshold: 0.10 });
reveals.forEach(el => revealIO.observe(el));

/* ── Theme toggle ──────────────────────────────────── */
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

const saved = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', saved);

themeToggle.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

/* ── Mobile nav ────────────────────────────────────── */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('open')));

/* ── Terminal typewriter ───────────────────────────── */
const LINES = [
  { type: 'pre', text: '$ whoami' },
  { type: 'out', text: 'Tejaswini Thambabathula — Test Automation Engineer' },
  { type: 'gap' },
  { type: 'pre', text: '$ cat experience.log | tail -2' },
  { type: 'out', text: 'Test Engineer @ Belzabar Software  (Aug 2024 – Present)' },
  { type: 'out', text: 'SDET Intern  @ Amazon Dev Centre   (Jan – Jun 2024)' },
  { type: 'gap' },
  { type: 'pre', text: '$ ./run_tests.sh --suite=career' },
  { type: 'ok',  text: '✓ 2+ years automation & manual testing experience' },
  { type: 'ok',  text: '✓ Reduced manual testing effort by 35% (Belzabar)' },
  { type: 'ok',  text: '✓ Improved deployment reliability by 30% (Amazon)' },
  { type: 'ok',  text: '✓ All systems green — ready to ship.' },
];
const termBody     = document.getElementById('termBody');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = ms => new Promise(r => setTimeout(r, ms));

function renderStatic() {
  termBody.innerHTML = LINES.map(l => {
    if (l.type === 'gap') return '<div style="height:10px"></div>';
    return `<div class="${l.type === 'out' ? 'out' : l.type === 'ok' ? 'ok' : 'pre'}">${l.text}</div>`;
  }).join('');
}

async function typeLines() {
  for (const l of LINES) {
    if (l.type === 'gap') {
      const g = document.createElement('div'); g.style.height = '10px';
      termBody.appendChild(g); await sleep(150); continue;
    }
    const div = document.createElement('div');
    div.className = l.type === 'out' ? 'out' : l.type === 'ok' ? 'ok' : 'pre';
    termBody.appendChild(div);
    const cur = document.createElement('span'); cur.className = 'cursor'; div.appendChild(cur);
    const speed = l.type === 'pre' ? 28 : 10;
    for (let i = 0; i < l.text.length; i++) { cur.insertAdjacentText('beforebegin', l.text[i]); await sleep(speed); }
    cur.remove();
    await sleep(l.type === 'pre' ? 220 : 90);
  }
}
reducedMotion ? renderStatic() : typeLines();

/* ── GitHub API ────────────────────────────────────── */
async function ghFetch(path) {
  const r = await fetch(`https://api.github.com${path}`, {
    headers: { 'Accept': 'application/vnd.github.v3+json' }
  });
  if (!r.ok) throw new Error(`GH API ${r.status}`);
  return r.json();
}


/* ── GitHub stats card ─────────────────────────────── */
async function loadGHStats() {
  try {
    // Fetch all repos (up to 100)
    const repos = await ghFetch(`/users/${GH_USER}/repos?per_page=100&sort=updated`);

    // Aggregate stats
    const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
    const totalForks = repos.reduce((s, r) => s + r.forks_count, 0);
    const publicRepos = repos.length;

    // Language byte counts
    const langBytes = {};
    await Promise.allSettled(
      repos.filter(r => r.language).map(async r => {
        try {
          const langs = await ghFetch(`/repos/${GH_USER}/${r.name}/languages`);
          for (const [l, b] of Object.entries(langs)) {
            langBytes[l] = (langBytes[l] || 0) + b;
          }
        } catch { /* skip */ }
      })
    );

    const totalBytes = Object.values(langBytes).reduce((a, b) => a + b, 0);
    const sortedLangs = Object.entries(langBytes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
    const uniqueLangs = sortedLangs.length;

    // Update stat boxes
    document.getElementById('ghRepos').textContent = publicRepos;
    document.getElementById('ghStars').textContent = totalStars;
    document.getElementById('ghLangs').textContent = uniqueLangs;

    // Estimate commits from commit_count (not in basic API; use rough estimate)
    // We'll show total repos × avg as an estimate, or leave commit count as fetched separately
    const commitEstimate = repos.reduce((s, r) => s + (r.size > 0 ? 1 : 0), 0);
    document.getElementById('ghCommits').textContent = (commitEstimate * 8) + '+';

    // Render repo stats card
    const card = document.getElementById('repoStatsCard');
    card.innerHTML = `
      <div class="stat-row"><span>⭐ Total Stars</span><span class="stat-val">${totalStars}</span></div>
      <div class="stat-row"><span>🍴 Total Forks</span><span class="stat-val">${totalForks}</span></div>
      <div class="stat-row"><span>📦 Public Repos</span><span class="stat-val">${publicRepos}</span></div>
      <div class="stat-row"><span>🌐 Languages Used</span><span class="stat-val">${uniqueLangs}</span></div>
      <div class="stat-row"><span>🏆 Most Starred</span><span class="stat-val">${repos.sort((a,b)=>b.stargazers_count-a.stargazers_count)[0]?.name || '—'}</span></div>
    `;

    // Render language chart
    const langWrap = document.getElementById('langChart');
    if (sortedLangs.length === 0) {
      langWrap.innerHTML = '<div class="gh-loading" style="animation:none">No language data found.</div>';
      return;
    }

    const LANG_COLORS = {
      Java: '#b07219', Python: '#3572A5', JavaScript: '#f1e05a',
      TypeScript: '#2b7489', 'C++': '#f34b7d', C: '#555555',
      Shell: '#89e051', SQL: '#e38c00', HTML: '#e34c26', CSS: '#563d7c',
      Kotlin: '#F18E33', Go: '#00ADD8', Ruby: '#701516',
    };

    langWrap.innerHTML = sortedLangs.map(([lang, bytes]) => {
      const pct = ((bytes / totalBytes) * 100).toFixed(1);
      const color = LANG_COLORS[lang] || '#' + (Math.abs(lang.split('').reduce((h,c)=>((h<<5)-h+c.charCodeAt(0))|0, 0)) % 0xFFFFFF).toString(16).padStart(6,'0');
      return `
        <div class="lang-bar-row">
          <div class="lang-bar-label"><span>${lang}</span><span>${pct}%</span></div>
          <div class="lang-bar-bg"><div class="lang-bar-fill" style="width:${pct}%;background:${color}"></div></div>
        </div>`;
    }).join('');

  } catch (err) {
    console.warn('GitHub API error:', err.message);
    // Fallback to static data from resume
    document.getElementById('ghRepos').textContent = '26';
    document.getElementById('ghStars').textContent = '18';
    document.getElementById('ghCommits').textContent = '200+';
    document.getElementById('ghLangs').textContent = '6';

    document.getElementById('repoStatsCard').innerHTML = `
      <div class="stat-row"><span>⭐ Total Stars</span><span class="stat-val">18</span></div>
      <div class="stat-row"><span>📦 Public Repos</span><span class="stat-val">26</span></div>
      <div class="stat-row"><span>🌐 Languages Used</span><span class="stat-val">6+</span></div>
    `;

    const fallbackLangs = [
      ['Java', 55], ['Python', 22], ['C++', 12], ['JavaScript', 6], ['SQL', 3], ['Shell', 2]
    ];
    document.getElementById('langChart').innerHTML = fallbackLangs.map(([lang, pct]) => {
      const colors = { Java:'#b07219', Python:'#3572A5', 'C++':'#f34b7d', JavaScript:'#f1e05a', SQL:'#e38c00', Shell:'#89e051' };
      return `
        <div class="lang-bar-row">
          <div class="lang-bar-label"><span>${lang}</span><span>${pct}%</span></div>
          <div class="lang-bar-bg"><div class="lang-bar-fill" style="width:${pct}%;background:${colors[lang]||'#00563b'}"></div></div>
        </div>`;
    }).join('');
  }
}

/* ── Contact form (Formspree) ──────────────────────── */
const contactForm    = document.getElementById('contactForm');
const btnText        = document.getElementById('btnText');
const btnLoader      = document.getElementById('btnLoader');
const formSuccess    = document.getElementById('formSuccess');
const formError      = document.getElementById('formError');
const formSubmitBtn  = document.getElementById('formSubmitBtn');

contactForm.addEventListener('submit', async e => {
  e.preventDefault();
  // Hide previous messages
  formSuccess.style.display = 'none';
  formError.style.display = 'none';
  // Loading state
  btnText.style.display = 'none';
  btnLoader.style.display = 'inline';
  formSubmitBtn.disabled = true;

  try {
    const data = new FormData(contactForm);
    const resp = await fetch(contactForm.action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });
    if (resp.ok) {
      contactForm.reset();
      formSuccess.style.display = 'block';
    } else {
      throw new Error('Form submission failed');
    }
  } catch {
    formError.style.display = 'block';
  } finally {
    btnText.style.display = 'inline';
    btnLoader.style.display = 'none';
    formSubmitBtn.disabled = false;
  }
});

/* ── Boot ──────────────────────────────────────────── */
loadGHStats();
