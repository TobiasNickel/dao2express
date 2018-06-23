const tmongodao = require('tmongodao');
const tfilemonk = require('tfilemonk')
const fs = require('fs');

const filename = '../data.js';
//try{fs.unlinkSync(filename);}catch(err){}
tfilemonk({filename});

var db = tmongodao({
    uri: 'mongodb://localhost:27017/tmysqldaotest'
});

module.exports.db = db;