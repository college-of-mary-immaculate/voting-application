const mysql = require('mysql2/promise');
require('dotenv').config();

const masterPool = mysql.createPool({
    host: process.env.DB_MASTER_HOST,
    port: process.env.DB_MASTER_PORT,
    user: process.env.DB_MASTER_USER,
    password: process.env.DB_MASTER_PASSWORD, 
    database: process.env.DB_MASTER_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
});

const slavePool = mysql.createPool({
    host: process.env.DB_SLAVE_HOST,
    port: process.env.DB_SLAVE_PORT,
    user: process.env.DB_SLAVE_USER,          
    password: process.env.DB_SLAVE_PASSWORD,  
    database: process.env.DB_SLAVE_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
});

module.exports = {
    masterPool,
    slavePool
};