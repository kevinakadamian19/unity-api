const express = require('express')
const path = require('path')
const WeddingsService = require('./weddings-service')

const weddingsRouter = express.Router()
const jsonParser = express.json()

weddingsRouter
    .route('/')
    .get((req, res, next) => {
        WeddingsService.getAllWeddings(
            req.app.get('db')
        )
        .then(weddings => {
            res.json(weddings)
        })
        .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { budget } = req.body;
        const newWedding = {budget};
        if(!budget) {
            return res.status(400).json({
                error: {
                    message: `Budget must be in request body to add wedding.`
                }
            })
        }
        WeddingsService.insertWedding(
            req.app.get('db'),
            newWedding
        )
        .then(wedding => {
            res
                .status(201)
                .location(path.posix.join(req.originaUrl, `${wedding.id}`))
                .json(wedding)
        })
        .catch(next)
    })

weddingsRouter
    .route('/:wedding_id')
    .all((req, res, next) => {
        WeddingsService.getById(
            req.app.get('db'),
            req.params.wedding_id
        )
        .then(wedding => {
            if(!wedding) {
                return res.status(404).json({
                    error: {message: `Event not found`}
                })
            }
            res.wedding = wedding
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json(res.wedding)
    })
    .delete((req, res, next) => {
        WeddingsService.deleteWedding(
            req.app.get('db'),
            req.params.wedding_id,
        )
        .then(() => {
            res.status(204).end()
        })
    })
    .patch(jsonParser, (req, res, next) => {
        const {budget} = req.body
        const weddingToUpdate = {budget}
        if(!budget) {
            return res.status(404).json({
                error: {message: `Budget is required in request body.`}
            })
        }
        WeddingsService.updateWedding(
            req.app.get('db'),
            req.params.wedding_id,
            weddingToUpdate
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })

module.exports = weddingsRouter;