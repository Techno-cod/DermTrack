const pool = require("../config/db");

// POST /api/journal — create or update today's log (upsert)
const saveLog = async (req, res) => {
  try {
    const {
      sleep_hours,
      water_litres,
      stress_level,
      mood,
      face_wash,
      medicines,
      custom_notes,
    } = req.body;

    // Convert empty strings to null so Postgres doesn't choke on integer fields
    const clean = (val) => (val === "" || val === undefined ? null : val);

    const result = await pool.query(
      `INSERT INTO treatment_logs
         (user_id, log_date, sleep_hours, water_litres, stress_level, mood, face_wash, medicines, custom_notes)
       VALUES ($1, CURRENT_DATE, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id, log_date)
       DO UPDATE SET
         sleep_hours  = EXCLUDED.sleep_hours,
         water_litres = EXCLUDED.water_litres,
         stress_level = EXCLUDED.stress_level,
         mood         = EXCLUDED.mood,
         face_wash    = EXCLUDED.face_wash,
         medicines    = EXCLUDED.medicines,
         custom_notes = EXCLUDED.custom_notes,
         updated_at   = NOW()
       RETURNING *`,
      [
        req.user.userId,
        clean(sleep_hours),
        clean(water_litres),
        clean(stress_level),
        clean(mood),
        clean(face_wash),
        clean(medicines),
        clean(custom_notes),
      ]
    );

    return res.status(201).json({ log: result.rows[0] });
  } catch (error) {
    console.error("Save log failed:", error.message);
    return res.status(500).json({ message: "Failed to save log" });
  }
};

// GET /api/journal/today — get today's log if it exists
const getTodayLog = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM treatment_logs
       WHERE user_id = $1 AND log_date = CURRENT_DATE`,
      [req.user.userId]
    );
    return res.json({ log: result.rows[0] || null });
  } catch (error) {
    console.error("Get today log failed:", error.message);
    return res.status(500).json({ message: "Failed to fetch today's log" });
  }
};
const getLogs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM treatment_logs WHERE user_id = $1 ORDER BY log_date DESC`,
      [req.user.userId]
    );
    return res.json({ logs: result.rows });
  } catch (error) {
    console.error("Get logs failed:", error.message);
    return res.status(500).json({ message: "Failed to fetch logs" });
  }
};

module.exports = { saveLog, getLogs, getTodayLog };