const express   = require("express");
const daos = require('./dao');
const dao2express = require("../index");
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json({ strict: false }));
app.use((req, res, next)=>{
    if(req.query._method){
        req.method = req.query._method.toUpperCase();
        delete req.query._method;
        req.body=Object.assign({},req.body,req.query);
    }
    next();
});

app.use('/user', dao2express(daos.userDao));
app.use('/picture', dao2express(daos.pictureDao));

app.listen(8080);