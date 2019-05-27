const {Pool} = require('pg');
require('dotenv').config();
const connectionString = process.env.DATABASE_URL;

module.exports = new Pool({
    connectionString: connectionString,
});