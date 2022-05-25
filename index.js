const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
//payment
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

//car-auto-parts
//r1jL42Ium8m6nwng

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7n8xf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
    const productCollection = client.db("car-auto-parts").collection("product");
    const reviewCollection = client.db("car-auto-parts").collection("review");
    const userCollection = client.db("car-auto-parts").collection("users");
    const orderCollection = client.db("car-auto-parts").collection("order");
    const paymentCollection = client.db("car-auto-parts").collection("payment");
    const profileCollection = client.db("car-auto-parts").collection("profile");

    //profile
    app.get("/profile", async (req, res) => {
      const profile = await profileCollection.find({}).toArray();
      res.send(profile);
    });
    app.put("/uploadProfile", async (req, res) => {
      const data = req.body;
      const filter = { title: "Random Harvest" };
      const result = await profileCollection.insertOne(data);
      res.send(result);
    });

    //Product
    app.get("/product", async (req, res) => {
      const product = await productCollection.find({}).toArray();
      res.send(product);
    });

    app.post("/uploadProduct", async (req, res) => {
      const data = req.body;
      const result = await productCollection.insertOne(data);
      res.send(result);
    });
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });
    //delete
    app.delete("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const products = await productCollection.deleteOne(query);
      res.send(products);
    });
    //review
    app.get("/review", async (req, res) => {
      const review = await reviewCollection.find({}).toArray();
      res.send(review);
    });

    app.post("/uploadReview", async (req, res) => {
      const data = req.body;
      const result = await reviewCollection.insertOne(data);
      res.send(result);
    });
    //user profile update

    app.get("/userprofile/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    app.put("/userprofile/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: data,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });
    //user admin
    app.get("/user", async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });

    

    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };

      app.get("/admin/:email", async (req, res) => {
        const email = req.params.email;
        const user = await userCollection.findOne({ email: email });
        const isAdmin = user.role == "admin";
        res.send({ admin: isAdmin });
      });

      app.put("/user/admin/:email", async (req, res) => {
        const email = req.params.email;
        const filter = { email: email };
        const updateDoc = {
          $set: { role: "admin" },
        };
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send(result);
      });
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });
    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const user = await userCollection.deleteOne(query);
      res.send(user);
    });

    //order option

    //user email order
    app.get("/order", async (req, res) => {
      const customerEmail = req.query.customerEmail;
      const query = { customerEmail: customerEmail };
      const order = await orderCollection.find(query).toArray();
      return res.send(order);
    });
    //all order
    app.get("/orders", async (req, res) => {
      const order = await orderCollection.find({}).toArray();
      res.send(order);
    });
    app.post("/orderProduct", async (req, res) => {
      const data = req.body;
      const result = await orderCollection.insertOne(data);
      res.send(result);
    });

    app.delete("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const order = await orderCollection.deleteOne(query);
      res.send(order);
    });

    //payment system

    app.post("/create-payment-intent", async (req, res) => {
      const service = req.body;
      const price = service.price;
      const amount = price * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });
    //payment
    app.get("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const orders = await orderCollection.findOne(query);
      res.send(orders);
    });
    app.patch("/order/:id", async (req, res) => {
      const id = req.params.id;
      const payment = req.body;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          paid: true,
          transactionId: payment.transactionId,
        },
      };
      const result = await paymentCollection.insertOne(payment);
      const updateBooking = await orderCollection.updateOne(filter, updateDoc);

      res.send(updateDoc);
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
