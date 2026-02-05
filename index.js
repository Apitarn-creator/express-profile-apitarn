const express = require('express');
const app = express();

// Requirement: HTTP Method - GET, Endpoint - /profiles
app.get('/profiles', (req, res) => {
    // Requirement: Response (Success)
    res.status(200).json({
        data: {
            name: "john",
            age: 20
        }
    });
});

// Route สำหรับหน้าแรก (Optional: เพื่อให้รู้ว่า Server ทำงาน)
app.get('/', (req, res) => {
    res.send("Express Server is Running on Vercel");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// จำเป็นสำหรับ Vercel
module.exports = app;