CREATE TABLE unity_guests (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    eventId INTEGER REFERENCES unity_weddings(id) NOT NULL
);