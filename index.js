const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

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
app.use(bodyParser.json({}));
// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true }));
// app.use("/profile", express.static("upload/images"));
app.use(fileUpload());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Establishing database connection
client.connect((err) => {
  // Event collection processes
  const eventCollection = client.db(process.env.DB_NAME).collection("events");

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

  app.post("/addEvent", (req, res) => {
    const event = req.body;
    const file = req.files.image;
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    const image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };

    const newEvent = { ...event, image };

    eventCollection.insertOne(newEvent).then((result) => {
      if (result.insertedCount > 0) {
        res.status(200).send(result.insertedCount > 0);
      } else {
        res.sendStatus(404);
      }
    });
  });

  app.delete("/deleteEvent/:id", (req, res) => {
    const id = req.params.id;
    eventCollection.deleteOne({ _id: ObjectId(id) }).then((result) => {
      if (result.deletedCount > 0) {
        res.status(200).send(result.deletedCount > 0);
      } else {
        res.sendStatus(404);
      }
    });
  });

  // Registered volunteering processes
  const regInfoCollection = client
    .db(process.env.DB_NAME)
    .collection("regInfo");
  console.log("Database connection established");

  app.post("/addRegInfo", (req, res) => {
    const regData = req.body;

    eventCollection
      .find({ _id: ObjectId(regData.volunteeringId) })
      .toArray((err, events) => {
        regInfoCollection
          .insertOne({ ...regData, image: events[0].image })
          .then((result) => {
            if (result.insertedCount) {
              res.status(200).send(result.insertedCount > 0);
            } else {
              res.sendStatus(404);
            }
          });
      });
  });

  app.get("/getRegEventByEmail/:email", (req, res) => {
    regInfoCollection.find({ email: req.params.email }).toArray((err, docs) => {
      res.send(docs);
    });
  });

  app.delete("/deleteReg/:id", (req, res) => {
    const id = req.params.id;
    regInfoCollection.deleteOne({ _id: ObjectId(id) }).then((result) => {
      if (result.deletedCount > 0) {
        res.status(200).send(result.deletedCount > 0);
      } else {
        res.sendStatus(404);
      }
    });
  });

  app.get("/getAllRegEvent", (req, res) => {
    regInfoCollection
      .find({})
      .project({ image: 0 })
      .toArray((err, docs) => {
        res.send(docs);
      });
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
