# SreakMater

SreakMater is an animated avatar habit tracker built with the MERN stack.

## Run locally

```powershell
npm install
npm run dev
```

The React app runs on `http://127.0.0.1:5173` and the API runs on `http://127.0.0.1:5000`.

## MongoDB

Create `server/.env` if you want to use a real MongoDB database:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/sreakmater
PORT=5000
```

If MongoDB is not available, the server automatically falls back to in-memory demo data so the app still works.
