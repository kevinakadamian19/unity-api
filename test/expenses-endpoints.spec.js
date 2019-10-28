const {expect} = require('chai');
const knex = require('knex');
const {makeExpensesArray} = require('./unity.fixtures')
const app = require('../src/app');

describe(`Expenses endpoints`, function() {
    let db;

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: 'process.env.TEST_DB_URL',
        })
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db('unity_expenses').truncate())

    afterEach('Clean up', () => db('unity_expenses').truncate())

    describe.only(`GET /api/expenses`, () => {
        context(`Given there are no expenses in the database`, () => {
            it('responds with 200 and empty list', () => {
                return supertest(app)
                    .get('/api/expenses')
                    .expect(200, [])
            })
        })

        context('Given there are expenses in the database', () => {
            const testExpenses = makeExpensesArray();
            beforeEach('insert expenses', () => {
                return db
                    .get('/api/expenses')
                    .expect(200, testExpenses)
            })
            it('responds with 200 and all of the guests', () => {
                return supertest(app)
                    .get('/api/expenses')
                    .expect(200, testExpenses)
            })
        })
    })
    describe('GET /api/expenses/:expense_id', () => {
        context(`Given there are no expenses in the database`, () => {
            it(`responds with a 404 error`, () => {
                const expenseId = 123456;
                return supertest(app)
                    .get(`/api/expenses/${expenseId}`)
                    .expect(404, {error: {message: `Expense not found`}})
            })
        })
        context(`Given there are expenses in the database`, () => {
            const testExpenses = makeExpensesArray();
            this.beforeEach('insert expenses', () => {
                return db
                    .into('unity_expenses')
                    .insert(testExpenses)
            })
            it('Responds with 200 and the specific guest', () => {
                const expenseId = 2
                const expectedExpense = testExpneses[expenseId-1]
                return supertest(app)
                    .get(`/api/expenses/${expenseId}`)
                    .expect(200, expectedExpense)
            })
        })
    })
    describe(`POST /api/expenses`, () => {
        it(`creates a expense, responding with 201 and new expense`, () => {
            const newExpense = {
                id: 3,
                expense: '',
                note: 'Lightning Mcqueen',
                price: 'kachow3000@gmail.com'
            }
            return supertest(app)
                .post('/api/expenses')
                .send(newExpense)
                .expect(201)
                .expect(res => {
                    expect(res.body.expense).to.eql(newExpense.expense)
                    expect(res.body.note).to.eql(newExpense.note)
                    expect(res.body.price).to.eql(newExpense.price)
                    expect(res.body.eventId).to.eql(newExpense.eventId)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/expenses/${res.body.id}`)
                    expect(actual).to.eql(expected)
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/api/expenses/${postRes.body.id}`)
                        .expect(postRes.body)
                )
                //Add XSS validation
        })
        const requiredFields = ['expense', 'price']

        requiredFields.forEach(fields => {
            const newExpense = {
                expense: 'test expense',
                price: '100000000'
            }
            it(`responds with a 400 and an error message when ${field} is missing`, () => {
                delete(newExpense)[field]

                return supertest(app)
                    .post('/api/expenses')
                    .send(newExpense)
                    .expect(400, {
                        error: {
                            message: `Missing ${field} in request body`
                        }
                    })
            })
        })
        //Add XSS attacks validation
    })
    describe(`DELETE /api/expenses/:expense_id`, () => {
        context(`Given no expenses`, () => {
            it(`responds with a 404`, () => {
                const expenseId = 123456
                return supertest(app)
                    .delete(`/api/expenses/${expenseId}`)
                    .expect(404, {
                        error: {message: `Expense not found`}
                    })
            })
        })
        context(`Given there are expenses in the database`, () => {
            const testExpenses = makeExpensesArray();
            beforeEach('insert expenses', () => {
                return db
                    .into('unity_expenses')
                    .insert(testExpenses)
            })
            it('responds with 204 and removes the expense', () => {
                const idToRemove = 2
                const expectedExpenses = testExpenses.filter(expense => expense.id !== idToRemove)
                return supertest(app)
                    .delete(`/api/guests/${idToRemove}`)
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get(`/api/expenses`)
                            .expect(expectedExpenses)
                    })
            })
        })
    })
    describe(`PATCH /api/expenses/:expense_id`, () => {
        context(`Given no guests`, () => {
            it(`responds with a 404`, () => {
                const expenseId = 123456;
                return supertest(app)
                    .patch(`/api/expenses/${expenseId}`)
                    .expect(404, {error: {message: `Expense not found`}})
            })
        })
        context(`Given there are guests in database`, () => {
            const testExpenses = makeExpensesArray();
            beforeEach('insert expenses', () => {
                return db
                    .into('unity_expenses')
                    .insert(testExpenses)
            })
            it(`responds with 204 and updates the expense`, () => {
                idToUpdate = 2;
                const patchExpense = {
                    expense: 'Ariel Opera',
                    note: 'Entertainment',
                    price: '6500'
                }
                const expectedExpense = {
                    ...testExpenses[idToUpdate-1],
                    ...patchExpense
                }
                return supertest(app)
                    .patch(`/api/expenses/${idToUpdate}`)
                    .send(patchExpense)
                    .expect(res => {
                        supertest(app)
                            .get(`/api/expenses/${idToUpdate}`)
                            .expect(expectedExpense)
                    })
            })
            it(`responds with 400 when no required fields are provided`, () => {
                const idToUpdate = 2;
                return supertest(app)
                    .patch(`/api/expenses/${idToUpdate}`)
                    .send({irrelevantField: 'foo'})
                    .expect(400, {
                        error: {
                            message: `Request body must contain either expense name, price, or note`
                        }
                    })
            })
            it(`responds with a 204 when updating only a subset of fields`, () => {
                const idToUpdate = 2;
                const patchExpense = {
                    note: 'First Dance Song'
                }
                const expectedExpense = {
                    ...testExpenses[idToUpdate-1],
                    patchExpense
                }
                return supertest(app)
                    .patch(`/api/expenses/${idToUpdate}`)
                    .send({
                        ...patchExpense,
                        fieldToIgnore: 'should not be in GET response'
                    })
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get(`/api/expenses/${idToUpdate}`)
                            .expect(expectedExpense)
                    )
            })
        })
    })
})