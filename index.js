const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

//car-auto-parts
//r1jL42Ium8m6nwng


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7n8xf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
      await client.connect();
      const productCollection = client.db("car-auto-parts").collection("product");
     
      app.get("/product", async (req, res) => {
        const product = await productCollection.find({}).toArray();
        console.log(product);
        res.send(product);
      });
  
      app.post("/uploadProduct", async (req, res) => {
        const data = req.body;
        const result = await productCollection.insertOne(data);
        res.send(result);
      });

    } finally {
    }
  }
  run().catch(console.dir);



app.get("/", (req, res) => {
    res.send(" Server is running car auto parts");
  });
  
  app.listen(port, () => {
    console.log("CRUD Server is running");
  });
  