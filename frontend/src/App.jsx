import { useState, useEffect } from 'react'

// Local imports 
import Notificaion from './components/Notification'
import personService from './services/persons'

const App = () => {
  const [persons, setPersons] = useState([])
  // { name: 'Arto Hellas', number: '040-123456', id: 1 },
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [searchName, setSearchName] = useState('')
  const [filteredPersons, setFilteredPersons] = useState(persons)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
        setFilteredPersons(initialPersons)
      })
  }, [])

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleSearchNameChange = (event) => {
    let newSearchName = event.target.value

    if (newSearchName != '') {
      //filter the list based on the search query
      let filteredPersons = persons.filter(person => {
        return (person.name.toLocaleLowerCase()).includes(newSearchName.toLocaleLowerCase())
      })

      setFilteredPersons(filteredPersons)
    } else {
      setFilteredPersons(persons)
    }

    //display the filtered list
    setSearchName(newSearchName)
  }

  const hasPerson = (nameObject) => {
    for (let i = 0; i < persons.length; i++) {
      if (persons[i].name === nameObject.name) {
        return persons[i]
      }
    }

    return null
  }

  const addNewPerson = (event) => {
    event.preventDefault()
    const newPerson = {
      name: newName,
      number: newNumber
    }

    let existedPerson = hasPerson(newPerson)
    if (existedPerson) {
      const message = `${newPerson.name} is already added to the phonebook, replace the old number with a new one`
      if (confirm(message)) {
        let updatedPerson = { ...existedPerson, number: newPerson.number }

        // axios
        //   .put(`http://localhost:3001/persons/${existedPerson.id}`, updatedPerson)
        personService
          .update(existedPerson.id, updatedPerson)
          .then(returnedPerson => {
            let newPersons = persons.map(person => person.id !== updatedPerson.id ? person : returnedPerson)

            setPersons(newPersons)
            setFilteredPersons(newPersons)
          })
      }

      setNewName('')
      setNewNumber('')
      return
    }

    personService
      .create(newPerson)
      .then(createdPerson => {
        let newPersons = persons.concat(createdPerson)

        setPersons(newPersons)
        setFilteredPersons(newPersons)

        setNewName('')
        setNewNumber('')

        setSuccess('The new contact has been added')
        setTimeout(() => {
          setSuccess(null)
        }, 5000)
      })
      .catch(error => {
        console.log(error)
      })
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <Notificaion message={success} />
      <Filter searchName={searchName} handleSearchNameChange={handleSearchNameChange} />

      <h2>add a new</h2>
      <PersonForm
        newName={newName}
        newNumber={newNumber}
        handleNameChange={handleNameChange}
        handleNumberChange={handleNumberChange}
        addNewPerson={addNewPerson}
      />

      <h2>Numbers</h2>
      <Persons filteredPersons={filteredPersons} />
    </div>
  )
}

const Filter = (props) => {
  return (
    <div>
      filter shown with:
      <input type="text"
        value={props.searchName}
        onChange={props.handleSearchNameChange} />
    </div>
  )
}

const PersonForm = (props) => {
  return (
    <form onSubmit={props.addNewPerson}>
      <div>
        name:
        <input
          value={props.newName}
          onChange={props.handleNameChange}
        />
      </div>

      <div>
        number:
        <input type="text"
          value={props.newNumber}
          onChange={props.handleNumberChange}
        />
      </div>

      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const Persons = (props) => {
  return (
    <ul>
      {props.filteredPersons.map(person => {
        return <li key={person.id}>{person.name} {person.number}</li>
      })}
    </ul>
  )
}

export default App