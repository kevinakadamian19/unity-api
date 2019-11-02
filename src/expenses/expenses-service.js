const ExpensesService = {
    getAllExpenses(knex) {
        return knex.select('*').from('unity_expenses')
    },
    insertExpense(knex, newExpense) {
        return knex
            .insert(newExpense)
            .into('unity_expenses')
            .returning('*')
            .then(rows => {
                console.log(rows);
                console.log(rows);
                console.log(rows);
                return rows[0]
            })
    },
    getById(knex, id) {
        return knex
            .from('unity_expenses')
            .select('*')
            .where('id', id)
            .first()
    },
    deleteExpense(knex, id) {
        return knex
            .from('unity_expenses')
            .where({id})
            .delete()
    },
    updateExpense(knex, id, newExpenseFields) {
        return knex
            .from('unity_expenses')
            .where({id})
            .update({newExpenseFields})
    }
};

module.exports = ExpensesService;