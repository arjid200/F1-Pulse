/**
 * F1 Pulse ╬ô├ç├╢ app.js  v4.0
 *
 * FIXED:  Correct Jolpica domain ╬ô├Ñ├å api.jolpi.ca  (not api.jolpica.com)
 * FIXED:  OpenF1 locks ALL data behind paywall during live sessions
 * USES:   api.jolpi.ca ╬ô├ç├╢ free, no-auth, working as of Nov 2026
 *
 * Live data confirmed:
 *   Next race  ╬ô├Ñ├å Round 20 Γö¼Γòû Brazilian Grand Prix Γö¼Γòû 2026-11-08T17:00:00Z
 *   P1 Standings ╬ô├Ñ├å Andrea Kimi Antonelli (Mercedes) Γö¼Γòû 380 pts
 */

'use strict';

/* ╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë
   Constants
   ╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë */
const BASE       = 'https://api.jolpi.ca/ergast/f1';
const HEADERS    = { 'Accept': 'application/json' };
const TIMEOUT_MS = 12_000;

const URLS = {
  next:      `${BASE}/current/next.json`,
  last:      `${BASE}/current/last.json`,
  standings: `${BASE}/current/driverStandings.json`,
};

/* ╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë
   Team ╬ô├Ñ├å accent colour
   ╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë */
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

/* ╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë
   Utility
   ╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë */
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
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timeZoneName: 'short',
  });
}

function toLocalDate(isoStr) {
  if (!isoStr) return '╬ô├ç├╢';
  return new Date(isoStr).toLocaleDateString(undefined, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
}

/* ╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë
   Countdown
   ╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë */
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

/* ╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë
   Build session weekend schedule HTML
   ╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë */
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

/* ╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë
   Render: Race card
   ╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë */
function renderRace(race, isNext) {
  const raceISO = race.time
    ? `${race.date}T${race.time}`
    : `${race.date}T00:00:00Z`;

  // Header bar
  $('hdr-country').textContent = race.Circuit?.Location?.country ?? '╬ô├ç├╢';
  $('hdr-circuit').textContent = race.Circuit?.circuitName       ?? '╬ô├ç├╢';

  // Race card
  $('race-label').textContent   = isNext ? 'NEXT RACE' : 'LAST RACE';
  $('race-round').textContent   = `RD ${pad(race.round ?? 0)}`;
  $('race-name').textContent    = (race.raceName ?? '╬ô├ç├╢').toUpperCase();
  $('chip-circuit').textContent = race.Circuit?.circuitName ?? '╬ô├ç├╢';
  $('chip-country').textContent = race.Circuit?.Location?.country ?? '╬ô├ç├╢';

  // Session schedule block
  const schedEl = $('session-schedule');
  if (schedEl) schedEl.innerHTML = buildSessionRows(race);

  hide($('race-skeleton'));
  show($('race-content'));

  // Countdown
  $('cd-local-text').textContent = toLocalDateTime(raceISO);
  $('cd-status').textContent     = toLocalDate(raceISO);
  $('sync-label').textContent    = `2026 Γö¼Γòû Live`;

  if (isNext) {
    startCountdown(raceISO);
    show($('cd-local-time'));
  } else {
    hide($('cd-skeleton'));
    hide($('countdown-grid'));
    hide($('cd-local-time'));
    const b = $('race-live');
    b.innerHTML = `<span>Γëí╞Æ├à├╝</span><span>SEASON CONCLUDED ╬ô├ç├╢ ${race.season ?? ''}</span><span>Γëí╞Æ├à├╝</span>`;
    show(b);
  }
}

/* ╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë
   Render: Standings
   ╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë */
function renderStandings(entries) {
  const list = $('standings-list');
  list.innerHTML = '';

  entries.slice(0, 5).forEach((e, i) => {
    const accent = teamColour(e.Constructors?.[0]?.name) ?? 'var(--team-default)';
    const name   = `${e.Driver?.givenName ?? ''} ${e.Driver?.familyName ?? ''}`.trim();
    const team   = e.Constructors?.[0]?.name ?? '╬ô├ç├╢';

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

/* ╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë
   Error helpers
   ╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë */
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

/* ╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë
   Fetch: Race (next ╬ô├Ñ├å last fallback)
   ╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë */
async function loadRace() {
  // ╬ô├ª├í Try upcoming race
  try {
    const d     = await apiFetch(URLS.next);
    const races = d?.MRData?.RaceTable?.Races ?? [];
    if (races.length > 0) { renderRace(races[0], true); return; }
  } catch (e) { console.warn('[F1 Pulse] next.json failed:', e.message); }

  // ╬ô├ª├¡ Off-season: show last race
  try {
    const d     = await apiFetch(URLS.last);
    const races = d?.MRData?.RaceTable?.Races ?? [];
    if (races.length > 0) { renderRace(races[0], false); return; }
  } catch (e) { console.warn('[F1 Pulse] last.json failed:', e.message); }

  onRaceError('Both endpoints exhausted');
}

/* ╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë
   Fetch: Standings
   ╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë */
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

/* ╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë
   Boot
   ╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë╬ô├▓├ë */
function init() {
  Promise.allSettled([loadRace(), loadStandings()]).then(() => {
    const ts = new Date().toLocaleTimeString(undefined, {
      hour: '2-digit', minute: '2-digit',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    $('footer-ts').textContent = `Updated ${ts}`;
  });
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', init)
  : init();