const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');
const Product = require('./models/Product');
const User = require('./models/User');
const { connectDB } = require('./db/database');
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config();

const seedProducts = async () => {
  try {
    await connectDB();

    console.log('Fetching products from FakeStoreAPI...');
    // We fetch a few products from FakeStoreAPI
    const { data: fakeProducts } = await axios.get('https://fakestoreapi.com/products');

    // Also get an admin user to assign as the creator
    const adminUser = await User.findOne({ role: 'admin' });
    let adminId = adminUser ? adminUser._id : null;

    if (!adminId) {
      console.log('No admin user found. Creating a dummy admin user for seeding...');
      const dummyAdmin = await User.create({
        name: 'Admin Seeder',
        email: 'adminseeder@example.com',
        phone: '1234567890',
        password: 'password123',
        role: 'admin',
        is_verified: true
      });
      adminId = dummyAdmin._id;
    }

    const categories = ['Door Handles', 'Locks', 'Hinges', 'Tower Bolts', 'Accessories'];
    const materials = ['Stainless Steel', 'Brass', 'Zinc Alloy', 'Aluminum Alloy'];
    const finishes = ['Chrome', 'Matt Black', 'Gold', 'Nickel', 'Antique'];

    // Map the FakeStore products to our Shree Om Hardware schema
    const newProducts = fakeProducts.map((fp, index) => {
      // FakeStore API gives clothes/electronics. We'll adapt them softly to hardware for the sake of the schema.
      const hardwareName = `Hardware Item - ${fp.title.substring(0, 30)}`;
      
      return {
        name: hardwareName,
        price: fp.price * 80, // roughly convert USD to INR
        description: fp.description,
        ratings: fp.rating.rate,
        numOfReviews: fp.rating.count,
        images: [
          {
            public_id: `fake_id_${index}`,
            url: fp.image
          }
        ],
        // Randomly assign category, material, finish to fit our Enum
        category: categories[index % categories.length],
        material: materials[index % materials.length],
        finish: finishes[index % finishes.length],
        seller: 'Shree Om Hardware',
        stock: Math.floor(Math.random() * 50) + 1, // random stock 1-50
        user: adminId
      };
    });

    // Clear existing products
    console.log('Clearing existing products...');
    await Product.deleteMany();

    console.log(`Inserting ${newProducts.length} seeded products...`);
    await Product.insertMany(newProducts);

    console.log('✅ Seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding products:', error.message);
    process.exit(1);
  }
};

seedProducts();
