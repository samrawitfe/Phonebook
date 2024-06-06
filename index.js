const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.use(express.static("dist"));
app.use(cors());
/*
app.use(
  morgan("tiny", {
    skip: function (req, res) {
      return res.statusCode < 400;
    },
  })
);
 */

// GET /api/persons/3 200 53 - 13.185 ms body
morgan.token("body", function (req, res) {
  return JSON.stringify(req.body);
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

// app.get("/", (req, res) => {
//   res.send("Server is up and running");
// });

app.get("/info", (req, res) => {
  const totalPersons = persons.length;
  res.send(
    `<p>Phonebook has info for ${totalPersons} people</p> <p>${new Date()}</p>`
  );
});

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

const generateId = (min, max) =>
  Math.floor(Math.random() * (min + max + 1) + min);

app.use(express.json());
app.post("/api/persons", (req, res) => {
  try {
    const personObject = req.body;
    if (!personObject.name) {
      res.send({ error: `Name is missing from the request` });
    } else if (!personObject.number) {
      res.send({ error: `Number is missing from the request` });
    } else if (
      persons.find((person) => person.name === personObject.name) !== undefined
    ) {
      res.send({ error: "Name must be unique" });
    } else {
      personObject.id = generateId(10000, 100000);
      persons = persons.concat(personObject);

      res.send({
        success: `new person with id ${personObject.id} created successfully`,
        person: personObject,
      });
    }
  } catch (error) {
    console.log(`creating new person failed with error ${error}`);
    res.send({ error: "something went wrong" });
  }
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((person) => person.id === id);
  if (!person) {
    res.status(404).send({ error: `no person found with id ${id}` });
  } else {
    res.json(person);
  }
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((person) => person.id === id);
  if (!person) {
    res.send({ error: `Couldn't find person with id ${id}` }).status(404);
  } else {
    persons = persons.filter((person) => person.id !== id);
    res.send({ success: `person with id ${id} is deleted successfully` });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);
console.log("Express server is up and running");
