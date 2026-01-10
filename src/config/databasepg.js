const { Client } = require("pg")
require('dotenv').config()

const client = new Client({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
})

client.connect()
    // .then(() => console.log("Connected to postgres"))
    // .catch((err) => console.log(err))

// client.query(`Select * from users`, (err, res) => {
//     if (err) {
//         console.log(err)
//     }
//     else {
//         console.log(res.rows)
//     }
// })

module.exports=client;