const nvidia = require("node-nvidia-smi");

nvidia((err, data) => {
  if (err) {
    console.error("Error fetching GPU info:", err);
  } else {
    console.log("GPU Info:", data);
  }
});
