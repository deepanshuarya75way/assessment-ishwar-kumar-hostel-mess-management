const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then((conn) => console.log("MongoDB connected: " + conn.connection.host))
  .catch((error) => {
    console.log("MongoDB connection failed: " + error.message);
    process.exit(1);
  });

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/api", require("./routes/common")); // login, menu, complaints
app.use("/api/warden", require("./routes/warden"));
app.use("/api/mess", require("./routes/mess"));
app.use("/api/student", require("./routes/student"));

app.get("/", (req, res) => {
  res.send("Hostel & Mess Management API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
