# SreakMater Code Structure

This MERN project is split into a React frontend and an Express/MongoDB backend.

## Frontend Code

Frontend folder:

```text
client/
```

Important frontend files:

```text
client/index.html
client/src/main.jsx
client/src/styles.css
client/package.json
```

What they do:

- `client/src/main.jsx` contains the React app, navigation pages, login/register UI, habit dashboard, calendar events, avatar picker, admin accounts view, and blast celebration effect.
- `client/src/styles.css` contains all frontend styling for the dashboard, sidebar, forms, calendar, settings, account page, and animations.
- `client/index.html` is the Vite HTML entry file.
- `client/package.json` contains frontend scripts and dependencies.

Frontend run command:

```powershell
npm run client
```

Frontend URL:

```text
http://127.0.0.1:5173
```

## Backend Code

Backend folder:

```text
server/
```

Important backend files:

```text
server/src/index.js
server/package.json
```

What they do:

- `server/src/index.js` contains the Express API, MongoDB/Mongoose models, in-memory fallback store, habit routes, auth routes, admin account routes, password hashing, and account-scoped habit logic.
- `server/package.json` contains backend scripts and dependencies.

Backend run command:

```powershell
npm run server
```

Backend URL:

```text
http://127.0.0.1:5000
```

Backend health check:

```text
http://127.0.0.1:5000/api/health
```

## Full Project Commands

Install dependencies:

```powershell
npm install
```

Run frontend and backend together:

```powershell
npm run dev
```

Build frontend:

```powershell
npm run build
```

## Default Admin Login

```text
Username: admin
Password: admin123
```

## Project Root

```text
C:\Users\Kruthik\Documents\Codex\2026-05-01\build-a-animated-with-avathar-habit
```
