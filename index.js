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
    const productCollection = database.collection("products");
    const usersCollection = database.collection("users");
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
    //get all product and delete any product
    app
      .get("/products", async (req, res) => {
        const result = await productCollection.find({}).toArray();
        res.send(result);
      })
      .delete("/products/:id", async (req, res) => {
        const result = await productCollection.deleteOne({
          _id: ObjectId(req.params.id),
        });
        res.send(result);
      })
      .post("/products", async (req, res) => {
        const result = await productCollection.insertOne(req.body);
        res.send(result);
      });

    //post a user , get users and externally one for google sign in
    app
      .post("/users", async (req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        res.send(result);
      })
      .get("/users", async (req, res) => {
        const result = await usersCollection.find({}).toArray();
        res.send(result);
      })
      .put("/users", async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const options = { upsert: true };
        const updateDoc = {
          $set: user,
        };
        const result = await usersCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.send(result);
      });

    //role play updating for admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const exist = await usersCollection.findOne({ email: user.email });
      if (exist) {
        const updateDoc = { $set: { role: "admin" } };
        const resultForExist = await usersCollection.updateOne(
          filter,
          updateDoc
        );
        res.send(resultForExist);
      } else {
        const resultForNotExist = await usersCollection.insertOne({
          email: user.email,
          role: "admin",
        });
        res.send(resultForNotExist);
      }
    });

    //getting admin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = await usersCollection.findOne({ email: email });
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.send({ admin: isAdmin });
    });
  } finally {
    // await client.close();
  }
};
run().catch(console.dir);

app.listen(port, () => console.log(`listening to the port ${port}`));
