const {expect} = require('chai');
const knex = require('knex');
const {makeGuestsArray} = require('./unity.fixtures')
const app = require('../src/app');

describe(`Guests endpoints`, function() {
    let db;

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: 'process.env.TEST_DB_URL',
        })
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db('unity_guests').truncate())

    afterEach('Clean up', () => db('unity_guests').truncate())

    describe.only(`GET /api/guests`, () => {
        context(`Given there are no guests in the database`, () => {
            it('responds with 200 and empty list', () => {
                return supertest(app)
                    .get('/api/guests')
                    .expect(200, [])
            })
        })

        context('Given there are guests in the database', () => {
            const testGuests = makeGuestsArray();
            beforeEach('insert guests', () => {
                return db
                    .get('/api/guests')
                    .expect(200, testGuests)
            })
            it('responds with 200 and all of the guests', () => {
                return supertest(app)
                    .get('/api/guests')
                    .expect(200, testGuests)
            })
        })
    })
    describe('GET /api/guests/:guest_id', () => {
        context(`Given there are no guests in the database`, () => {
            it(`responds with a 404 error`, () => {
                const guestId = 123456;
                return supertest(app)
                    .get(`/api/guests/${guestId}`)
                    .expect(404, {error: {message: `Guest not found`}})
            })
        })
        context(`Given there are guests in the database`, () => {
            const testGuests = makeGuestsArray();
            this.beforeEach('insert guests', () => {
                return db
                    .into('unity_guests')
                    .insert(testGuests)
            })
            it('Responds with 200 and the specific guest', () => {
                const guestId = 2
                const expectedGuest = testGuests[guestId-1]
                return supertest(app)
                    .get(`/api/guests/${guestId}`)
                    .expect(200, expectedGuest)
            })
        })
    })
    describe(`POST /api/guests`, () => {
        it(`creates a guest, responding with 201 and new guest`, () => {
            const newGuest = {
                id: 3,
                name: 'Lightning Mcqueen',
                email: 'kachow3000@gmail.com',
                eventId: '1'
            }
            return supertest(app)
                .post('/api/guests')
                .send(newGuest)
                .expect(201)
                .expect(res => {
                    expect(res.body.name).to.eql(newGuest.name)
                    expect(res.body.email).to.eql(newGuest.email)
                    expect(res.body.eventId).to.eql(newGuest.eventId)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/guests/${res.body.id}`)
                    expect(actual).to.eql(expected)
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/api/guests/${postRes.body.id}`)
                        .expect(postRes.body)
                )
                //Add XSS validation
        })
        const requiredFields = ['name', 'email']

        requiredFields.forEach(fields => {
            const newGuest = {
                name: 'test name',
                email: 'test email'
            }
            it(`responds with a 400 and an error message when ${field} is missing`, () => {
                delete(newGuest)[field]

                return supertest(app)
                    .post('/api/guests')
                    .send(newGuest)
                    .expect(400, {
                        error: {
                            message: `Missing ${field} in request body`
                        }
                    })
            })
        })
        //Add XSS attacks validation
    })
    describe(`DELETE /api/guests/:guest_id`, () => {
        context(`Given no guests`, () => {
            it(`responds with a 404`, () => {
                const guestId = 123456
                return supertest(app)
                    .delete(`/api/guests/${guestId}`)
                    .expect(404, {
                        error: {message: `Guest not found`}
                    })
            })
        })
        context(`Given there are guests in the database`, () => {
            const testGuests = makeGuestsArray();
            beforeEach('insert guests', () => {
                return db
                    .into('unity_guests')
                    .insert(testGuests)
            })
            it('responds with 204 and removes the expense', () => {
                const idToRemove = 2
                const expectedGuests = testGuests.filter(guest => guest.id !== idToRemove)
                return supertest(app)
                    .delete(`/api/guests/${idToRemove}`)
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get(`/api/guests`)
                            .expect(expectedGuests)
                    })
            })
        })
    })
    describe(`PATCH /api/guests/:guest_id`, () => {
        context(`Given no guests`, () => {
            it(`responds with a 404`, () => {
                const guestId = 123456;
                return supertest(app)
                    .patch(`/api/guests/${guestId}`)
                    .expect(404, {error: {message: `Guest not found`}})
            })
        })
        context(`Given there are guests in database`, () => {
            const testGuests = makeGuestsArray();
            beforeEach('insert guests', () => {
                return db
                    .into('unity_guests')
                    .insert(testGuests)
            })
            it(`responds with 204 and updates the guest`, () => {
                idToUpdate = 2;
                const patchGuest = {
                    name: 'Peter Pan',
                    email: 'neverLand01@gmail.com'
                }
                const expectedGuest = {
                    ...testGuests[idToUpdate-1],
                    ...patchGuest
                }
                return supertest(app)
                    .patch(`/api/guests/${idToUpdate}`)
                    .send(patchGuest)
                    .expect(res => {
                        supertest(app)
                            .get(`/api/guests/${idToUpdate}`)
                            .expect(expectedGuest)
                    })
            })
            it(`responds with 400 when no required fields are provided`, () => {
                const idToUpdate = 2;
                return supertest(app)
                    .patch(`/api/guests/${idToUpdate}`)
                    .send({irrelevantField: 'foo'})
                    .expect(400, {
                        error: {
                            message: `Request body must contain either name, or email`
                        }
                    })
            })
            it(`responds with a 204 when updating only a subset of fields`, () => {
                const idToUpdate = 2;
                const patchGuest = {
                    name: 'Gaston'
                }
                const expectedGuest = {
                    ...testGuests[idToUpdate-1],
                    patchGuest
                }
                return supertest(app)
                    .patch(`/api/guests/${idToUpdate}`)
                    .send({
                        ...patchGuest,
                        fieldToIgnore: 'should not be in GET response'
                    })
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get(`/api/guests/${idToUpdate}`)
                            .expect(expectedGuest)
                    )
            })
        })
    })
})