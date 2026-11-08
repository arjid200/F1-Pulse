/**
 * F1 Pulse — app.js v4.2
 *
 * FIXED: Auto-detect user timezone with bulletproof IST (Indian Standard Time) support
 * FIXED: Session times normalized to UTC before localized conversion
 * FIXED: Header layout alignment & live status indicators
 * FIXED: Strict XSS sanitization & clean UTF-8 encoding
 * USES:  api.jolpi.ca (Ergast-compatible, free, no-auth)
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
  'mercedes':        '#27F4D2',
  'red bull':        '#3671C6',
  'ferrari':         '#E80020',
  'mclaren':         '#FF8000',
  'aston martin':    '#229971',
  'alpine':          '#FF87BC',
  'williams':        '#64C4FF',
  'haas':            '#B6BABD',
  'kick sauber':     '#52E252',
  'sauber':          '#52E252',
  'alfa romeo':      '#52E252',
  'rb':              '#6692FF',
  'alphatauri':      '#6692FF',
  'racing bulls':    '#6692FF',
  'visa cash app rb':'#6692FF',
  'cadillac':        '#CC0000',
};

function teamColour(name) {
  if (!name) return null;
  const lc = String(name).toLowerCase();
  for (const [k, v] of Object.entries(TEAM_COLOURS)) {
    if (lc.includes(k)) return v;
  }
  return null;
}

/* ═══════════════════════════════════════════
   Utility & DOM
   ═══════════════════════════════════════════ */
const $   = id => document.getElementById(id);
const pad = n  => String(n).padStart(2, '0');

const show = el => el && el.classList.remove('hidden');
const hide = el => el && el.classList.add('hidden');

function escHTML(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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

/* ═══════════════════════════════════════════
   Timezone & Localization Engine
   ═══════════════════════════════════════════ */

/**
 * Detects the user's timezone reliably.
 * Accurately maps Indian Standard Time (IST, UTC+05:30).
 */
function getUserTimeZone() {
  try {
    const resolved = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (resolved && resolved !== 'UTC') return resolved;
  } catch {}
  // Check timezone offset (-330 minutes = UTC+05:30)
  const offset = new Date().getTimezoneOffset();
  if (offset === -330) return 'Asia/Kolkata';
  return 'UTC';
}

const USER_TZ = getUserTimeZone();

/**
 * Returns a human-friendly timezone code (e.g., "IST", "EST", "BST", "JST").
 */
function getTimeZoneCode(date, tz) {
  // Guarantee IST display for India
  if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta' || new Date().getTimezoneOffset() === -330) {
    return 'IST';
  }
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'short',
    }).formatToParts(date);
    const p = parts.find(x => x.type === 'timeZoneName');
    if (p && p.value) {
      if (/GMT\+5:30/i.test(p.value)) return 'IST';
      return p.value;
    }
  } catch {}
  return tz || 'UTC';
}

/**
 * Ensures date and time strings from Ergast/Jolpica are parsed as true UTC.
 */
function normalizeToUTC(dateStr, timeStr) {
  if (!dateStr) return null;
  if (!timeStr) return `${dateStr}T00:00:00Z`;
  const cleanTime = timeStr.trim();
  if (/Z|[+-]\d{2}:\d{2}$/i.test(cleanTime)) {
    return `${dateStr}T${cleanTime}`;
  }
  return `${dateStr}T${cleanTime}Z`;
}

/**
 * Formats session date and time: e.g. "Sun, 22 Nov · 09:30 AM IST"
 */
function formatSessionDateTime(isoStr) {
  if (!isoStr) return 'Time TBC';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return 'Time TBC';

  const tzCode = getTimeZoneCode(d, USER_TZ);

  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: USER_TZ }).format(d);
  const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric', timeZone: USER_TZ }).format(d);
  const month = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: USER_TZ }).format(d);

  const timeStr = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: USER_TZ,
  }).format(d);

  return `${weekday}, ${day} ${month} · ${timeStr} ${tzCode}`;
}

/**
 * Formats date for countdown status: e.g. "Sunday, 22 November 2026"
 */
function formatLongDate(isoStr) {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: USER_TZ,
  });
}

/* ═══════════════════════════════════════════
   Sync Status Manager
   ═══════════════════════════════════════════ */
function setSyncStatus(state, labelText) {
  const dot   = $('sync-dot');
  const label = $('sync-label');
  if (!dot || !label) return;

  dot.className = 'sync-dot';
  if (state === 'connecting') {
    dot.classList.add('connecting');
    label.textContent = labelText ?? 'SYNCING…';
  } else if (state === 'synced') {
    dot.classList.add('synced');
    label.textContent = labelText ?? 'SYNCED';
  } else if (state === 'live') {
    dot.classList.add('live');
    label.textContent = labelText ?? 'RACE LIVE';
  } else if (state === 'offline') {
    dot.classList.add('offline');
    label.textContent = labelText ?? 'OFFLINE';
  }
}

/* ═══════════════════════════════════════════
   Countdown Engine
   ═══════════════════════════════════════════ */
let _cdInt = null;

function startCountdown(raceISO) {
  if (_cdInt) {
    clearInterval(_cdInt);
    _cdInt = null;
  }

  const target = new Date(raceISO).getTime();
  const grid   = $('countdown-grid');
  const loader = $('cd-skeleton');
  const live   = $('race-live');
  const local  = $('cd-local-time');
  const secsEl = $('cd-secs');

  hide(loader);

  function tick() {
    const now = Date.now();
    const diff = target - now;

    // Race has started (lasts ~2 hours)
    if (diff <= 0) {
      const raceFinished = diff < -2 * 60 * 60 * 1000;
      clearInterval(_cdInt);
      _cdInt = null;
      hide(grid);
      hide(local);

      if (!raceFinished) {
        live.innerHTML = `<span>🏁</span><span>RACE IN PROGRESS</span><span>🏁</span>`;
        setSyncStatus('live', 'RACE LIVE');
      } else {
        live.innerHTML = `<span>🏁</span><span>RACE CONCLUDED</span><span>🏁</span>`;
        setSyncStatus('synced', 'COMPLETED');
      }
      show(live);
      return;
    }

    const s = Math.floor(diff / 1000);
    $('cd-days').textContent  = pad(Math.floor(s / 86400));
    $('cd-hours').textContent = pad(Math.floor((s % 86400) / 3600));
    $('cd-mins').textContent  = pad(Math.floor((s % 3600) / 60));
    secsEl.textContent        = pad(s % 60);

    show(grid);
  }

  tick();
  _cdInt = setInterval(tick, 1000);
}

/* ═══════════════════════════════════════════
   Weekend Schedule Builder
   ═══════════════════════════════════════════ */
function buildSessionRows(race) {
  const sessionDefs = [
    { key: 'FirstPractice',    label: 'FP1', durationHr: 1.0 },
    { key: 'SecondPractice',   label: 'FP2', durationHr: 1.0 },
    { key: 'ThirdPractice',    label: 'FP3', durationHr: 1.0 },
    { key: 'SprintQualifying', label: 'Sprint Quali', durationHr: 0.75 },
    { key: 'Sprint',           label: 'Sprint', durationHr: 1.0 },
    { key: 'Qualifying',       label: 'Qualifying', durationHr: 1.25 },
    { key: null,               label: 'Grand Prix', date: race.date, time: race.time, durationHr: 2.0 },
  ];

  const now = Date.now();
  const sessionList = [];
  let anyLive = false;

  sessionDefs.forEach(({ key, label, date: d, time: t, durationHr }) => {
    const src  = key ? race[key] : null;
    const date = src?.date ?? d;
    const time = src?.time ?? t;
    if (!date) return;

    const iso = normalizeToUTC(date, time);
    const startMs = new Date(iso).getTime();
    const endMs = startMs + durationHr * 3600 * 1000;
    const isPast = now > endMs;
    const isLive = now >= startMs && now <= endMs;
    const isRace = label === 'Grand Prix';

    if (isLive) anyLive = true;

    sessionList.push({
      label,
      iso,
      startMs,
      isRace,
      isPast,
      isLive,
      localStr: formatSessionDateTime(iso),
    });
  });

  // Sort sessions chronologically
  sessionList.sort((a, b) => a.startMs - b.startMs);

  let html = '';
  sessionList.forEach(s => {
    let rowClass = 'session-row';
    if (s.isRace) rowClass += ' session-row--race';
    if (s.isPast) rowClass += ' session-row--past';
    if (s.isLive) rowClass += ' session-row--live';

    const liveBadge = s.isLive ? '<span class="session-live-pill">LIVE NOW</span>' : '';

    html += `
      <div class="${rowClass}">
        <div class="session-info">
          <span class="session-label">${escHTML(s.label)}</span>
          ${liveBadge}
        </div>
        <span class="session-time">${escHTML(s.localStr)}</span>
      </div>`;
  });

  return { html, anyLive };
}

/* ═══════════════════════════════════════════
   Render: Race Card
   ═══════════════════════════════════════════ */
function renderRace(race, isNext) {
  const raceISO = normalizeToUTC(race.date, race.time);

  // Header Circuit Info
  $('hdr-country').textContent = race.Circuit?.Location?.country ?? '—';
  $('hdr-circuit').textContent = race.Circuit?.circuitName       ?? '—';

  // Race Card Meta
  $('race-label').textContent   = isNext ? 'NEXT RACE' : 'LAST RACE';
  $('race-round').textContent   = `RD ${pad(race.round ?? 0)}`;
  $('race-name').textContent    = (race.raceName ?? '—').toUpperCase();
  $('chip-circuit').textContent = race.Circuit?.circuitName ?? '—';
  $('chip-country').textContent = race.Circuit?.Location?.country ?? '—';

  // Weekend session schedule
  const schedEl = $('session-schedule');
  const { html, anyLive } = buildSessionRows(race);
  if (schedEl) schedEl.innerHTML = html;

  hide($('race-skeleton'));
  show($('race-content'));

  // Countdown & Timezone Details
  $('cd-local-text').textContent = formatSessionDateTime(raceISO);
  $('cd-status').textContent     = formatLongDate(raceISO);

  // Timezone indicator badge
  const tzBadge = $('tz-badge');
  if (tzBadge) {
    const tzCode = getTimeZoneCode(new Date(raceISO), USER_TZ);
    tzBadge.textContent = tzCode;
    tzBadge.title = `Auto-detected timezone: ${USER_TZ}`;
  }

  // Update Header Sync Status
  const season = race.season ?? '2026';
  if (anyLive) {
    setSyncStatus('live', 'SESSION LIVE');
  } else {
    setSyncStatus('synced', `${season} · SYNCED`);
  }

  if (isNext) {
    startCountdown(raceISO);
    show($('cd-local-time'));
  } else {
    hide($('cd-skeleton'));
    hide($('countdown-grid'));
    hide($('cd-local-time'));
    const b = $('race-live');
    b.innerHTML = `<span>🏁</span><span>SEASON CONCLUDED — ${escHTML(race.season ?? '')}</span><span>🏁</span>`;
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
    li.setAttribute('data-pos', escHTML(e.position));
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
   Error Handlers
   ═══════════════════════════════════════════ */
function onRaceError(msg) {
  console.error('[F1 Pulse] Race fetch failed:', msg);
  hide($('race-skeleton'));
  hide($('cd-skeleton'));
  show($('race-error'));
  setSyncStatus('offline', 'OFFLINE');
}

function onStandingsError(msg) {
  console.error('[F1 Pulse] Standings fetch failed:', msg);
  hide($('standings-skeleton'));
  show($('standings-error'));
}

/* ═══════════════════════════════════════════
   Fetch: Race (next → fallback to last)
   ═══════════════════════════════════════════ */
async function loadRace() {
  setSyncStatus('connecting', 'SYNCING…');

  // Try upcoming race
  try {
    const d     = await apiFetch(URLS.next);
    const races = d?.MRData?.RaceTable?.Races ?? [];
    if (races.length > 0) {
      renderRace(races[0], true);
      return;
    }
  } catch (e) {
    console.warn('[F1 Pulse] next.json failed:', e.message);
  }

  // Off-season fallback: show last race
  try {
    const d     = await apiFetch(URLS.last);
    const races = d?.MRData?.RaceTable?.Races ?? [];
    if (races.length > 0) {
      renderRace(races[0], false);
      return;
    }
  } catch (e) {
    console.warn('[F1 Pulse] last.json failed:', e.message);
  }

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
    const tzCode = getTimeZoneCode(new Date(), USER_TZ);
    const ts = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: USER_TZ,
    }).format(new Date());

    const footerTs = $('footer-ts');
    if (footerTs) {
      footerTs.textContent = `Updated ${ts} ${tzCode}`;
      footerTs.title = `Your timezone: ${USER_TZ}`;
    }
  });
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', init)
  : init();
