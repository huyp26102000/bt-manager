const config = require("./config.json");
const cron = require("node-cron");
const axios = require("axios");
require("dotenv").config();
const fetchMetagraph = async () => {
  try {
    const listEndpoint = JSON.parse(process.env.ENDPOINT_URL);
    let listModel = [];
    for (let i = 0; i < listEndpoint.length; i++) {
      try {
        const stack = listEndpoint[i];
        let stackData = [];
        const endpointData = await Promise.all(
          stack.map(async (e) => {
            try {
              console.log(e);
              const response = await axios.get(`http://${e}/info`, {
                timeout: 1000,
              });
              const model = response?.data?.model_name;
              stackData.push(model);
            } catch (error) {
              stackData.push(null);
              console.log(error);
            }
          })
        );
        listModel.push(stackData);
      } catch (error) {
        console.log(error);
      }
    }
    await axios({
      baseURL: `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`,
      url: "/sendMessage",
      method: "post",
      data: {
        chat_id: process.env.TELEGRAM_GROUP_ID,
        message_thread_id: process.env.TELEGRAM_THREAD_ID,
        text: `${listEndpoint
          .map(
            (e) =>
              `
--------------------------------
${e
  .map((j, index) => {
    return `http://${j}/info ${listModel[index]} ${
      listModel[index] == null ? process.env.TELEGRAM_TAG : ""
    }\n`;
  })
  .join("")}`
          )
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
cron.schedule("*/5 * * * *", () => {
  console.log("Fetching endpoint");
  fetchMetagraph();
});
cron.schedule("*/10 * * * *", () => {
  console.log("Fetching endpoint");
  fetchRegPrice();
});

