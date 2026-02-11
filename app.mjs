import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

// 1. Setup Server & Supabase
const app = express();
const port = process.env.PORT || 4001;

const supabaseUrl = "https://ohmvcercqgbzzttzfibv.supabase.co"; 
const supabaseKey = "sb_publishable_MsTGQzUHL3tx7c6LYfX4GA_UgSrhxjU"; 
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json());

// -------------------------------------------------------------
// 1. API เดิม: สร้างบทความ (Create)
// -------------------------------------------------------------
app.post("/post", async (req, res) => {
  const { title, image, category_id, description, content, status_id } = req.body;
  
  if (!title || !image || !category_id || !description || !content || !status_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const { error } = await supabase.from("posts").insert([{
    title, image, category_id, description, content, status_id
  }]);

  if (error) return res.status(500).json({ message: error.message });
  return res.status(201).json({ message: "Created post successfully" });
});

// -------------------------------------------------------------
// 2. API ใหม่: อ่านบทความทั้งหมด + ค้นหา (Read All)
// -------------------------------------------------------------
app.get("/posts", async (req, res) => {
  // รับค่า query parameter จาก URL (เช่น ?keyword=React&page=1)
  const { keyword, category, page = 1, limit = 10 } = req.query;
  
  // คำนวณ Pagination (Supabase ใช้ range แบบเริ่มที่ 0)
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  // เริ่มสร้าง Query
  let query = supabase.from("posts").select("*", { count: "exact" });

  // ถ้ามีการส่ง keyword มา ให้ค้นหาใน title
  if (keyword) {
    query = query.ilike("title", `%${keyword}%`);
  }
  // ถ้ามีการส่ง category มา ให้กรองตามนั้น
  if (category) {
    query = query.ilike("category", `%${category}%`); // หมายเหตุ: ตรวจสอบใน DB ว่าคอลัมน์ชื่อ category หรือ category_id
  }

  // สั่งรัน Query พร้อมแบ่งหน้า
  const { data, error, count } = await query.range(start, end);

  if (error) return res.status(500).json({ message: error.message });
  return res.json({ 
    data: data,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: count
    }
  });
});

// -------------------------------------------------------------
// 3. API ใหม่: อ่านบทความรายตัว (Read One)
// -------------------------------------------------------------
app.get("/posts/:id", async (req, res) => {
  const postId = req.params.id;

  // ค้นหา post ที่ id ตรงกับที่ส่งมา
  const { data, error } = await supabase.from("posts").select("*").eq("id", postId).single();

  if (error) return res.status(404).json({ message: "Post not found" });
  return res.json({ data: data });
});

// -------------------------------------------------------------
// 4. API ใหม่: แก้ไขบทความ (Update)
// -------------------------------------------------------------
app.put("/posts/:id", async (req, res) => {
  const postId = req.params.id;
  // รับข้อมูลใหม่ที่จะแก้ไข
  const { title, image, description, content } = req.body; 

  // สั่ง update ข้อมูล
  const { error } = await supabase
    .from("posts")
    .update({ title, image, description, content }) // อัปเดตเฉพาะฟิลด์ที่ระบุ
    .eq("id", postId);

  if (error) return res.status(500).json({ message: error.message });
  return res.json({ message: "Updated post successfully" });
});

// -------------------------------------------------------------
// 5. API ใหม่: ลบบทความ (Delete)
// -------------------------------------------------------------
app.delete("/posts/:id", async (req, res) => {
  const postId = req.params.id;

  // สั่งลบข้อมูล
  const { error } = await supabase.from("posts").delete().eq("id", postId);

  if (error) return res.status(500).json({ message: error.message });
  return res.json({ message: "Deleted post successfully" });
});

// Health Check
app.get("/health", (req, res) => res.json({ message: "OK" }));

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});