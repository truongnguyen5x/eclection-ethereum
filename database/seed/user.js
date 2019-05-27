const pool = require('../dbConnect');
const bcrypt = require('bcrypt');
const AppConstants = require('../../js/app_constants');

function crypt(password) {
    return bcrypt.hashSync(password, 10);
}
const seed = async function () {
    const avatar = AppConstants.AVATAR_URL;
    await pool.query('TRUNCATE TABLE users');
    await pool.query(
        `INSERT INTO users( username,       password,                           email,                 first_name,     last_name,        avatar,            date_of_birth,         is_admin) \
                   VALUES ( 'name1',       '${crypt('12345678')}',     'name1@gmail.com',     'Quang',        'nguyen',         '${avatar}',       '15 Apr 1997',         false),  \
                          ( 'name2',       '${crypt('12345678')}',     'name2@gmail.com',     'Truong',       'nguyen',         '${avatar}',       '15 Apr 1997',         true), \
                          ( 'name3',       '${crypt('12345678')}',     'name3@gmail.com',     'Phuc',         'nguyen',         '${avatar}',       '15 Apr 1997',         false),  \
                          ( 'name4',       '${crypt('12345678')}',     'name4@gmail.com',     'Nghia',        'nguyen',         '${avatar}',       '15 Apr 1997',         false);`
    );
    pool.end();
}
module.exports = seed;