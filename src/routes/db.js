var express = require('express');
var router = express.Router();
var {config} = require('dotenv');
var pg = require('pg');
const {poolConnection} = require('../config/dababase');

config();

router.get('/', async (req, res) => {
  try {
    const result = await poolConnection.query('SELECT NOW()');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

module.exports = router;