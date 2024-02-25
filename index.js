const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()

const Person = require('./models/person')

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'invalid id' })
    }
    next(error)
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'resources not found' })
}

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))
app.use(express.static('dist'))

app.get('/version', (req, res) => {
    res.send('5')
})

app.get('/health', (req, res) => {
    res.send('I am ok')
})

app.get('/api/info', (request, response) => {
    Person
        .find({})
        .then(people => {
            response.send(`
                <p>Phonebook has info for ${people.length} people</p>
                <p>${new Date()}</p>
            `)
        })
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    for (let key of Object.keys(body)) {
        if (body[key] === null || body[key] === undefined) {
            response.status(400)
            response.send('all fields are required')
            return
        }
    }

    // TODO: Prevent adding an already existed person
    // const isExisted = persons.some(p => p.name === person.name)
    // if (isExisted) {
    //     response.status(400)
    //     response.send('the user has already existed')
    //     return
    // }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        response.json(person)
    })
})

app.get('/api/persons', (request, response) => {
    Person
        .find({})
        .then(people => {
            response.json(people)
        })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person
        .findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => {
            next(error)
        })
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person
        .findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => {
            next(error)
        })
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    const person = {
        name: body.name,
        number: body.number
    }

    // Populate null field with existing data of the person
    Person
        .findById(request.params.id)
        .then(existedPerson => {
            if (existedPerson) {
                for (let key of Object.keys(person)) {
                    if (key !== '_id' && (person[key] === null || person[key] === undefined)) {
                        console.log(key, existedPerson.key)
                        person.key = existedPerson.key
                    }
                }
            } else {
                response.status(404).end()
            }
        })

    Person
        .findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => {
            next(error)
        })
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})