const {expect} = require('chai');
const knex = require('knex');
const {makeWeddingsArray} = require('./unity.fixtures')
const app = require('../src/app');

describe(`Weddings endpoints`, function() {
    let db;

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: 'process.env.TEST_DB_URL',
        })
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db('unity_weddings').truncate())

    afterEach('Clean up', () => db('unity_weddings').truncate())

    describe.only(`GET /api/weddings`, () => {
        context(`Given there are no weddings in the database`, () => {
            it('responds with 200 and empty list', () => {
                return supertest(app)
                    .get('/api/weddings')
                    .expect(200, [])
            })
        })

        context('Given there are weddings in the database', () => {
            const testWeddings = makeWeddingsArray();
            beforeEach('insert weddings', () => {
                return db
                    .get('/api/weddings')
                    .expect(200, testWeddings)
            })
            it('responds with 200 and all of the weddings', () => {
                return supertest(app)
                    .get('/api/weddings')
                    .expect(200, testWeddings)
            })
        })
    })
    describe('GET /api/weddings/:wedding_id', () => {
        context(`Given there are no weddings in the database`, () => {
            it(`responds with a 404 error`, () => {
                const weddingId = 123456;
                return supertest(app)
                    .get(`/api/weddings/${weddingId}`)
                    .expect(404, {error: {message: `Event not found`}})
            })
        })
        context(`Given there are weddings in the database`, () => {
            const testWeddings = makeWeddingsArray();
            this.beforeEach('insert weddings', () => {
                return db
                    .into('unity_weddings')
                    .insert(testWeddings)
            })
            it('Responds with 200 and the specific wedding', () => {
                const weddingId = 2
                const expectedWedding = testWeddings[weddingId-1]
                return supertest(app)
                    .get(`/api/weddings/${weddingId}`)
                    .expect(200, expectedWedding)
            })
        })
    })
    describe(`POST /api/weddings`, () => {
        it(`creates a wedding, responding with 201 and new wedding`, () => {
            const newWedding = {
                id: 3,
                spending: '4500',
                budget: '45000'
            }
            return supertest(app)
                .post('/api/weddings')
                .send(newWedding)
                .expect(201)
                .expect(res => {
                    expect(res.body.spending).to.eql(newWedding.spending)
                    expect(res.body.budget).to.eql(newWedding.budget)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/weddings/${res.body.id}`)
                    expect(actual).to.eql(expected)
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/api/weddings/${postRes.body.id}`)
                        .expect(postRes.body)
                )
                //Add XSS validation
        })
        const requiredFields = ['spending', 'budget']

        requiredFields.forEach(fields => {
            const newWedding = {
                spending: 'test spending',
                budget: 'test budget'
            }
            it(`responds with a 400 and an error message when ${field} is missing`, () => {
                delete(newWedding)[field]

                return supertest(app)
                    .post('/api/weddings')
                    .send(newWedding)
                    .expect(400, {
                        error: {
                            message: `Missing ${field} in request body`
                        }
                    })
            })
        })
        //Add XSS attacks validation
    })
    describe(`DELETE /api/weddings/:wedding_id`, () => {
        context(`Given no weddings`, () => {
            it(`responds with a 404`, () => {
                const weddingId = 123456
                return supertest(app)
                    .delete(`/api/weddings/${weddingId}`)
                    .expect(404, {
                        error: {message: `Event not found`}
                    })
            })
        })
        context(`Given there are weddings in the database`, () => {
            const testWeddings = makeWeddingsArray();
            beforeEach('insert weddings', () => {
                return db
                    .into('unity_weddings')
                    .insert(testWeddings)
            })
            it('responds with 204 and removes the weddings', () => {
                const idToRemove = 2
                const expectedWeddings = testWeddings.filter(wedding => wedding.id !== idToRemove)
                return supertest(app)
                    .delete(`/api/weddings/${idToRemove}`)
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get(`/api/weddings`)
                            .expect(expectedWeddings)
                    })
            })
        })
    })
    describe(`PATCH /api/weddings/:wedding_id`, () => {
        context(`Given no weddings`, () => {
            it(`responds with a 404`, () => {
                const weddingId = 123456;
                return supertest(app)
                    .patch(`/api/weddings/${weddingId}`)
                    .expect(404, {error: {message: `Event not found`}})
            })
        })
        context(`Given there are weddings in database`, () => {
            const testWeddings = makeWeddingsArray();
            beforeEach('insert weddings', () => {
                return db
                    .into('unity_weddings')
                    .insert(testWeddings)
            })
            it(`responds with 204 and updates the guest`, () => {
                idToUpdate = 2;
                const patchWedding = {
                    spending: 'patch 4300',
                    budget: 'patch 45000'
                }
                const expectedWedding = {
                    ...testWeddings[idToUpdate-1],
                    ...patchWedding
                }
                return supertest(app)
                    .patch(`/api/weddings/${idToUpdate}`)
                    .send(patchWedding)
                    .expect(res => {
                        supertest(app)
                            .get(`/api/weddings/${idToUpdate}`)
                            .expect(expectedWedding)
                    })
            })
            it(`responds with 400 when no required fields are provided`, () => {
                const idToUpdate = 2;
                return supertest(app)
                    .patch(`/api/weddings/${idToUpdate}`)
                    .send({irrelevantField: 'foo'})
                    .expect(400, {
                        error: {
                            message: `Request body must contain either spending, or budget`
                        }
                    })
            })
            it(`responds with a 204 when updating only a subset of fields`, () => {
                const idToUpdate = 2;
                const patchWedding = {
                    budget: '6500'
                }
                const expectedWedding = {
                    ...testWeddings[idToUpdate-1],
                    patchWedding
                }
                return supertest(app)
                    .patch(`/api/weddings/${idToUpdate}`)
                    .send({
                        ...patchWedding,
                        fieldToIgnore: 'should not be in GET response'
                    })
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get(`/api/weddings/${idToUpdate}`)
                            .expect(expectedWedding)
                    )
            })
        })
    })
})