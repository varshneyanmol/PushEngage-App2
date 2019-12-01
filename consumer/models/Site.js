const mongoose = require('mongoose');

/*
This is dummy schema for site containing only three fields:
1. _id of the site (Automatically generated, so no need to define here)
2. domain_name : examples pushengage.com, dominoz.com, ajio.com etc
3. created_at: just date of document creation
 */
const siteSchema = new mongoose.Schema({
    domain_name: {
        type: String,
        require: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Site = mongoose.model('Site', siteSchema);
module.exports = Site;
