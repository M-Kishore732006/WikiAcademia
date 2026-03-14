const cloudinary = require('cloudinary').v2;
const axios = require('axios');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function testImagePDF() {
  const url = "https://res.cloudinary.com/didy3vgxs/image/upload/v1773373420/academic_documents/Resume__5_1773373418248.pdf";
  
  // Try normal fetch
  try {
      console.log("Fetching plain URL...");
      const res = await axios.get(url);
      console.log("Success:", res.status);
  } catch (err) {
      console.error("Plain URL failed:", err.response ? err.response.status : err.message);
  }

  // Generate signed URL
  const public_id = "academic_documents/Resume__5_1773373418248";
  const signedUrl = cloudinary.url(public_id, {
      resource_type: 'image',
      format: 'pdf',
      sign_url: true
  });
  
  console.log("Signed URL:", signedUrl);
  try {
      console.log("Fetching signed URL...");
      const res2 = await axios.get(signedUrl);
      console.log("Signed URL Success:", res2.status);
  } catch (err) {
      console.error("Signed URL failed:", err.response ? err.response.status : err.message);
  }
}
testImagePDF();
