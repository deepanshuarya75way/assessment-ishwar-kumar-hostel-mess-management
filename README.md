# HostelMess - Smart Hostel & Mess Management System

MERN stack project with role-based access for **Warden**, **Mess Admin** and **Student**.

## Tech Stack
- MongoDB + Mongoose (data models)
- Express.js + Node.js (modular REST APIs)
- React (Vite) + React Router
- JWT authentication + bcrypt password hashing
- Recharts (dashboard charts)

## Features
**Warden:** dashboard with charts (room occupancy, complaints by status), add/view students, add rooms and allocate students, manage complaints

**Mess Admin:** dashboard with charts (today's meals, last 7 days), set weekly menu, mark meal attendance

**Student:** dashboard, view mess menu, view own attendance, raise complaints

## Folder Structure
```
backend/
  models.js       User, Room, Menu, Attendance, Complaint (Mongoose models)
  middleware.js   protect (JWT check), authorize (role check)
  routes/
    common.js     login, menu, complaints (shared by roles)
    warden.js     warden APIs
    mess.js       mess admin APIs
    student.js    student APIs
  server.js, seed.js
frontend/
  src/
    auth.jsx      API helper + login state (context)
    App.jsx       Login page, sidebar layout, routes
    Warden.jsx    warden pages
    Mess.jsx      mess admin pages
    Student.jsx   student pages
```

## How to Run

### 1. Backend
```
cd backend
npm install
```
Copy `.env.example` to `.env` and set your values (MongoDB must be running):
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hostel_mess
JWT_SECRET=any_random_string
```
Create the first Warden and Mess Admin accounts, then start the server:
```
npm run seed
npm run dev
```

### 2. Frontend
```
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

## Login (created by `npm run seed`)
| Role | Email | Password |
|------|-------|----------|
| Warden | warden@hostel.com | 123456 |
| Mess Admin | mess@hostel.com | 123456 |

Students are added by the Warden from the **Students** page.

## API Overview
| Route | Access |
|-------|--------|
| POST /api/auth/login | public |
| /api/warden/* | warden |
| /api/mess/* | mess admin |
| /api/student/* | student |
| GET /api/menu | any logged-in user |
| POST /api/menu | mess admin |
| /api/complaints | student (create, view own), warden (view all, update status) |
