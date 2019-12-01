const mongoose = require('mongoose');

let options = {useNewUrlParser: true};

if (process.env.DB_USER && process.env.DB_PASSWORD) {
    options["user"] = process.env.DB_USER;
    options["pass"] = process.env.DB_PASSWORD;
}

mongoose.connect(process.env.DB_URL, options)
    .then(() => console.log('Connected to MongoDb...'));


module.exports.closeMongoDBConnection = function () {
    return mongoose.disconnect();
};
