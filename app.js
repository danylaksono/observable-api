const express = require("express");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3300; // Use environment variable or default port
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/visunit";

app.use(express.json()); // Enable JSON body parsing
app.use(cors()); // Enable CORS for all routes

app.get("/", async (req, res) => {
  res.json({ message: "Please visit /data to view all the stored dataset" });
});

let client;

async function connectToDb() {
  try {
    client = await MongoClient.connect(uri);
    console.log("Connected to MongoDB Atlas");
    return client;
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
    process.exit(1);
  }
}

// Call connectToDb and handle the Promise
connectToDb()
  .then((client) => {
    // Get the database and collection references
    const db = client.db("visunit");
    const collection = db.collection("visunit-data");

    // POST route to insert a document
    app.post("/data", async (req, res) => {
      console.log(req.body);
      try {
        const newDocument = req.body; // Assuming data is sent in the request body
        const result = await collection.insertOne(newDocument);
        res.status(201).json({
          message: "Document inserted successfully",
          id: result.insertedId,
        });
      } catch (error) {
        console.error("Error inserting document:", error);
        res.status(500).json({ message: "Error creating document" });
      }
    });

    // GET route to retrieve all documents
    app.get("/data", async (req, res) => {
      try {
        // Use the req.query object as the query
        const query = req.query;

        // Use the find method to retrieve all documents that match the query
        const cursor = collection.find(query);
        const documents = await cursor.toArray();

        if (documents.length === 0) {
          res.status(404).json({
            message: "No documents found with the provided key-value pairs",
          });
        } else {
          res.json(documents);
        }
      } catch (error) {
        console.error("Error retrieving documents:", error);
        res.status(500).json({ message: "Error fetching documents" });
      }
    });

    // PUT route to update a document
    app.put("/data/:key/:value", async (req, res) => {
      try {
        const key = req.params.key; // Get the key from the URL parameters
        const value = req.params.value; // Get the value from the URL parameters
        const newData = req.body; // Get the new data from the request body

        // Create a query object based on the key and value
        let query = {};
        query[key] = value;

        // Use the $set operator to update the document
        const result = await collection.updateOne(query, { $set: newData });

        if (result.modifiedCount === 0) {
          res.status(404).json({
            message: "No document found with the provided key-value pair",
          });
        } else {
          res.json({ message: "Document updated successfully" });
        }
      } catch (error) {
        console.error("Error updating document:", error);
        res.status(500).json({ message: "Error updating document" });
      }
    });

    // GET route to retrieve all documents that match a key-value pair
    app.get("/data/:key/:value", async (req, res) => {
      try {
        const key = req.params.key; // Get the key from the URL parameters
        const value = req.params.value; // Get the value from the URL parameters

        // Create a query object based on the key and value
        let query = {};
        query[key] = value;

        // Use the find method to retrieve all documents that match the query
        const cursor = collection.find(query);
        const documents = await cursor.toArray();

        if (documents.length === 0) {
          res.status(404).json({
            message: "No documents found with the provided key-value pair",
          });
        } else {
          res.json(documents);
        }
      } catch (error) {
        console.error("Error retrieving documents:", error);
        res.status(500).json({ message: "Error fetching documents" });
      }
    });

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error:", error);
  });
