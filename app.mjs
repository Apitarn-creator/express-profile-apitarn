import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

// 1. ตั้งค่า Server
const app = express();
const port = process.env.PORT || 4001;


const supabaseUrl = "https://ohmvcercqgbzzttzfibv.supabase.co"; 
const supabaseKey = "sb_publishable_MsTGQzUHL3tx7c6LYfX4GA_UgSrhxjU"; 
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());

app.use(cors({
  origin: [
    "http://localhost:5173",  // สำหรับรัน Frontend ในเครื่อง (Vite)
    "http://localhost:3000",  // เผื่อใช้ Port 3000
    "https://your-frontend-project.vercel.app" // ⚠️ (อนาคต) ใส่ลิงก์ Frontend ตอน Deploy จริง
  ]
}));

app.get("/health", (req, res) => {
  res.status(200).json({ message: "OK" });
});

// -------------------------------------------------------
// 3. นี่คือส่วนที่หายไป! (API สำหรับสร้างโพสต์ใหม่)
// -------------------------------------------------------
app.post("/post", async (req, res) => {
  console.log("Received POST request:", req.body); // เช็คว่ามีข้อมูลส่งมาถึง Server ไหม

  const { title, image, category_id, description, content, status_id } = req.body;

  // Validation: ตรวจสอบข้อมูล
  if (!title || !image || !category_id || !description || !content || !status_id) {
    return res.status(400).json({
      message: "Server could not create post because there are missing data from client",
    });
  }

  // Insert: บันทึกลงฐานข้อมูล Supabase
  const { data, error } = await supabase.from("posts").insert([
    {
      title,
      image,
      category_id,
      description,
      content,
      status_id,
    },
  ]);

  // Error Handling
  if (error) {
    console.error("Supabase Error:", error);
    return res.status(500).json({
      message: "Server could not create post because database connection",
      error: error.message
    });
  }

  // Success
  return res.status(201).json({
    message: "Created post successfully",
  });
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});