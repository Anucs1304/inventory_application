const express = require('express');
const path = require('path');
require('dotenv').config();

const indexRouter = require('./routes/index');
const categoryRouter = require('./routes/category');
const itemRouter = require('./routes/item');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/categories', categoryRouter);
app.use('/items', itemRouter);

module.exports = app;
