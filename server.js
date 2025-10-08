const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Farmer = require('./models/farmerModel'); // MongoDB model

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/farmersDB')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Hardcoded Users for Login
const users = [
  { username: 'admin', password: 'pass123', role: 'admin' },
  { username: 'farmer1', password: 'pass123', role: 'farmer' },
  { username: 'farmer2', password: 'pass123', role: 'farmer' },
  { username: 'dealer1', password: 'pass123', role: 'dealer' },
  { username: 'dealer2', password: 'pass123', role: 'dealer' }
];

// Serve HTML Pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.get('/farmer', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'farmer.html'));
});
app.get('/manage', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'manage.html'));
});
app.get('/next', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'next.html'));
});

// Login Route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.send(`
      <script>
        alert('Invalid username or password');
        window.location.href = '/';
      </script>
    `);
  }

  if (user.role === 'dealer' || user.role === 'admin') {
    return res.redirect('/manage');
  } else if (user.role === 'farmer') {
    return res.redirect('/farmer');
  } else {
    return res.redirect('/');
  }
});

// =====================
// CRUD APIs for next.html
// =====================

// GET all farmers
app.get('/api/farmers', async (req, res) => {
  try {
    const farmers = await Farmer.find();
    res.json(farmers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching data', error: err });
  }
});

// GET single farmer by ID
app.get('/api/farmers/:id', async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }
    res.json(farmer);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving farmer', error: err });
  }
});

// POST new farmer data
app.post('/api/farmers', async (req, res) => {
  const { district, town, location, crop, contact } = req.body;

  const newEntry = new Farmer({
    district,
    town,
    location,
    crop,
    contact,
    role: 'farmer'
  });

  try {
    await newEntry.save();
    res.status(201).json({ message: 'Data added successfully', entry: newEntry });
  } catch (err) {
    res.status(500).json({ message: 'Error saving data', error: err });
  }
});

// PUT update farmer entry
app.put('/api/farmers/:id', async (req, res) => {
  const { district, town, location, crop, contact } = req.body;

  try {
    const updated = await Farmer.findByIdAndUpdate(
      req.params.id,
      { district, town, location, crop, contact },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Farmer not found for update' });
    }
    res.json({ message: 'Data updated successfully', entry: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error updating data', error: err });
  }
});

// DELETE farmer entry
app.delete('/api/farmers/:id', async (req, res) => {
  try {
    const deleted = await Farmer.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Farmer not found for deletion' });
    }
    res.json({ message: 'Data deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting data', error: err });
  }
});

// =====================
// OLD Routes (optional — for legacy use)
// =====================
app.get('/farmers', async (req, res) => {
  try {
    const crops = await Farmer.find();
    res.json(crops);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching crops', error });
  }
});

app.post('/farmer', async (req, res) => {
  const { cropName, landArea, price, district, town, location } = req.body;

  const newCrop = new Farmer({
    crop: cropName,
    acres: landArea,
    price,
    district,
    town,
    location,
    role: 'farmer',
  });

  try {
    await newCrop.save();
    res.status(201).json({ message: 'Crop added successfully', crop: newCrop });
  } catch (error) {
    res.status(500).json({ message: 'Error adding crop', error });
  }
});

app.get('/farmer/:id', async (req, res) => {
  try {
    const crop = await Farmer.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }
    res.json(crop);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching crop', error });
  }
});

app.put('/farmer/:id', async (req, res) => {
  const { cropName, landArea, price, district, town, location } = req.body;
  try {
    const updatedCrop = await Farmer.findByIdAndUpdate(
      req.params.id,
      { crop: cropName, acres: landArea, price, district, town, location },
      { new: true }
    );

    if (!updatedCrop) {
      return res.status(404).json({ message: 'Crop not found for update' });
    }
    res.json({ message: 'Crop updated successfully', crop: updatedCrop });
  } catch (error) {
    res.status(500).json({ message: 'Error updating crop', error });
  }
});

app.delete('/farmer/:id', async (req, res) => {
  try {
    const deletedCrop = await Farmer.findByIdAndDelete(req.params.id);
    if (!deletedCrop) {
      return res.status(404).json({ message: 'Crop not found for deletion' });
    }
    res.json({ message: 'Crop deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting crop', error });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
