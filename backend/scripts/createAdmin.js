const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load environment from project root .env if present
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const User = require('../src/models/user');

const MONGO_URI = process.env.MONGO_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'stepheneotieno20@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin1234';
const ADMIN_NAME = process.env.ADMIN_NAME || 'System Admin';

if (!MONGO_URI) {
  console.error('Missing MONGO_URI. Set process.env.MONGO_URI and try again.');
  process.exit(1);
}

(async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() }).lean();
    if (existing) {
      console.log('Admin already exists');
      await mongoose.disconnect();
      return process.exit(0);
    }

    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const admin = new User({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL.toLowerCase(),
      password: hashed,
      role: 'admin',
      phone: '0000000000',
      emailVerified: true,
      createdAt: new Date(),
    });

    await admin.save();
    console.log('Admin created successfully');
    await mongoose.disconnect();
    return process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err.message || err);
    try { await mongoose.disconnect(); } catch (e) {}
    return process.exit(1);
  }
})();
