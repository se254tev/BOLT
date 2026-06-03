const mongoose = require('mongoose');
const config = require('../src/config');
const User = require('../src/models/user');
const { hashPassword } = require('../src/services/authService');

async function run() {
  if (!config.mongoUri) {
    console.error('MONGODB_URI not set in environment (.env)');
    process.exit(1);
  }

  await mongoose.connect(config.mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    const users = [
      {
        name: 'stephene',
        email: 'stephene@example.com',
        phone: '+254700000001',
        password: await hashPassword('Password123!'),
        role: 'buyer',
        emailVerified: true,
      },
      {
        name: 'daniel',
        email: 'daniel@example.com',
        phone: '+254700000002',
        password: await hashPassword('Password123!'),
        role: 'seller',
        emailVerified: true,
        sellerStatus: 'active',
      },
    ];

    for (const u of users) {
      const exists = await User.findOne({ email: u.email });
      if (exists) {
        console.log(`User with email ${u.email} already exists, skipping.`);
        continue;
      }
      const created = await User.create(u);
      console.log(`Created user: ${created.email} (${created.role})`);
    }

    console.log('Seeding completed.');
  } catch (err) {
    console.error('Error seeding users', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
