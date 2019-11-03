const express = require('express')
const xss = require('xss')
const path = require('path')
const ExpensesService = require('./expenses-service')

const expensesRouter = express.Router();
const jsonParser = express.json();


const serializeExpense = expense => ({
    id: expense.id,
    vendor: xss(expense.vendor),
    note: xss(expense.note),
    price: expense.price,
    event: expense.event
})

expensesRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        ExpensesService.getAllExpenses(
            knexInstance
        )
        .then(expenses => {
            res.json(expenses.map(serializeExpense))
        })
        .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { vendor, note, price, event} = req.body
        const newExpense = { vendor, note, price, event }
        for(const [key,value] of Object.entries(newExpense)) {
            if(value == null) {
                return res.status(400).json({
                    error: {message: `Missing ${key} in request body.`}
                })
            }
        }
        ExpensesService.insertExpense(
            req.app.get('db'),
            newExpense
        )   
        .then(expense => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `${expense.id}`))
                .json(serializeExpense(expense))
        })
        .catch(next)
    })

expensesRouter
    .route(`/:expense_id`)
    .all((req,res,next) => {
        ExpensesService.getById(
            req.app.get('db'),
            req.params.expense_id
        )
        .then(expense => {
            if(!expense) {
                return res.status(404).json({
                    error: {message: `Expense not found`}
                })
            }
            res.expense = expense
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeExpense(res.expense))
    })
    .delete((req, res, next) => {
        ExpensesService.deleteExpense(
            req.app.get('db'),
            req.params.expense_id
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const {vendor, price} = req.body
        const expenseToUpdate = {vendor, price}

        const numberOfValues = Object.values(expenseToUpdate).filter(Boolean).length
        if(numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain either vendor, note, or price`
                }
            })
        }
        ExpensesService.updateExpense(
            req.app.get('db'),
            req.params.expense_id,
            expenseToUpdate
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })
module.exports = expensesRouter;