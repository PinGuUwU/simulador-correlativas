const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

const seed = async () => {
    await connectDB();
    console.log('Seeding database...');
    // TODO: Seed the database with data
    // usar data/plan-1713.json y data/plan-1714.json
    const plan1713 = require('./data/plan-1713.json');
    const plan1714 = require('./data/plan-1714.json');

    const



        console.log('Database seeded successfully');
    process.exit(0);
};

seed();