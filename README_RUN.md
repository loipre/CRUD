Run instructions (Windows PowerShell)

This repository contains a FastAPI backend (in `backend/`) and a React frontend (in `frontend/`).

Quick steps:

1) Backend
- Copy `backend/.env.example` to `backend/.env` and fill the values (MONGO_URL, DB_NAME, SECRET_KEY). Example:
  MONGO_URL=mongodb://localhost:27017
  DB_NAME=crud_db
  SECRET_KEY=replace_with_secure_value
  CORS_ORIGINS=http://localhost:3000

- From PowerShell:
  cd C:\Users\Loipre\OneDrive\Documentos\CRUD\backend
  ./start-backend.ps1

This will create a virtual env, install requirements, and run the backend at http://localhost:5000 (unless you change the port).

2) Frontend
- Copy `frontend/.env.example` to `frontend/.env` and adjust `REACT_APP_BACKEND_URL` if needed (default: http://localhost:5000)

- From PowerShell:
  cd C:\Users\Loipre\OneDrive\Documentos\CRUD\frontend
  ./start-frontend.ps1

This will install dependencies (if needed) and run the frontend (usually at http://localhost:3000).

3) Notes
- The backend expects MongoDB running and accessible by MONGO_URL. If you don't have MongoDB, install it or use a cloud provider and set MONGO_URL accordingly.
- If CORS errors happen, update CORS_ORIGINS in backend `.env`.
- To quickly create an admin + sample invite, call the init endpoint once (be careful in production):
  POST http://localhost:5000/api/init-admin

If you'd like, I can also:
- Add scripts to the root `package.json` to run both frontend and backend concurrently.
- Create a Docker Compose file for local development.
- Run any of these scripts here if you want me to attempt running them (I cannot execute them on your machine, but I can prepare everything).
