import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN,
}));
app.use(express.json());

// ===============================
// PostgreSQL Connection
// ===============================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }  // Supabase SSL required
});

// ===============================
// POST /api/contact
// ===============================
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        error: "Name, email, and message are required.",
      });
    }

    const query = `
      INSERT INTO contact_messages (name, email, subject, message)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const values = [name, email, subject || null, message];

    await pool.query(query, values);

    return res.status(201).json({
      success: true,
      message: "Message submitted successfully!",
    });
  } catch (err) {
    console.error("❌ Error saving message:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ===============================
// Server Start
// ===============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
