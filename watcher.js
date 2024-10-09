const pm2 = require("pm2");
const axios = require("axios");

const errorThreshold = 5;
const logLineLimit = 50;
const args = process.argv.slice(2);
const proc = args[0];
const message = args[1];
const botToken = args[2];
const chatId = args[3];
const threadId = args[4];
const tag = args[5];
const blacklistedError = args[6];

let isWaitingForRestart = false;

const sendTelegramMessage = async () => {
  axios({
    baseURL: `https://api.telegram.org/bot${botToken}`,
    url: "/sendMessage",
    method: "post",
    data: {
      chat_id: chatId,
      message_thread_id: threadId,
      text: `${tag} DDOS detected ${message} <code>${proc}</code>`,
      parse_mode: "html",
      disable_web_page_preview: true,
    },
    headers: {
      "Content-Type": "application/json",
      "cache-control": "no-cache",
      "Access-Control-Allow-Origin": "*",
    },
  });
};

function monitorLogsAndRestart() {
  let errorCount = 0;
  let logLineCount = 0;

  pm2.connect((err) => {
    if (err) {
      console.error(`Error connecting to PM2: ${err}`);
      process.exit(2);
    }

    pm2.launchBus((err, bus) => {
      if (err) {
        console.error(`Error launching PM2 bus: ${err}`);
        process.exit(2);
      }

      console.log(`Monitoring logs for ${proc}...`);

      bus.on("log:out", (packet) => {
        if (packet.process.pm_id == proc && logLineCount < logLineLimit) {
          const logLine = packet.data;
          logLineCount++;

          // Check if the log contains the blacklisted error
          if (logLine.toLowerCase().includes(blacklistedError)) {
            errorCount++;
            console.log(`Detected error in ${proc}: ${logLine.trim()}`);
          }

          // Stop monitoring after capturing 30 lines
          if (logLineCount >= logLineLimit) {
            console.log(
              `Captured ${logLineLimit} lines for ${proc}. Stopping log monitoring...`
            );
            bus.close();

            // If error count exceeds threshold, initiate a 3-minute wait before restarting
            if (errorCount > errorThreshold) {
              console.log(
                `${proc} has ${errorCount} blacklisted errors. Waiting 3 minutes before restarting ${restartInstance1}...`
              );
              sendTelegramMessage();
            } else {
              console.log(`No need to restart based on logs from ${proc}.`);
            }
          }
        }
      });
    });
  });
}

const runLogChecks = async () => {
  if (isWaitingForRestart) {
    console.log("Waiting for restart, log check paused...");
    return;
  }
  console.log("Starting new log check cycle...");
  monitorLogsAndRestart();
};

// Start the interval to check logs every minute
setInterval(runLogChecks, 60 * 1000);

// Run the first check immediately
runLogChecks();
