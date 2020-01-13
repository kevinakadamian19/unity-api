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
app.use(
    cors({
        
    })
);

app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Authorization')
    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        logger.error(`Unauthorized request to path ${req.path}`);
        return res.status(401).json({error: 'Unauthorized request'})
    }
    next()
})

app.use(`/api/weddings`, weddingsRouter)
app.use(`/api/guests`, guestsRouter)
app.use(`/api/expenses`, expensesRouter)

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

