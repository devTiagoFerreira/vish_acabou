const mysql = require('mysql');
require('dotenv').config();

var pool = mysql.createPool({
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    host: process.env.MYSQL_HOST,
});

//Conexão com busca direta
exports.poolConnect = (query, params = []) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((error, conn) => {
            if (error) {
                reject(error);
            } else {
                conn.query(query, params, (error, results, fields) => {
                    conn.release();
                    if (error) {
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            }
        });
    });
};

//Conexão com busca linha a linha
exports.poolLineToLine = (query, params = []) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((error, conn) => {
            if (error) {
                reject(error);
            } else {
                const qry = conn.query(query, params);
                let results = [];
                let err = false;
                let count = 0;
                qry.on('error', (error) => {
                    err = error;
                });
                qry.on('result', (row) => {
                    results[count] = row;
                    count++;
                });
                qry.on('end', () => {
                    conn.release();
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results);
                    }
                });
            }
        });
    });
};
