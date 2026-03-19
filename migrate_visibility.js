const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'Server', '.env') });

const Document = require('./Server/models/Document');

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const result = await Document.updateMany(
            { visibility: { $exists: false } },
            { $set: { visibility: 'public' } }
        );

        console.log(`Updated ${result.modifiedCount} documents to public visibility.`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
