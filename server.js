const express = require('express');
const fs = require('fs');
const mongoose = require('mongoose');

const app = express();
const port = 8082;

const mongoDB = 'mongodb://localhost:27017/mydatabase';

mongoose.connect(mongoDB);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


// Định nghĩa Schema
const SinhVienSchema = new mongoose.Schema({
    mssv: String,
    tenSinhVien: String,
    khoa: String,
    tenLop: String
});

// Tạo Model
const SinhVien = mongoose.model('SinhVien', SinhVienSchema);

// Cho phép phân tích cú pháp dữ liệu dạng JSON trong request
app.use(express.json());

// Route chính để phục vụ file HTML
app.get('/', (req, res) => {
    const htmlContent = fs.readFileSync('index.html', 'utf8');
    res.send(htmlContent);
});

// Them sv
app.post('/api/sinhvien', async (req, res) => {
    try {
        const newSinhVien = new SinhVien({
            mssv: req.body.mssv,
            tenSinhVien: req.body.tenSinhVien,
            khoa: req.body.khoa,
            tenLop: req.body.tenLop
        });

        await newSinhVien.save();
        res.status(201).send(newSinhVien);
    } catch (err) {
        res.status(400).send({ message: 'Lỗi khi thêm sinh viên' });
    }
});

// Cap nhat sv
app.put('/api/sinhvien/:mssv', async (req, res) => {
    try {
        const sinhVien = await SinhVien.findOneAndUpdate({ mssv: req.params.mssv }, {
            tenSinhVien: req.body.tenSinhVien,
            khoa: req.body.khoa,
            tenLop: req.body.tenLop
        }, { new: true });

        if (!sinhVien) {
            return res.status(404).send();
        }

        res.send(sinhVien);
    } catch (err) {
        res.status(400).send({ message: 'Lỗi khi cập nhật thông tin sinh viên' });
    }
});

// Xoa sv
app.delete('/api/sinhvien/:mssv', async (req, res) => {
    try {
        const sinhVien = await SinhVien.findOneAndDelete({ mssv: req.params.mssv });

        if (!sinhVien) {
            return res.status(404).send();
        }

        res.send(sinhVien);
    } catch (err) {
        res.status(500).send({ message: 'Lỗi khi xóa sinh viên' });
    }
});

app.get('/api/sinhvien/:mssv', async (req, res) => {
    try {
        const mssv = req.params.mssv;
        const sinhVien = await SinhVien.findOne({ mssv: mssv });

        if (!sinhVien) {
            return res.status(404).send({ message: 'Không tìm thấy sinh viên với MSSV: ' + mssv });
        }

        res.send(sinhVien);
    } catch (err) {
        console.error(err); // Ghi log lỗi ra console
        res.status(500).send({ message: 'Lỗi khi tìm kiếm sinh viên: ' + err.message });
    }
});




// Khởi động server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
