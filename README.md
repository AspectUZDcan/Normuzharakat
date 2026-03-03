# Aspect Mafia Game 🎭

Real-time multiplayer Mafia game built with React, Socket.io, and Express.

## Deploy to Railway

### 1. GitHub ga push qiling
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Railway.app da yangi loyiha oching
- [railway.app](https://railway.app) ga kiring
- "New Project" → "Deploy from GitHub repo"
- Reponi tanlang
- Railway avtomatik `npm install && npm run build` va `npm start` ishlatadi

### 3. Environment Variables (ixtiyoriy)
Railway dashboard → Variables bo'limida:
- `GEMINI_API_KEY` — faqat AI funksiyalar uchun kerak (asosiy o'yin uchun shart emas)

> ⚠️ `PORT` ni o'rnatmang — Railway uni avtomatik beradi!

## Local ishga tushirish
```bash
npm install
npm run dev
```

## Texnologiyalar
- **Frontend:** React 19, TypeScript, Tailwind CSS, Motion
- **Backend:** Express, Socket.io
- **Build:** Vite
