// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const routes = require('./routes/index');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});