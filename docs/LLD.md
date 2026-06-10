# DermTrack - Low Level Design

## Database Tables

### users

id (uuid)
email
password_hash
name
created_at

---

### skin_entries

id (uuid)
user_id (fk)
cloudinary_url
severity_score
confidence_score
condition_type
taken_at
created_at

---

### treatment_logs

id (uuid)
user_id (fk)
log_date
face_wash
medicines
sleep_hours
water_litres
stress_level
notes

---

### insights

id (uuid)
user_id (fk)
insight_type
narrative
generated_at

---

### ml_jobs

id (uuid)
entry_id (fk)
status
score
confidence
created_at
completed_at
