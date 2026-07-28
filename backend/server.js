// ============================================
// Portfolio CMS Backend — Express Upload Server
// All data/auth operations handled by Supabase
// Only responsibility: file uploads + static serving
// ============================================

const fs = require('fs');
const path = require('path');

// Force load .env manually before anything else
const envPath = path.resolve(__dirname, '.env');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (value && !value.startsWith('#')) {
        process.env[key.trim()] = value;
      }
    }
  });
}

const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());

// ─── FILE UPLOADS ───
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
});

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

// Upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3001}`;
  res.json({
    url: `${baseUrl}/uploads/${req.file.filename}`,
    filename: req.file.filename,
    size: req.file.size,
  });
});

// Delete uploaded file
app.delete('/api/upload/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ message: 'Deleted' });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// ─── HEALTH ───
app.get('/', (req, res) => res.send('CMS Upload Server Running'));

// ─── START ───
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Upload server running on port ${PORT}`);
  console.log(`📁 Uploads served at: http://localhost:${PORT}/uploads`);
});