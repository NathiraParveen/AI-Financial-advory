# 🚀 Investment Advisor - ONE Click Setup

## ⚡ Literally 2 Steps

### Step 1: Double-Click `setup.bat`
Just wait ~2 minutes. That's it.

### Step 2: Double-Click `start-servers.bat`
Open browser to: http://localhost:3000 ✓

---

## 🎯 That's All!

No PostgreSQL. No SQL. No configuration. Just Node.js (which you probably already have).

---

## 📍 Where to Find Scripts

Project folder: `bmm\_bmad\bmm\4-implementation\investment-advisor\`

```
investment-advisor/
├── setup.bat              ← Double-click first
├── start-servers.bat      ← Double-click second  
├── setup.ps1              ← (PowerShell option)
├── start-servers.ps1      ← (PowerShell option)
└── ...rest of project
```

---

## 🔧 What's Different?

| Before | Now |
|--------|-----|
| Need PostgreSQL ❌ | SQLite (built-in) ✅ |
| Complex setup ❌ | 2 clicks ✅ |
| 10 minutes ❌ | 2 minutes ✅ |
| Edit configs ❌ | Automatic ✅ |

**SQLite** is a file-based database. No server, no installation, no passwords. Perfect for development!

---

## ✅ Verify It Works

When servers are running, you'll see:

**Backend (PowerShell window 1):**
```
🚀 Investment Advisor API running on port 5000
```

**Frontend (PowerShell window 2):**
```
➜ Local: http://localhost:3000/
```

Then open http://localhost:3000 ✓

---

## 🚨 If It Fails

### "Node.js not found"
- Download & install from https://nodejs.org
- Restart command prompt/PowerShell

### "npm is not recognized"
- Restart your terminal
- Or run: `setup.bat` from PowerShell as Administrator

### Port 5000 already in use
- Edit `backend\.env.local`
- Change `PORT=5000` to `PORT=5001`
- Run scripts again

---

## 💾 Your Database

- **Location**: `backend/dev.db`
- **Size**: Tiny (~100KB initially)
- **Backup**: Just copy the file

---

## 🎉 You're Ready!

Just run those 2 batch files. No installation required!

