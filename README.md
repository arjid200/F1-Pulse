# 🏎️ F1 Pulse

> A sleek Formula 1 dashboard — live race countdown, championship standings, and full weekend schedule. Built with vanilla HTML/CSS/JS, packaged as a native Android APK via Capacitor.

![F1 Pulse Banner](https://img.shields.io/badge/Formula%201-2026%20Season-E10600?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0yMSAzSDNjLTEuMSAwLTIgLjktMiAydjE0YzAgMS4xLjkgMiAyIDJoMThjMS4xIDAgMi0uOSAyLTJWNWMwLTEuMS0uOS0yLTItMnoiLz48L3N2Zz4=)
![GitHub Actions](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)
![Android](https://img.shields.io/badge/Android-APK-3DDC84?style=for-the-badge&logo=android&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🏁 **Next Race Card** | Grand Prix name, circuit, country — updated live |
| ⏱ **Lights-Out Countdown** | Real-time `DD : HH : MM : SS` timer to race start |
| 📅 **Weekend Schedule** | FP1 / FP2 / FP3 / Qualifying / Race in your local timezone |
| 🏆 **Driver Standings** | Top 5 championship standings with team colour accents |
| 🌑 **OLED Dark UI** | Glassmorphic cards, ambient glows, shimmer skeletons |
| 📱 **Native Android APK** | Packaged via Capacitor — no Play Store needed |

---

## 📸 Tech Stack

- **Frontend:** Vanilla HTML5 · CSS3 (Glassmorphism) · JavaScript (ES2022)
- **Fonts:** Syne · JetBrains Mono · Inter (Google Fonts)
- **Data:** [Jolpica F1 API](https://api.jolpi.ca) — free, no key required
- **Packaging:** [Capacitor](https://capacitorjs.com) → Android WebView APK
- **CI/CD:** GitHub Actions — builds & uploads APK automatically on every push

---

## 🗂️ Project Structure

```
f1-pulse/
├── .github/
│   └── workflows/
│       └── build-apk.yml     ← GitHub Actions: auto-builds the APK
├── www/
│   ├── index.html            ← App shell & DOM layout
│   ├── style.css             ← Dark glassmorphic design system
│   └── app.js                ← API fetching, countdown, standings
├── capacitor.config.json     ← Capacitor config (appId, webDir)
├── package.json              ← @capacitor/core + @capacitor/android
└── .gitignore
```

---

## 🚀 Getting the APK

### Option A — GitHub Actions (recommended, no setup needed)

1. **Fork or push** this repo to your GitHub account
2. Go to the **Actions** tab → **"Build F1 Pulse APK"**
3. Wait ~5–8 minutes for the build to complete ✅
4. Click the finished run → **Artifacts** → download `f1-pulse-debug-{n}.zip`
5. Unzip → install `app-debug.apk` on your Android device

### Option B — Build locally

**Prerequisites:** Node.js LTS · JDK 17 · Android SDK

```bash
# Install dependencies
npm install

# Set up Capacitor
npx cap init "F1 Pulse" "com.f1pulse.app" --web-dir www
npx cap add android
npx cap sync

# Build APK
cd android
./gradlew assembleDebug          # Linux/Mac
gradlew.bat assembleDebug        # Windows
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📡 API

All data is fetched from **[api.jolpi.ca](https://api.jolpi.ca)** (the Jolpica F1 API, an Ergast mirror) — completely free, no API key required.

| Endpoint | Data |
|----------|------|
| `/ergast/f1/current/next.json` | Next Grand Prix details + session schedule |
| `/ergast/f1/current/last.json` | Last race (off-season fallback) |
| `/ergast/f1/current/driverStandings.json` | Current championship standings |

---

## 📲 Installing the APK on Android

1. Transfer `app-debug.apk` to your phone (USB, Google Drive, WhatsApp, etc.)
2. Open the file on your phone
3. If prompted: **Settings → Install unknown apps → Allow**
4. Tap **Install**

---

## 🛠 Development

Preview instantly in any browser — no server needed:

```bash
# Just open the file directly:
www/index.html
```

Both API calls fire live from the browser. The Capacitor wrapper is only needed for the APK build.

---

## 📄 License

MIT — do whatever you want with it.

---

<p align="center">Built with ❤️ and too much caffeine · Data via <a href="https://jolpi.ca">Jolpica F1 API</a></p>
