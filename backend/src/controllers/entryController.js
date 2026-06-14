const cloudinary = require("../services/cloudinaryService");
const pool = require("../config/db");
const fs = require("fs");


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

return res.status(201).json({
  message: "Photo uploaded successfully",
  entry: entry.rows[0],
});
  } catch (error) {
    console.error(error);

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
};