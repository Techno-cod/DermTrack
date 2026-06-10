# DermTrack - High Level Design

## Architecture Overview

```text
                ┌───────────────┐
                │ React Frontend│
                │ (Vercel)      │
                └───────┬───────┘
                        │
                        ▼
                ┌───────────────┐
                │ Node.js API   │
                │ Express       │
                └───┬─────┬─────┘
                    │     │
                    │     │
                    ▼     ▼
            ┌──────────┐  ┌──────────┐
            │Supabase  │  │Cloudinary│
            │Postgres  │  │Images    │
            └──────────┘  └──────────┘
                    │
                    │
                    ▼
            ┌──────────────┐
            │ FastAPI ML   │
            │ EfficientNet │
            └──────────────┘
```

---

## Frontend Responsibilities

- Authentication
- Upload photo
- Timeline view
- Dashboard
- Progress charts
- Treatment journal
- Insights page

---

## Backend Responsibilities

- JWT authentication
- User management
- CRUD APIs
- Cloudinary integration
- ML service communication
- Data aggregation

---

## ML Service Responsibilities

- Receive image URL
- Download image
- Run EfficientNet inference
- Return severity score
- Return confidence score

---

## Database Responsibilities

Users
Skin Entries
Treatment Logs
ML Jobs
Insights

---

## External Services

Cloudinary:
- Image storage

Supabase:
- PostgreSQL database

GitHub Actions:
- CI/CD

AWS EC2:
- Backend deployment

Vercel:
- Frontend deployment