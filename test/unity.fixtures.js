function makeWeddingsArray() {
    return [
        {
            id: 1,
            spending: '3400',
            budget: '54000'
        },
        {
            id: 2,
            spending: '32547',
            budget: '64000'
        }
    ];
}

function makeGuestsArray() {
    return [
        {
            id: 1,
            name: 'Babba Yaga',
            email: 'spoopywitch101@gmail.com',
            eventId: '1'
        },
        {
            id: 1,
            name: 'Prince Philip',
            email: 'OnceUponADream@yahoo.com',
            eventId: '2'
        },
        {
            id: 1,
            name: 'Minnie Mouse',
            email: 'theMouseofHouse@hotmail.com',
            eventId: '1'
        }
    ];
}

function makeExpensesArray() {
    return [
        {
            id: 1,
            expense: 'Haku Spring',
            note: 'Honeymoon',
            price: '4300',
            eventId: '2'
        },
        {
            id: 2,
            expense: 'Emporer Palace',
            note: 'Venue',
            price: '2000',
            eventId: '1'
        },
        {
            id: 3,
            expense: 'High Ho Help',
            note: 'Valet',
            price: '1500',
            eventId: '2'
        }
    ]
}

module.exports = {
    makeWeddingsArray,
    makeGuestsArray,
    makeExpensesArray
}