CREATE TABLE unity_expenses (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    expense TEXT NOT NULL,
    note TEXT,
    price INTEGER NOT NULL,
    eventId INTEGER REFERENCES unity_weddings(id) NOT NULL
);