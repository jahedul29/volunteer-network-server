const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n6je5.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(bodyParser.json());
// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

client.connect((err) => {
  const eventCollection = client.db(process.env.DB_NAME).collection("events");
  const regInfoCollection = client
    .db(process.env.DB_NAME)
    .collection("regInfo");
  // perform actions on the collection object
  console.log("Database connection established");

  app.get("/getAllEvents", (req, res) => {
    eventCollection.find({}).toArray((err, docs) => {
      res.send(docs);
    });
  });

  app.get("/getEventByName/:name", (req, res) => {
    eventCollection.find({ title: req.params.name }).toArray((err, docs) => {
      res.send(docs[0]);
    });
  });

  app.post("/addRegInfo", (req, res) => {
    const regData = req.body;
    regInfoCollection.insertOne(regData).then((result) => {
      console.log(result);
      res.sendStatus(200);
    });
  });

  app.get("/getRegEventByEmail/:email", (req, res) => {
    regInfoCollection.find({ email: req.params.email }).toArray((err, docs) => {
      res.send(docs);
    });
  });

  app.delete("/deleteReg/:id", (req, res) => {
    const id = req.params.id;
    regInfoCollection
      .deleteOne({ _id: ObjectId(id) })
      .then((result) => res.sendStatus(200));
  });

  app.get("/getAllRegEvent", (req, res) => {
    regInfoCollection.find({}).toArray((err, docs) => {
      res.send(docs);
    });
  });
});

console.log(process.env.DB_NAME);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
