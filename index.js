const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    },
    {
        "id": 5,
        "name": "vua",
        "number": "39-23-6423122"
    },
    {
        "id": 5,
        "name": "pawn",
        "number": "39-23-6423122"
    }
]

app.get('/info', (request, response) => {
    response.send(`
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date()}</p>
    `)
})

app.post('/api/persons', (request, response) => {
    let person = { id: generateLargeRandomNumber() }
    person = { ...person, ...request.body }

    for (let key of Object.keys(person)) {
        if (key !== 'id' && person[key] === undefined) {
            response.status(400)
            response.send('all fields are required')
            return
        }
    }

    const isExisted = persons.some(p => p.name === person.name)
    if (isExisted) {
        response.status(400)
        response.send('the user has already existed')
        return
    }

    persons = persons.concat(person)

    response.json(person)
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    console.log(persons)
    response.status(204).end()
})

function generateLargeRandomNumber() {
    const LARGE_NUMBER = 999999999999999
    return Math.floor(Math.random() * LARGE_NUMBER);
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})