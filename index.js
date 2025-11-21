import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());



// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
    ssl: {
    
    rejectUnauthorized: false, // allow Supabase self-signed cert
  }
});

// POST contact form API
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email and message are required." });
    }

    const query = `
      INSERT INTO contact_messages (name, email, subject, message)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const values = [name, email, subject, message];

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: "Message submitted successfully."
    });

  } catch (err) {
    console.error("Error saving message:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
