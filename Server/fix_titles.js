const mongoose = require('mongoose');
require('dotenv').config();
const Document = require('./models/Document');

const fixTitles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const docs = await Document.find({ title: { $regex: /\s{2,}/ } });
    console.log(`Found ${docs.length} documents with extra spaces in title.`);

    for (let doc of docs) {
      console.log(`Fixing: '${doc.title}'`);
      doc.title = doc.title.replace(/\s+/g, ' ').trim();
      await doc.save();
      console.log(`Fixed to: '${doc.title}'`);
    }

    console.log('Done.');
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
};

fixTitles();
