const express = require('express');
const bodyParser = require('body-parser');
const expressEjsLayouts = require('express-ejs-layouts');
const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const bottleneck = require('bottleneck');
const { Cluster } = require('puppeteer-cluster');


const app = express();
const routes = require('./routes/User');




// support parsing of application/json type post data
app.use(bodyParser.json());

// Parse URL-encoded form data
app.use(bodyParser.urlencoded({ extended: true }));


//middleware
app.set('view engine', 'ejs');
app.use(expressEjsLayouts);
app.set('layout', 'layout'); 


// routes
app.use('/', routes);


const PORT = 3000;
app.listen(PORT, () => { 
    console.log(`server is running on http:localhost:${PORT}`)
});