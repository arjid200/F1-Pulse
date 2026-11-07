/**
 * F1 Pulse — app.js  v4.0
 *
 * FIXED:  Correct Jolpica domain → api.jolpi.ca  (not api.jolpica.com)
 * FIXED:  OpenF1 locks ALL data behind paywall during live sessions
 * USES:   api.jolpi.ca — free, no-auth, working as of Nov 2026
 *
 * Live data confirmed:
 *   Next race  → Round 20 · Brazilian Grand Prix · 2026-11-08T17:00:00Z
 *   P1 Standings → Andrea Kimi Antonelli (Mercedes) · 380 pts
 */

'use strict';

/* ═══════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════ */
const BASE       = 'https://api.jolpi.ca/ergast/f1';
const HEADERS    = { 'Accept': 'application/json' };
const TIMEOUT_MS = 12_000;

const URLS = {
  next:      `${BASE}/current/next.json`,
  last:      `${BASE}/current/last.json`,
  standings: `${BASE}/current/driverStandings.json`,
};

/* ═══════════════════════════════════════════
   Team → accent colour
   ═══════════════════════════════════════════ */
const TEAM_COLOURS = {
  'mercedes':     '#27F4D2',
  'red bull':     '#3671C6',
  'ferrari':      '#E80020',
  'mclaren':      '#FF8000',
  'aston martin': '#229971',
  'alpine':       '#FF87BC',
  'williams':     '#64C4FF',
  'haas':         '#B6BABD',
  'kick sauber':  '#52E252',
  'sauber':       '#52E252',
  'alfa romeo':   '#52E252',
  'rb':           '#6692FF',
  'alphatauri':   '#6692FF',
  'racing bulls': '#6692FF',
  'visa cash app rb': '#6692FF',
  'cadillac':     '#CC0000',
};

function teamColour(name) {
  if (!name) return null;
  const lc = name.toLowerCase();
  for (const [k, v] of Object.entries(TEAM_COLOURS)) {
    if (lc.includes(k)) return v;
  }
  return null;
}

/* ═══════════════════════════════════════════
   Utility
   ═══════════════════════════════════════════ */
const $   = id => document.getElementById(id);
const pad = n  => String(n).padStart(2, '0');

const show = el => el && el.classList.remove('hidden');
const hide = el => el && el.classList.add('hidden');

function escHTML(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function apiFetch(url, ms = TIMEOUT_MS) {
  const ctrl = new AbortController();
  const tid  = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: HEADERS });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(tid);
  }
}

function toLocalDateTime(isoStr) {
  if (!isoStr) return 'Time TBC';
  return new Date(isoStr).toLocaleString(undefined, {
    weekday: 'short', day: 'numeric', month: 'short',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZoneName: 'short',
  });
}

function toLocalDate(isoStr) {
  if (!isoStr) return '—';
  return new Date(isoStr).toLocaleDateString(undefined, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

/* ═══════════════════════════════════════════
   Countdown
   ═══════════════════════════════════════════ */
let _cdInt = null;

function startCountdown(raceISO) {
  const target = new Date(raceISO);
  const grid   = $('countdown-grid');
  const loader = $('cd-skeleton');
  const live   = $('race-live');
  const local  = $('cd-local-time');
  const secsEl = $('cd-secs');

  hide(loader);

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      clearInterval(_cdInt);
      hide(grid); hide(local);
      show(live);
      return;
    }
    const s = Math.floor(diff / 1000);
    $('cd-days').textContent  = pad(Math.floor(s / 86400));
    $('cd-hours').textContent = pad(Math.floor((s % 86400) / 3600));
    $('cd-mins').textContent  = pad(Math.floor((s % 3600) / 60));
    secsEl.textContent        = pad(s % 60);

    // Seconds glow pulse
    secsEl.classList.remove('tick');
    void secsEl.offsetWidth;
    secsEl.classList.add('tick');

    show(grid);
  }

  tick();
  _cdInt = setInterval(tick, 1000);
}

/* ═══════════════════════════════════════════
   Build session weekend schedule HTML
   ═══════════════════════════════════════════ */
function buildSessionRows(race) {
  const sessions = [
    { key: 'FirstPractice',  label: 'FP1' },
    { key: 'SecondPractice', label: 'FP2' },
    { key: 'ThirdPractice',  label: 'FP3' },
    { key: 'Sprint',         label: 'Sprint' },
    { key: 'SprintQualifying', label: 'Sprint Quali' },
    { key: 'Qualifying',     label: 'Qualifying' },
    { key: null,             label: 'Race', date: race.date, time: race.time },
  ];

  const now = Date.now();
  let html = '';

  sessions.forEach(({ key, label, date: d, time: t }) => {
    const src  = key ? race[key] : null;
    const date = src?.date ?? d;
    const time = src?.time ?? t;
    if (!date) return;

    const iso       = time ? `${date}T${time}` : `${date}T00:00:00Z`;
    const isRace    = label === 'Race';
    const isPast    = new Date(iso) < now;
    const localStr  = toLocalDateTime(iso);

    html += `
      <div class="session-row${isRace ? ' session-row--race' : ''}${isPast ? ' session-row--past' : ''}">
        <span class="session-label">${label}</span>
        <span class="session-time">${localStr}</span>
      </div>`;
  });

  return html;
}

/* ═══════════════════════════════════════════
   Render: Race card
   ═══════════════════════════════════════════ */
function renderRace(race, isNext) {
  const raceISO = race.time
    ? `${race.date}T${race.time}`
    : `${race.date}T00:00:00Z`;

  // Header bar
  $('hdr-country').textContent = race.Circuit?.Location?.country ?? '—';
  $('hdr-circuit').textContent = race.Circuit?.circuitName       ?? '—';

  // Race card
  $('race-label').textContent   = isNext ? 'NEXT RACE' : 'LAST RACE';
  $('race-round').textContent   = `RD ${pad(race.round ?? 0)}`;
  $('race-name').textContent    = (race.raceName ?? '—').toUpperCase();
  $('chip-circuit').textContent = race.Circuit?.circuitName ?? '—';
  $('chip-country').textContent = race.Circuit?.Location?.country ?? '—';

  // Session schedule block
  const schedEl = $('session-schedule');
  if (schedEl) schedEl.innerHTML = buildSessionRows(race);

  hide($('race-skeleton'));
  show($('race-content'));

  // Countdown
  $('cd-local-text').textContent = toLocalDateTime(raceISO);
  $('cd-status').textContent     = toLocalDate(raceISO);
  $('sync-label').textContent    = `2026 · Live`;

  if (isNext) {
    startCountdown(raceISO);
    show($('cd-local-time'));
  } else {
    hide($('cd-skeleton'));
    hide($('countdown-grid'));
    hide($('cd-local-time'));
    const b = $('race-live');
    b.innerHTML = `<span>🏁</span><span>SEASON CONCLUDED — ${race.season ?? ''}</span><span>🏁</span>`;
    show(b);
  }
}

/* ═══════════════════════════════════════════
   Render: Standings
   ═══════════════════════════════════════════ */
function renderStandings(entries) {
  const list = $('standings-list');
  list.innerHTML = '';

  entries.slice(0, 5).forEach((e, i) => {
    const accent = teamColour(e.Constructors?.[0]?.name) ?? 'var(--team-default)';
    const name   = `${e.Driver?.givenName ?? ''} ${e.Driver?.familyName ?? ''}`.trim();
    const team   = e.Constructors?.[0]?.name ?? '—';

    const li = document.createElement('li');
    li.className = 'driver-item';
    li.setAttribute('data-pos', e.position);
    li.style.setProperty('--accent', accent);
    li.style.animationDelay = `${(i * 0.08).toFixed(2)}s`;

    li.innerHTML = `
      <span class="driver-pos">${escHTML(e.position)}</span>
      <div class="driver-info">
        <div class="driver-name">${escHTML(name)}</div>
        <div class="driver-team">${escHTML(team)}</div>
      </div>
      <div class="driver-pts-col">
        <span class="driver-pts-val">${escHTML(e.points)}</span>
        <span class="driver-pts-lbl">PTS</span>
      </div>`;

    list.appendChild(li);
  });

  hide($('standings-skeleton'));
  show($('standings-list'));
}

/* ═══════════════════════════════════════════
   Error helpers
   ═══════════════════════════════════════════ */
function onRaceError(msg) {
  console.error('[F1 Pulse] Race fetch failed:', msg);
  hide($('race-skeleton'));
  hide($('cd-skeleton'));
  show($('race-error'));
  const dot = document.querySelector('.sync-dot');
  if (dot) { dot.style.background = '#F59E0B'; dot.style.boxShadow = '0 0 6px #F59E0B'; }
  $('sync-label').textContent = 'Offline';
}

function onStandingsError(msg) {
  console.error('[F1 Pulse] Standings fetch failed:', msg);
  hide($('standings-skeleton'));
  show($('standings-error'));
}

/* ═══════════════════════════════════════════
   Fetch: Race (next → last fallback)
   ═══════════════════════════════════════════ */
async function loadRace() {
  // ① Try upcoming race
  try {
    const d     = await apiFetch(URLS.next);
    const races = d?.MRData?.RaceTable?.Races ?? [];
    if (races.length > 0) { renderRace(races[0], true); return; }
  } catch (e) { console.warn('[F1 Pulse] next.json failed:', e.message); }

  // ② Off-season: show last race
  try {
    const d     = await apiFetch(URLS.last);
    const races = d?.MRData?.RaceTable?.Races ?? [];
    if (races.length > 0) { renderRace(races[0], false); return; }
  } catch (e) { console.warn('[F1 Pulse] last.json failed:', e.message); }

  onRaceError('Both endpoints exhausted');
}

/* ═══════════════════════════════════════════
   Fetch: Standings
   ═══════════════════════════════════════════ */
async function loadStandings() {
  try {
    const d     = await apiFetch(URLS.standings);
    const lists = d?.MRData?.StandingsTable?.StandingsLists ?? [];
    if (!lists.length || !lists[0].DriverStandings?.length) throw new Error('Empty');
    renderStandings(lists[0].DriverStandings);
  } catch (e) {
    onStandingsError(e.message);
  }
}

/* ═══════════════════════════════════════════
   Boot
   ═══════════════════════════════════════════ */
function init() {
  Promise.allSettled([loadRace(), loadStandings()]).then(() => {
    const ts = new Date().toLocaleTimeString(undefined, {
      hour: '2-digit', minute: '2-digit'
    });
    $('footer-ts').textContent = `Updated ${ts}`;
  });
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', init)
  : init();
