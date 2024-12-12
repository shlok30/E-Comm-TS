const mongoose = require('mongoose');
require('dotenv').config();

const connectToDb = () : Promise<typeof mongoose>  => {
    return mongoose.connect(process.env["DB_URL"]);
}

module.exports = connectToDb;
