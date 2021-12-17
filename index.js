const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectID;

//middleware
app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.get("/", (req, res) => res.send("Running Food Bazar Server"));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.spl8q.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const run = async () => {
  try {
    await client.connect();
    const database = client.db("foodBazar");
    const categoryCollection = database.collection("categories");

    //get all categories, post categories
    app
      .get("/categories", async (req, res) => {
        const result = await categoryCollection.find({}).toArray();
        res.send(result);
      })
      .post("/categories", async (req, res) => {
        const result = await categoryCollection.insertOne(req.body);
        res.send(result);
      });
  } finally {
    // await client.close();
  }
};
run().catch(console.dir);

app.listen(port, () => console.log(`listening to the port ${port}`));
