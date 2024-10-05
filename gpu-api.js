const express = require("express");
const nvidia = require("node-nvidia-smi");
const app = express();
const args = process.argv.slice(2);
const port = args[0];
if (!port) {
  console.error("No port provided");
  process.exit(1);
}
app.use(express.json());

// Basic route
app.get("/gpus/info", (req, res) => {
  try {
    nvidia((err, data) => {
      if (err) {
        console.error("Error fetching GPU info:", err);
        return res.status(500).send({ error: err.message });
      } else {
        console.log("GPU Info:", data);
      }
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
