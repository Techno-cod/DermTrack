require("dotenv").config({ path: `${__dirname}/../../.env` });
const bcrypt = require("bcrypt");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ── Demo account ───────────────────────────────────────────────────
const DEMO_EMAIL    = "demo@dermtrack.app";
const DEMO_PASSWORD = "Demo1234!";
const DEMO_NAME     = "Demo User";

// ── Severity arc: starts high, realistic mid-flare, strong finish ──
// Week:           1   2   3   4   5   6   7   8
const SEVERITIES = [72, 68, 74, 63, 57, 51, 46, 41];

// ── Treatment arc: habits improve as severity drops ────────────────
const TREATMENTS = [
  { sleep: 5.5, water: 1.2, stress: 4, mood: 2, face_wash: "Neutrogena", medicines: null,           notes: "Starting to track my skin." },
  { sleep: 5.0, water: 1.5, stress: 4, mood: 2, face_wash: "Neutrogena", medicines: null,           notes: "Still stressed about exams." },
  { sleep: 6.0, water: 1.0, stress: 5, mood: 2, face_wash: "Neutrogena", medicines: "Benzoyl peroxide", notes: "Flare up. Started BP." },
  { sleep: 6.5, water: 1.8, stress: 3, mood: 3, face_wash: "CeraVe",     medicines: "Benzoyl peroxide", notes: "Switched to CeraVe. Feels better." },
  { sleep: 7.0, water: 2.0, stress: 3, mood: 3, face_wash: "CeraVe",     medicines: "Benzoyl peroxide", notes: "Sleeping more. Noticing difference." },
  { sleep: 7.5, water: 2.2, stress: 2, mood: 4, face_wash: "CeraVe",     medicines: "Adapalene",        notes: "Doctor switched to Adapalene." },
  { sleep: 7.5, water: 2.5, stress: 2, mood: 4, face_wash: "CeraVe",     medicines: "Adapalene",        notes: "Skin visibly clearer." },
  { sleep: 8.0, water: 2.8, stress: 1, mood: 5, face_wash: "CeraVe",     medicines: "Adapalene",        notes: "Best week so far!" },
];

// Public Cloudinary demo images (free, no auth needed)
const DEMO_IMAGES = [
  "https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill/sample.jpg",
  "https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill/sample.jpg",
  "https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill/sample.jpg",
  "https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill/sample.jpg",
  "https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill/sample.jpg",
  "https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill/sample.jpg",
  "https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill/sample.jpg",
  "https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill/sample.jpg",
];

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

const dateAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0]; // DATE only for treatment_logs
};

async function seed() {
  console.log("🌱 Starting demo seed...\n");

  // 1. Upsert demo user
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const userRes = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [DEMO_NAME, DEMO_EMAIL, hash]
  );
  const userId = userRes.rows[0].id;
  console.log(`✓ Demo user ready: ${userId}`);

  // 2. Wipe existing demo data (idempotent)
  await pool.query("DELETE FROM skin_entries   WHERE user_id = $1", [userId]);
  await pool.query("DELETE FROM treatment_logs WHERE user_id = $1", [userId]);
  console.log("✓ Cleared old demo data");

  // 3. Insert 8 weekly skin entries (one per week going back 8 weeks)
  for (let week = 0; week < 8; week++) {
    const daysBack = (7 - week) * 7; // week 0 = 49 days ago, week 7 = 0 days ago
    const severity = SEVERITIES[week];
    const confidence = parseFloat((0.72 + Math.random() * 0.2).toFixed(3));

   await pool.query(
  `INSERT INTO skin_entries
     (user_id, cloudinary_url, severity_score, confidence_score,
      scoring_status, condition_type, notes, acne_score, taken_at)
   VALUES ($1, $2, $3, $4, 'completed', 'acne', $5, $6, $7)`,
  [
    userId,
    DEMO_IMAGES[week],
    severity,
    confidence,
    TREATMENTS[week].notes,
    Math.round(severity / 10),
    daysAgo(daysBack),
  ]
);
    console.log(`  ✓ Week ${week + 1}: severity ${severity}, ${daysBack} days ago`);
  }

  // 4. Insert daily treatment logs (5 days per week for 8 weeks)
  for (let week = 0; week < 8; week++) {
    const t = TREATMENTS[week];
    for (let day = 0; day < 5; day++) {
      const daysBack = (7 - week) * 7 - day;
      if (daysBack < 0) continue;

      // Small natural variation
      const sleep = Math.max(3, parseFloat((t.sleep + (Math.random() - 0.5) * 0.5).toFixed(1)));
      const water = Math.max(0.5, parseFloat((t.water + (Math.random() - 0.5) * 0.3).toFixed(1)));

      await pool.query(
  `INSERT INTO treatment_logs
     (user_id, log_date, sleep_hours, water_litres, stress_level, mood,
      face_wash, medicines, custom_notes)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
   ON CONFLICT (user_id, log_date) DO NOTHING`,
  [
    userId,
    dateAgo(daysBack),
    sleep,
    water,
    parseInt(t.stress),
    parseInt(t.mood),
    t.face_wash,
    t.medicines,
    t.notes,
  ]
);
    }
  }
  console.log("✓ Treatment logs inserted (5 days/week × 8 weeks)");

  console.log("\n✅ Demo seed complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`   Email:    ${DEMO_EMAIL}`);
  console.log(`   Password: ${DEMO_PASSWORD}`);
  console.log(`   Journey:  Week 1 severity 72 → Week 8 severity 41 (-43%)`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

seed()
  .catch((err) => {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  })
  .finally(() => pool.end());