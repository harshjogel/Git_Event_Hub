# Git Club Event Hub

A full-stack campus event management application built with **React (Frontend)** and a beginner-friendly **Node.js + Express + SQLite (Backend)**.

---

## Project Structure

```text
Git-Club-Event-Hub/
├── package.json          # Root scripts to run frontend & backend together
├── backend/
│   ├── server.js         # Express server & REST API endpoints
│   ├── database.js       # SQLite connection, schema & auto-seeding
│   ├── package.json      # Backend dependencies & scripts
│   ├── .env              # Environment configuration (PORT=5000)
│   └── database.sqlite   # Persistent SQLite database file
└── frontend/
    ├── src/
    │   ├── lib/api.ts    # Frontend API client service
    │   ├── pages/        # Home, EventDetails, NotFound
    │   ├── components/   # EventCard, EventVisual, SiteHeader, etc.
    │   └── data/         # Fallback types and category metadata
    ├── package.json      # Frontend dependencies & scripts
    ├── vite.config.ts    # Vite bundler configuration (port 3000)
    └── index.html        # HTML entry point
```

---

## Quick Start (Run Together)

### 1. Run with a single command (from project root)

```bash
# Start both backend (port 5000) and frontend (port 3000) concurrently:
npm start
```
or:
```bash
npm run dev
```

### 2. Access the Application

- **Frontend Website**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Events API Endpoint**: [http://localhost:5000/api/events](http://localhost:5000/api/events)

---

## Running Separately (Optional)

### Run Backend Only
```bash
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:5000` with automatic SQLite initialization and event seeding.*

### Run Frontend Only
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000` and connects to `http://localhost:5000/api`.*

---

## SQLite Database Schema

### `events` Table
| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PRIMARY KEY AUTOINCREMENT | Unique event identifier |
| `name` | TEXT NOT NULL | Event title |
| `category` | TEXT NOT NULL | Workshop, Competition, Hackathon, Community, Social |
| `date` | TEXT NOT NULL | Formatted event date |
| `time` | TEXT NOT NULL | Event time slot |
| `venue` | TEXT NOT NULL | Location on campus |
| `description` | TEXT | Brief overview |
| `full_description` | TEXT | Detailed description / about section |
| `image` | TEXT | Optional image URL |
| `capacity` | INTEGER | Maximum participant capacity |
| `organizer` | TEXT | Organizing body ('Git Club') |
| `is_past` | INTEGER | `0` for upcoming, `1` for past |
| `learn` | TEXT | JSON array of learning takeaways |
| `schedule` | TEXT | JSON array of event timeline items |

### `registrations` Table
| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PRIMARY KEY AUTOINCREMENT | Unique registration record ID |
| `event_id` | INTEGER NOT NULL | Foreign key referencing `events(id)` |
| `name` | TEXT NOT NULL | Student's full name |
| `email` | TEXT NOT NULL | Student's email |
| `college` | TEXT | College / University (e.g. 'CHARUSAT') |
| `created_at` | DATETIME | Registration timestamp |

---

## REST API Endpoints

| Method | Endpoint | Description | Query / Body |
|---|---|---|---|
| `GET` | `/api/events` | List all events | Query: `?category=Workshop&search=Git&past=true` |
| `GET` | `/api/events/:id` | Get single event details | `:id` can be numeric ID or slug |
| `GET` | `/api/events/:id/registrations/count` | Get total registrations | Returns `{ event_id, count }` |
| `POST` | `/api/registrations` | Register a student for an event | `{ event_id, name, email, college }` |

### Registration Validation Rules:
1. **Name**: Required (non-empty string).
2. **Email**: Required and must match valid email format (`name@domain.com`).
3. **Event**: Event must exist and not be a past event.
4. **Duplicate Prevention**: Rejects duplicate registrations for the same email address on the same event with an informative error message.

---

## Viva & Demonstration Notes (For CSE Presentation)

1. **Architecture**: Client-Server architecture. The React frontend interacts with the Express REST API via asynchronous HTTP `fetch()` requests.
2. **CORS (Cross-Origin Resource Sharing)**: Enabled on Express using `cors()` so the frontend running on port 3000 can communicate with the backend on port 5000 during development.
3. **Database Persistence**: SQLite stores all events and registrations in a local file (`backend/database.sqlite`). Data persists across server restarts.
4. **Auto-seeding**: When the backend starts for the first time, it automatically creates the tables and seeds 10 realistic Git Club events (6 upcoming, 4 past).
