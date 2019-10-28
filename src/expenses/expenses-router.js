const express = require('express')
const xss = require('xss')
const path = require('path')
const ExpensesService = require('./expenses-service')

const expensesRouter = express.Router();
const jsonParser = express.json()

const serializeExpense = expense => ({
    id: expense.id,
    expense: xss(expense.expense),
    note: xss(expense.note),
    price: expense.price
})

expensesRouter
    .route('/')
    .get((req, res, next) => {
        ExpensesService.getAllExpenses(
            req.app.get('db')
        )
        .then(expense => {
            res.json(expense)
        })
        .catch(next)
    })
    .post(jsonParser, (req,res,next) => {
        const {expense, note, price} = req.body
        const newExpense = {expense, note, price}
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
                .json(expense)
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
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const {expense, note, price} = req.body
        const expenseToUpdate = {expense, note, price}

        const numberOfValues = Object.values(expenseToUpdate).filter(Boolean).length
        if(numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain either expense name, note, or price`
                }
            })
        }
        GuestsService.updateExpense(
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