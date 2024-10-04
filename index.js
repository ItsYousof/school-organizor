const express = require('express');
const path = require('path');

const PORT = 4444;
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Server listening on port http://localhost:${PORT}`);
});