// server.js
const app = require('./app');
require('dotenv').config();

console.log("env port: ",process.env.PORT);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});