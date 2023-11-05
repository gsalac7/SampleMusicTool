const express = require('express');
const app = express();
const PORT = 3000;

// Serve static files from the "public" directory
app.use(express.static('index.html'));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
