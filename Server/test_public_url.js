const axios = require('axios');

async function checkURL() {
  const url = "https://res.cloudinary.com/didy3vgxs/raw/upload/v1773203923/academic_documents/Resume__5_1773203920288.pdf";
  try {
    const res = await axios.get(url, { responseType: 'stream' });
    console.log("Success! Status code:", res.status);
  } catch (err) {
    if (err.response) {
      console.error("HTTP Error:", err.response.status, err.message);
    } else {
      console.error("Error:", err.message);
    }
  }
}

checkURL();
