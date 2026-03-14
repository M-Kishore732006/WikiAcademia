const cloudinary = require('cloudinary').v2;
const axios = require('axios');
require('dotenv').config();
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function testPdfAuth() {
  try {
      // 1. Upload a dummy PDF file as authenticated raw
      const dummyPdfData = "%PDF-1.4\n1 0 obj\n<<\n/Title (Dummy PDF)\n>>\nendobj\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF";
      const buff = Buffer.from(dummyPdfData, 'utf-8');
      
      console.log("Uploading file as authenticated raw...");
      cloudinary.uploader.upload_stream(
          { resource_type: 'raw', type: 'authenticated', folder: 'test_auth_pdf', public_id: 'dummy_auth.pdf' },
          async (error, result) => {
              if (error) {
                  console.error("Upload error:", error);
                  return;
              }
              console.log("Upload result:", result.secure_url);
              
              // 2. Generate signed URL
              const signedUrl = cloudinary.url(result.public_id, {
                  resource_type: 'raw',
                  type: 'authenticated',
                  sign_url: true
              });
              console.log("Signed URL:", signedUrl);
              
              // 3. Download
              try {
                  const resp = await axios.get(signedUrl);
                  console.log("Download Status:", resp.status);
                  console.log("Download Data Length:", resp.data.length);
                  
                  // Clean up
                  await cloudinary.uploader.destroy(result.public_id, { resource_type: 'raw', type: 'authenticated' });
                  console.log("Cleaned up dummy file");
              } catch (e) {
                  console.error("Download Error:", e.message);
                  if (e.response) {
                      console.error("Download Error Details:", e.response.status, e.response.statusText);
                  }
              }
          }
      ).end(buff);
      
  } catch (e) {
      console.error("Error:", e.message);
  }
}
testPdfAuth();
