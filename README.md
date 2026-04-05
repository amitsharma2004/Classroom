# Joineazy — Assignment Management System (Round 2)

A full-stack assignment management platform built with React + Tailwind CSS (frontend) and Node.js + Express + MongoDB (backend), featuring JWT authentication, role-based dashboards, and group assignment logic.

---

## 🎨 UI/UX Design Choices

- **Indigo/Purple gradient theme** — professional, modern academic aesthetic
- **Framer Motion animations** — subtle scale/fade transitions on cards and badges for polished feel
- **Role-based dashboards** — students and professors see completely different, context-appropriate views
- **Progress bars + badges** — visual submission status at a glance (pending → submitted → acknowledged)
- **Responsive grid** — 1 col (mobile) → 2 col (tablet) → 3 col (desktop) using Tailwind breakpoints
- **Loader animations** — every async operation shows loading state to eliminate jarring UX

---

## 🏗️ Architecture

```
joineazy/
├── backend/              # Node.js + Express + MongoDB REST API
│   ├── src/
│   │   ├── models/       # Mongoose schemas (User, Course, Assignment, Submission, Group)
│   │   ├── middleware/   # JWT protect() + authorize() middleware
│   │   ├── routes/       # auth, courses, assignments, submissions, groups
│   │   ├── app.js        # Express setup, CORS, routes
│   │   ├── server.js     # MongoDB connect + listen
│   │   └── seed.js       # Demo data seeder
│   └── package.json
│
└── frontend/             # React + Vite + Tailwind CSS SPA
    ├── src/
    │   ├── api/          # Axios instance with JWT interceptor
    │   ├── context/      # AuthContext (login/logout/register + JWT persistence)
    │   ├── components/   # ProtectedRoute, Navbar, CourseCard, Badge, ProgressBar, Loader
    │   └── pages/        # Login, Register, StudentDashboard, ProfessorDashboard, AssignmentPage
    └── package.json
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Docker (optional, for quick MongoDB setup)

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MONGO_URI and JWT_SECRET
npm install
npm start
```

### Frontend

```bash
cd frontend
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:5000/api
npm install
npm run dev
```

### Seed Demo Data

```bash
cd backend
node src/seed.js
```

**Demo Credentials:**
| Role | Email | Password |
|------|-------|----------|
| Professor | professor@demo.com | demo1234 |
| Student 1 | student@demo.com | demo1234 |
| Student 2 | student2@demo.com | demo1234 |

---

## 🔑 Key Features

### Authentication
- JWT-based login/register with role selection (student/professor)
- Tokens stored in localStorage, attached to all API requests via Axios interceptor
- Expired token → auto-redirect to login

### Student Dashboard
- View all enrolled courses in a responsive card grid
- Click course to view assignments
- Submit individual/group assignments
- Acknowledge submissions (group leader acknowledges for entire group)
- Progress bars showing submission completion

### Professor Dashboard
- View taught courses with analytics (student count, submission stats)
- Create/Edit/Delete assignments
- Filter student submissions by status (All / Pending / Submitted / Acknowledged)
- Monitor class-wide progress

### Group Assignments
- Students can create or join groups for group assignments
- Only the group leader can acknowledge — `updateMany` propagates to all group members atomically

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login + JWT |
| GET | `/api/auth/me` | JWT | Current user |
| GET | `/api/courses` | JWT | Courses (role-aware) |
| POST | `/api/courses` | Professor | Create course |
| POST | `/api/courses/:id/enroll` | Student | Enroll in course |
| GET | `/api/assignments/course/:courseId` | JWT | List assignments |
| POST | `/api/assignments` | Professor | Create assignment |
| PUT | `/api/assignments/:id` | Professor | Edit assignment |
| DELETE | `/api/assignments/:id` | Professor | Delete assignment |
| GET | `/api/assignments/:id/submissions` | Professor | View submissions |
| POST | `/api/submissions` | Student | Submit assignment |
| PATCH | `/api/submissions/:id/acknowledge` | Student | Individual acknowledge |
| PATCH | `/api/submissions/group-acknowledge` | Student Leader | Group acknowledge |
| POST | `/api/groups` | Student | Create group |
| POST | `/api/groups/:id/join` | Student | Join group |

---

## 🗄️ Database Schema

**Users** — `name, email, password (bcrypt), role, enrolledCourses[], taughtCourses[]`

**Courses** — `title, description, professorId, studentIds[], assignmentIds[]`

**Assignments** — `title, description, deadline, submissionType (individual|group), courseId, createdBy`

**Submissions** — `assignmentId, studentId, groupId, content, status (pending|submitted|acknowledged), acknowledged, submittedAt`

**Groups** — `assignmentId, leaderId, memberIds[], name`

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS v3 |
| Animations | Framer Motion |
| HTTP Client | Axios |
| Routing | React Router v6 |
| Notifications | react-hot-toast |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JSON Web Tokens (JWT) + bcryptjs |
| Deployment | Docker (MongoDB), serve (frontend) |