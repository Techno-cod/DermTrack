const cloudinary = require("../services/cloudinaryService");
const pool = require("../config/db");
const fs = require("fs");
const rescoreEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await pool.query(
      `SELECT * FROM skin_entries WHERE id = $1 AND user_id = $2`,
      [id, req.user.userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Entry not found" });
    }

    const target = existing.rows[0];

    const mlResponse = await fetch(`${process.env.ML_SERVICE_URL}/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify({
        entry_id: target.id,
        image_url: target.cloudinary_url,
      }),
    });

    if (!mlResponse.ok) throw new Error(`ML service returned ${mlResponse.status}`);

    const mlData = await mlResponse.json();

    const updated = await pool.query(
      `UPDATE skin_entries
         SET severity_score = $1, confidence_score = $2, scoring_status = 'completed'
       WHERE id = $3 RETURNING *`,
      [mlData.score, mlData.confidence, target.id]
    );

    return res.json({ message: "Rescored", entry: updated.rows[0] });
  } catch (error) {
    console.error("Rescore failed:", error.message);
    return res.status(500).json({ message: "Rescore failed" });
  }
};


const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

const result = await cloudinary.uploader.upload(
  req.file.path,
  {
    folder: "dermtrack",
  }
);

fs.unlinkSync(req.file.path);

const entry = await pool.query(
  
  `
 INSERT INTO skin_entries
(
  user_id,
  cloudinary_url,
  scoring_status,
  condition_type,
  notes,
  acne_score,
  taken_at
)
VALUES ($1,$2,$3,$4,$5,$6,NOW())
  RETURNING *
  `,
  [
  req.user.userId,
  result.secure_url,
  "pending",
  "acne",
  req.body.notes,
  Number(req.body.acneScore),
]
);
console.log("DB Insert Success");

let finalEntry = entry.rows[0];

// Score the entry synchronously via FastAPI
try {
  const mlResponse = await fetch(`${process.env.ML_SERVICE_URL}/score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(30000),
    body: JSON.stringify({
      entry_id: finalEntry.id,
      image_url: finalEntry.cloudinary_url,
    }),
  });

  if (!mlResponse.ok) throw new Error(`ML service returned ${mlResponse.status}`);

  const mlData = await mlResponse.json();

  const updated = await pool.query(
    `UPDATE skin_entries
       SET severity_score = $1, confidence_score = $2, scoring_status = 'completed'
     WHERE id = $3
     RETURNING *`,
    [mlData.score, mlData.confidence, finalEntry.id]
  );

  finalEntry = updated.rows[0];
  console.log("ML scoring complete:", mlData.score);
} catch (mlError) {
  console.error("ML scoring failed:", mlError.message);

  const failed = await pool.query(
    `UPDATE skin_entries SET scoring_status = 'failed' WHERE id = $1 RETURNING *`,
    [finalEntry.id]
  );
  finalEntry = failed.rows[0];
}

return res.status(201).json({
  message: "Photo uploaded successfully",
  entry: finalEntry,
});
  } catch (error) {
  console.error("FULL ERROR:", error);

  console.error(
    "Cloudinary Error Message:",
    error.message
  );

  console.error(
    "Cloudinary Response:",
    error.error || error.response
  );

  return res.status(500).json({
    message: "Upload failed",
  });
}
};
const getEntries = async (req, res) => {
  try {
    const entries = await pool.query(
      `
      SELECT *
      FROM skin_entries
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [req.user.userId]
    );

    return res.json({
      entries: entries.rows,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch entries",
    });
  }
};
const deleteEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM skin_entries
      WHERE id = $1
      AND user_id = $2
      RETURNING *
      `,
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Entry not found",
      });
    }

    return res.json({
      message: "Entry deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to delete entry",
    });
  }
};
module.exports = {
  uploadPhoto,
  getEntries,
  deleteEntry,
  rescoreEntry,
};