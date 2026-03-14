const cloudinary = require('cloudinary').v2;
const axios = require('axios');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function test() {
  const url = cloudinary.url('academic_documents/Resume__5_1773203920288.pdf', {
    resource_type: 'raw',
    sign_url: true
  });
  console.log("Signed URL:", url);
  try {
      const resp = await axios.get(url, { responseType: 'stream' });
      console.log("Status:", resp.status);
  } catch (e) {
      console.error("Error:", e.message);
  }
}
test();
