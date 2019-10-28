require('dotenv').config;
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const { NODE_ENV, CLIENT_ORIGIN } = require('./config')
const expensesRouter = require('./expenses/expenses-router')
const guestsRouter = require('./guests/guests-router')
const weddingsRouter = require('./weddings/weddings-router')


const app = express();
const morganOption = (NODE_ENV === 'production') ? 'tiny' : 'dev';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors({CLIENT_ORIGIN}));

app.use(`/api/expenses`, expensesRouter)
app.use(`/api/guests`, guestsRouter)
app.use(`/api/weddings`, weddingsRouter)

app.get('/', (req, res) => {
    res.send('Hello, world!')
})

app.use(function errorHandler(error,req,res,next) {
    let response
    if(NODE_ENV === 'production') {
        response = {error: {message: 'server issue'}}
    } else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response);
})

module.exports = app;

