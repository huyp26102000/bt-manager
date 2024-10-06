const express = require("express");
const nvidia = require("node-nvidia-smi");
const app = express();
const args = process.argv.slice(2);
const endpointPort = args.slice(1, args.length);
const port = args[0];
if (!port) {
  console.error("No port provided");
  process.exit(1);
}
app.use(express.json());

// Basic route
app.get("/gpus/info", async (req, res) => {
  try {
    const gpus = await new Promise((resolve, reject) => {
      nvidia((err, data) => {
        if (err) {
          console.error("Error fetching GPU info:", err);
          return reject(err);
        }
        const gdata = data?.nvidia_smi_log?.gpu;
        console.log("GPU Info:", gdata[0]);
        if (gdata?.length === 0) {
          return reject(new Error("No GPU found"));
        }
        resolve({
          name: gdata[0].product_name,
          gpus: gdata.map((gpu) => {
            const productName = gpu.product_name;
            const uuid = gpu.uuid;
            const pciBus = gpu.pci.pci_bus_id;
            const powerDraw = gpu.gpu_power_readings.power_draw;
            const maxPower = gpu.gpu_power_readings.current_power_limit;
            const temperature = gpu.temperature.gpu_temp;
            const fanSpeed = gpu.fan_speed;
            const memoryUsed = gpu.fb_memory_usage.used;
            const memoryTotal = gpu.fb_memory_usage.total;
            const utilization = gpu.utilization.gpu_util;
            return {
              uuid,
              pciBus,
              powerDraw,
              maxPower,
              temperature,
              fanSpeed,
              memoryUsed,
              memoryTotal,
              utilization,
            };
          }),
        });
      });
    });
    const fetchInfoFromEndpoints = async () => {
        const results = await Promise.all(
            endpointPort.map(async (epPort) => {
                try {
                    const response = await fetch(`http://localhost:${epPort}/info`);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch from port ${epPort}`);
                    }
                    return await response.json();
                } catch (error) {
                    console.error(`Error fetching from port ${epPort}:`, error);
                    return null;
                }
            })
        );
        return results.filter((result) => result !== null);
    };

    const endpointData = await fetchInfoFromEndpoints();
    console.log(endpointData)

    return res.status(200).send(gpus);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
