# Crossing & Switch Replacement / Reconditioning History (MongoDB)

## Local chalana
1. `.env.example` ko `.env` naam se copy karke `MONGODB_URI` bhariye.
2. `npm install` phir `npm start`
3. Browser: http://localhost:3000

## Vercel par deploy
Vercel par local MongoDB nahi chalta. **MongoDB Atlas** (free cluster) chahiye.
1. Atlas me cluster banaiye, Database User banaiye, aur Network Access me `0.0.0.0/0` allow kijiye (Vercel ke IP badalte rehte hain).
2. Folder ko GitHub par daaliye, ya Vercel CLI se: `npm i -g vercel` -> `vercel` -> `vercel --prod`
3. Vercel Project -> Settings -> Environment Variables me daaliye:
   - `MONGODB_URI` (Atlas ka connection string)
   - `DB_NAME` = track_history
   - `API_KEY` = koi lamba random text (zaroori)
4. Deploy ke baad site kholiye, upar **Server** button se wahi `API_KEY` daaliye (URL khaali chhodiye).
5. Jaanch: `https://<aapki-site>.vercel.app/api/health` par `{"ok":true,"db":true}` aana chahiye.

## Files
- `public/index.html` : app
- `app.js` : API (MongoDB <-> app)
- `server.js` : local server | `api/index.js` : Vercel entry | `vercel.json` : Vercel config
- `standalone-no-db/` : bina database wala purana single-file version
