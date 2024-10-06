const config = require("./config.json");
const cron = require("node-cron");
const axios = require("axios");
require("dotenv").config();

const fetchMetagraph = async () => {
  try {
    const resp = await axios.get(`${process.env.METAGRAPH_URL}/metagraph`);
    console.log(resp);
  } catch (error) {
    console.log(error);
  }
};
// cron.schedule("*/5 * * * *", () => {
//   console.log("Running a task every 5 minutes");
// });
