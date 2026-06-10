# DermTrack — Product Requirements Document (PRD)

## 1. Product Vision

DermTrack is an AI-powered acne progress tracking platform that helps users monitor their skin health over time through photo uploads, severity scoring, treatment logging, and progress analytics.

The goal is not to diagnose skin diseases. The goal is to help users objectively track whether their acne is improving, worsening, or remaining stable.

---

## 2. Problem Statement

People dealing with acne often struggle to determine whether their treatment routine is actually working.

Most users rely on memory and subjective judgment, making it difficult to:

* Track progress consistently
* Compare skin condition over time
* Understand which treatments are helping
* Stay motivated during long treatment periods

DermTrack provides visual, measurable, and data-driven progress tracking.

---

## 3. Target Users

### Primary Users

* Teenagers and young adults with acne
* Individuals undergoing acne treatment
* Users wanting to monitor skin progress over weeks or months

### Secondary Users

* Dermatology patients
* Skincare enthusiasts
* Individuals testing different skincare routines

---

## 4. Core Features (V1)

### User Authentication

* User registration
* User login
* JWT authentication
* Protected routes

---

### Photo Upload & Timeline

Users can:

* Upload weekly facial photos
* Store photos securely
* View photos chronologically
* Track historical entries

---

### AI Severity Scoring

For every uploaded photo:

* Image is sent to ML service
* EfficientNet model generates severity score
* Score range: 0–100

Severity Scale:

* 0–20 → Minimal
* 21–40 → Mild
* 41–60 → Moderate
* 61–80 → Significant
* 81–100 → Severe

---

### Progress Dashboard

Dashboard displays:

* Current severity score
* Previous severity score
* Percentage improvement/decline
* Severity trend chart
* Before/After comparison

---

### Treatment Journal

Users can log:

* Face wash used
* Medicines
* Sleep hours
* Water intake
* Stress level
* Additional notes

---

### AI Insights

Examples:

* Severity improved by 18% over the last 3 weeks
* Average sleep increased during improvement period
* Water intake appears positively correlated with progress

Insights will initially be generated using rule-based analytics.

No LLMs in V1.

---

## 5. Non-Functional Requirements

### Performance

* Dashboard loads under 3 seconds
* Image upload under 10 seconds

### Security

* JWT authentication
* Password hashing using bcrypt
* HTTPS enabled
* User data isolation

### Scalability

Architecture should support future expansion to:

* Multiple skin conditions
* Mobile applications
* Advanced ML models

---

## 6. Tech Stack

### Frontend

* React
* Tailwind CSS
* React Router
* Axios
* Recharts

### Backend

* Node.js
* Express.js

### Database

* PostgreSQL (Supabase)

### Image Storage

* Cloudinary

### Machine Learning

* FastAPI
* EfficientNet

### Deployment

* AWS EC2
* Nginx
* SSL

### CI/CD

* GitHub Actions

---

## 7. Database Entities

### Users

Stores user account information.

### Skin Entries

Stores uploaded images and severity scores.

### Treatment Logs

Stores daily treatment data.

### ML Jobs

Tracks image analysis requests.

### Insights

Stores generated progress insights.

---

## 8. Future Scope (Not Included in V1)

* Multiple skin conditions
* Mobile application
* Dermatologist dashboard
* Personalized treatment recommendations
* Push notifications
* AI chatbot
* Advanced predictive analytics

---

## 9. Success Criteria

A user should be able to:

1. Create an account
2. Upload a skin photo
3. Receive an AI severity score
4. Track progress over time
5. Compare before/after results
6. Log treatments
7. View improvement insights

If all seven actions work successfully, DermTrack V1 is considered complete.
