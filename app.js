const express = require("express");
const MongoClient = require("mongodb").MongoClient;

const app = express();
const port = process.env.PORT || 3000; // Use environment variable or default port

// Replace with your actual connection string
const uri = "mongodb://your_connection_string";

async function connectToDb() {
  try {
    client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB Atlas");
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
    process.exit(1);
  }
}

connectToDb();

// Get the database and collection references
const db = client.db("visunit");
const collection = db.collection("visunit-data");

// POST route to insert a document
app.post("/documents", async (req, res) => {
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
app.get("/documents", async (req, res) => {
  try {
    const cursor = collection.find({});
    const documents = await cursor.toArray();
    res.json(documents);
  } catch (error) {
    console.error("Error retrieving documents:", error);
    res.status(500).json({ message: "Error fetching documents" });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
