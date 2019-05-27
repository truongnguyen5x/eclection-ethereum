//this file use for create tables in postgres SQL

const pool = require('./dbConnect');
async function migrate() {
    await pool.query('DROP TABLE IF EXISTS users, employees');

    // tutorial for create table  postgresqltutorial.com/postgresql-create-table

    await pool.query('CREATE TABLE users(     \
        id serial PRIMARY KEY, \
        username VARCHAR (50) UNIQUE NOT NULL,\
        password VARCHAR (100) NOT NULL,\
        email VARCHAR (355) UNIQUE NOT NULL,\
        first_name VARCHAR (50) NOT NULL,  \
        last_name VARCHAR (50) NOT NULL, \
        avatar VARCHAR (355) NOT NULL,\
        date_of_birth date NOT NULL,\
        is_admin boolean NOT NULL);');


    // create more tale here

    pool.end();
}
migrate();