const config = require("./config.json");
const cron = require("node-cron");
const axios = require("axios");
require("dotenv").config();
const fetchMetagraph = async () => {
  try {
    const listEndpoint = process.env.ENDPOINT_URL.split(",");
    let listModel = [];
    for (let i = 0; i < listEndpoint.length; i++) {
      try {
        const endpoint = listEndpoint[i];
        const response = await axios.get(`http://${endpoint}/info`, {
          timeout: 10000,
        });
        const model = response?.data?.model_name;
        listModel.push(model || null);
      } catch (error) {
        listModel.push(null);
        console.log(error);
      }
    }
    axios({
      baseURL: `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`,
      url: "/sendMessage",
      method: "post",
      data: {
        chat_id: process.env.TELEGRAM_GROUP_ID,
        message_thread_id: process.env.TELEGRAM_THREAD_ID,
        text: `${listEndpoint
          .map((e, index) => {
            return `http://${e}/info ${listModel[index]} ${
              listModel[index] == null ? process.env.TELEGRAM_TAG : ""
            }\n`;
          })
          .join("")}`,
        parse_mode: "html",
        disable_web_page_preview: true,
      },
      headers: {
        "Content-Type": "application/json",
        "cache-control": "no-cache",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.log(error);
  }
};
const fetchRegPrice = async () => {
  try {
    const resp = await axios.get(
      "https://taomarketcap.com/api/subnets/23/sidebar/v2",
      {
        headers: {
          accept: "*/*",
          "accept-language": "en-US,en;q=0.9",
        },
        referrer: "https://taomarketcap.com/subnets/23/registration",
        referrerPolicy: "strict-origin-when-cross-origin",
        withCredentials: false, // Equivalent to `credentials: "omit"`
      }
    );
    const taomkc = resp.data;
    console.log(taomkc);
    await axios({
      baseURL: `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`,
      url: "/sendMessage",
      method: "post",
      data: {
        chat_id: process.env.TELEGRAM_GROUP_ID,
        message_thread_id: process.env.TELEGRAM_THREAD_ID,
        text: `TaoMarketCap
${taomkc.registrationsThisInterval}/3 Slots
Fee: ${taomkc.burn}
`,
        // ${
        //   +taomkc.burn <= +process.env.MAX_REG_PRICE &&
        //   +taomkc.registrationsThisInterval == 3
        //     ? process.env.TELEGRAM_TAG
        //     : ""
        // }
        // Remain block: ${taomkc.blocksUntilNextEpoch}
        parse_mode: "html",
        disable_web_page_preview: true,
      },
      headers: {
        "Content-Type": "application/json",
        "cache-control": "no-cache",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.log(error);
  }
};
// cron.schedule("*/5 * * * *", () => {
//   console.log("Fetching endpoint");
//   fetchMetagraph();
// });
// cron.schedule("*/10 * * * *", () => {
//   console.log("Fetching endpoint");
//   fetchRegPrice();
// });

fetchRegPrice();
