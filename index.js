require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

app.use(express.static("dist"));
app.use(cors());
app.use(express.json());
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
  morgan(":method :url :status :res[content-length] - :response-time ms :body ")
);

app.get("/info", (req, res, next) => {
  Person.find({})
    .then((people) => {
      res.send(
        `<p>Phonebook has info for ${
          people.length
        } people</p> <p>${new Date()}</p>`
      );
    })
    .catch((error) => next(error));
});

app.get("/api/persons", (req, res, next) => {
  Person.find({})
    .then((people) => {
      res.json(people);
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (req, res, next) => {
  try {
    const { name, number } = req.body;
    if (!name) {
      res.send({ error: `Name is missing from the request` });
    } else if (!number) {
      res.send({ error: `Number is missing from the request` });
    } else {
      Person.find({ name: name }).then((person) => {
        if (person && person.length > 0) {
          console.log(person);
          res.send({ error: "Name must be unique" });
        } else {
          new Person({ name: name, number: number })
            .save()
            .then((newPerson) => {
              res.send({
                success: `new person with id ${newPerson.id} created successfully`,
                person: newPerson,
              });
            })
            .catch((error) => next(error));
        }
      });
    }
  } catch (error) {
    console.log(`creating new person failed with error ${error}`);
    next(error);
  }
});

app.get("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  Person.findById(id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).send({ error: `no person found with id ${id}` });
      }
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  const body = req.body;

  Person.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).send({ error: `no person found with id ${id}` });
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  Person.findByIdAndDelete(id).then((person) => {
    if (person) {
      res.send({ success: `person with id ${id} is deleted successfully` });
    } else {
      res.send({ error: `Couldn't find person with id ${id}` }).status(404);
    }
  });
});

const unknownEndpoint = (req, res) => {
  console.log("Unknown endpoint called");
  res.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
  if (error.name === "CastError") {
    return res.status(400).send({ error: "Malformatted id" });
  } else if (error.name === "ValidationError") {
    console.log("Validation failed");
    return res.status(400).json({ error: error.message });
  }
  next(error);
};

app.use(errorHandler);
const PORT = process.env.PORT || 3000;
app.listen(PORT);
console.log("Express server is up and running");
