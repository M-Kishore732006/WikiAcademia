const bcrypt = require('bcryptjs');

async function test() {
    try {
        const isMatch = await bcrypt.compare('1234', '1234');
        console.log("Match against plain text:", isMatch);
    } catch (err) {
        console.error("Error during compare:", err.message);
    }
}

test();
