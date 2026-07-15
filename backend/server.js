console.log('Looking for .env at:', require('path').join(__dirname, '.env'));
console.log('MONGODB_URI:', process.env.MONGODB_URI);

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ─── MONGOOSE CONNECTION ───
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ─── SCHEMAS ───

// Content Type = defines the structure of content (like a table schema)
const contentTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },      // e.g., "project", "blog-post", "skill"
  label: { type: String, required: true },                   // e.g., "Project", "Blog Post"
  fields: [{
    name: { type: String, required: true },                  // field key
    label: { type: String, required: true },                 // display label
    type: { type: String, enum: ['text','textarea','number','boolean','date','url','array','select','richtext','image'], required: true },
    required: { type: Boolean, default: false },
    options: [String],                                       // for select fields
    defaultValue: mongoose.Schema.Types.Mixed
  }],
  icon: { type: String, default: '📄' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Content = actual data entries
const contentSchema = new mongoose.Schema({
  contentType: { type: String, required: true, index: true }, // references contentType.name
  data: { type: mongoose.Schema.Types.Mixed, required: true }, // dynamic fields
  slug: { type: String, index: true },                        // for URL routing
  status: { type: String, enum: ['draft','published','archived'], default: 'draft' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pages = for custom page builder
const pageSchema = new mongoose.Schema({
  route: { type: String, required: true, unique: true },      // e.g., "/about", "/blog"
  title: { type: String, required: true },
  metaDescription: String,
  sections: [{
    contentType: String,
    contentId: mongoose.Schema.Types.ObjectId,
    order: Number
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const ContentType = mongoose.model('ContentType', contentTypeSchema);
const Content = mongoose.model('Content', contentSchema);
const Page = mongoose.model('Page', pageSchema);

// ─── SEED DEFAULT CONTENT TYPES ───
async function seedDefaults() {
  const existing = await ContentType.findOne({ name: 'project' });
  if (!existing) {
    await ContentType.create({
      name: 'project',
      label: 'Project',
      icon: '🚀',
      fields: [
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'category', label: 'Category', type: 'text' },
        { name: 'technologies', label: 'Technologies', type: 'array' },
        { name: 'imageUrl', label: 'Image URL', type: 'url' },
        { name: 'liveUrl', label: 'Live URL', type: 'url' },
        { name: 'githubUrl', label: 'GitHub URL', type: 'url' },
        { name: 'featured', label: 'Featured', type: 'boolean', defaultValue: false },
        { name: 'order', label: 'Display Order', type: 'number', defaultValue: 0 }
      ]
    });
    console.log('✅ Default content types seeded');
  }
}
seedDefaults();

// ─── MIDDLEWARE ───
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ─── CONTENT TYPE ROUTES ───

// Get all content types
app.get('/api/content-types', asyncHandler(async (req, res) => {
  const types = await ContentType.find({ isActive: true }).sort({ order: 1 });
  res.json(types);
}));

// Create content type
app.post('/api/content-types', asyncHandler(async (req, res) => {
  const type = await ContentType.create(req.body);
  res.status(201).json(type);
}));

// Update content type
app.put('/api/content-types/:id', asyncHandler(async (req, res) => {
  const type = await ContentType.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(type);
}));

// Delete content type
app.delete('/api/content-types/:id', asyncHandler(async (req, res) => {
  const name = (await ContentType.findById(req.params.id))?.name;
  if (name) await Content.deleteMany({ contentType: name });
  await ContentType.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
}));

// ─── CONTENT ROUTES (Generic CRUD for any content type) ───

// Get content by type (with optional filters)
app.get('/api/content/:contentType', asyncHandler(async (req, res) => {
  const { contentType } = req.params;
  const { status = 'published', sort = 'createdAt', limit } = req.query;
  
  const query = { contentType };
  if (status !== 'all') query.status = status;
  
  let q = Content.find(query).sort({ [sort]: 1 });
  if (limit) q = q.limit(Number(limit));
  
  const items = await q;
  res.json(items);
}));

// Get single content
app.get('/api/content/:contentType/:id', asyncHandler(async (req, res) => {
  const item = await Content.findOne({ contentType: req.params.contentType, _id: req.params.id });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
}));

// Get content by slug
app.get('/api/content/:contentType/slug/:slug', asyncHandler(async (req, res) => {
  const item = await Content.findOne({ contentType: req.params.contentType, slug: req.params.slug });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
}));

// Create content
app.post('/api/content/:contentType', asyncHandler(async (req, res) => {
  const contentType = await ContentType.findOne({ name: req.params.contentType });
  if (!contentType) return res.status(404).json({ error: 'Content type not found' });
  
  const item = await Content.create({
    contentType: req.params.contentType,
    data: req.body,
    slug: req.body.slug || req.body.title?.toLowerCase().replace(/\s+/g, '-'),
    status: req.body.status || 'published'
  });
  res.status(201).json(item);
}));

// Update content
app.put('/api/content/:contentType/:id', asyncHandler(async (req, res) => {
  const item = await Content.findOneAndUpdate(
    { contentType: req.params.contentType, _id: req.params.id },
    { 
      data: req.body,
      slug: req.body.slug || req.body.title?.toLowerCase().replace(/\s+/g, '-'),
      status: req.body.status || 'published',
      updatedAt: new Date()
    },
    { new: true }
  );
  res.json(item);
}));

// Delete content
app.delete('/api/content/:contentType/:id', asyncHandler(async (req, res) => {
  await Content.findOneAndDelete({ contentType: req.params.contentType, _id: req.params.id });
  res.json({ message: 'Deleted' });
}));

// Bulk delete
app.post('/api/content/:contentType/bulk-delete', asyncHandler(async (req, res) => {
  await Content.deleteMany({ contentType: req.params.contentType, _id: { $in: req.body.ids } });
  res.json({ deleted: req.body.ids.length });
}));

// ─── PAGE ROUTES ───

app.get('/api/pages', asyncHandler(async (req, res) => {
  const pages = await Page.find({ isActive: true });
  res.json(pages);
}));

app.get('/api/pages/:route', asyncHandler(async (req, res) => {
  const page = await Page.findOne({ route: req.params.route });
  if (!page) return res.status(404).json({ error: 'Page not found' });
  res.json(page);
}));

// ─── HEALTH ───
app.get('/', (req, res) => res.send('CMS Backend Running'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 CMS Server on http://localhost:${PORT}`));