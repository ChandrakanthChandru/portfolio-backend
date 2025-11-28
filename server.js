import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ===============================
// Supabase Client
// ===============================
console.log("🔗 Connecting to Supabase...");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // better for backend inserts
);

console.log("✅ Supabase client initialized");

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

    // Insert into Supabase table
    const { data, error } = await supabase
      .from("contact_messages")
      .insert([
        {
          name,
          email,
          subject: subject || null,
          message,
        },
      ]);

    if (error) {
      console.error("❌ Supabase Insert Error:", error);
      return res.status(500).json({ error: "Failed to save message" });
    }

    return res.status(201).json({
      success: true,
      message: "Message submitted successfully!",
      data,
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
