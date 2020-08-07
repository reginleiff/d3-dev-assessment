const mysql = require('mysql2');
const migration = require('mysql-migrations');
const { DB_HOST, DB_NAME, DB_PASS, DB_USER } = require('./config');

const connection = mysql.createPool({
  connectionLimit: 10,
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
});

migration.init(connection, __dirname + '/migrations');
