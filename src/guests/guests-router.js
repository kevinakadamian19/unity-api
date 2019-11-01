const express = require('express')
const xss = require('xss')
const path = require('path')
const GuestsService = require('./guests-service')

const guestsRouter = express.Router();
const jsonParser = express.json()

const serializeGuest = guest => ({
    id: guest.id,
    name: xss(guest.name),
    email: xss(guest.email)
})

guestsRouter
    .route('/')
    .get((req, res, next) => {
        GuestsService.getAllGuests(
            req.app.get('db')
        )
        .then(guests => {
            res.json(guests.map(serializeGuest))
        })
        .catch(next)
    })
    .post(jsonParser, (req,res,next) => {
        const {name, email, event} = req.body
        const newGuest = {name, email, event}
        for(const [key,value] of Object.entries(newGuest)) {
            if(value == null) {
                return res.status(400).json({
                    error: {message: `Missing ${key} in request body.`}
                })
            }
        }
        GuestsService.insertGuest(
            req.app.get('db'),
            newGuest
        )
        .then(guest => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `${guest.id}`))
                .json(guest)
        })
        .catch(next)
    })

guestsRouter
    .route(`/:guest_id`)
    .all((req,res,next) => {
        GuestsService.getById(
            req.app.get('db'),
            req.params.guest_id
        )
        .then(guest => {
            if(!guest) {
                return res.status(404).json({
                    error: {message: `Guest not found`}
                })
            }
            res.guest = guest
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeGuest(res.guest))
    })
    .delete((req, res, next) => {
        GuestsService.deleteGuest(
            req.app.get('db'),
            req.params.guest_id
        )
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const {name, email, event} = req.body
        const guestToUpdate = {name, email, event}

        const numberOfValues = Object.values(guestToUpdate).filter(Boolean).length
        if(numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain either name, event id, or email`
                }
            })
        }
        GuestsService.updateGuest(
            req.app.get('db'),
            req.params.guest_id,
            guestToUpdate
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })
module.exports = guestsRouter;