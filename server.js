//server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { run } from "./dataFetcher.js";
import { exec } from "child_process";
import bodyParser from "body-parser";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/predict", async (req, res) => {
  const { homeTeam, awayTeam, matchCount } = req.body;

  //Executing data fetch and preprocessing
  await run(homeTeam, awayTeam, matchCount);

  // Executing the Python script and capture the output
  exec("python predictor.py", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing Python script: ${error}`);
      console.error(`stderr: ${stderr}`); //Logging stderr for more details
      res.status(500).json({ error: "Error generating prediction" });
      return;
    }

    console.log("Python script output:", stdout); //Logging stdout to check output format

    //Parsing stdout to extract details
    let output;
    try {
      output = JSON.parse(stdout);
    } catch (err) {
      console.error("Error parsing JSON:", err);
      res.status(500).json({ error: "Error parsing prediction output" });
      return;
    }

    //Checking the structure of the output
    console.log("Parsed prediction output:", output); //Logging the parsed output

    const predictedOutcome = output.predictions[0]; //Adjusting indexing as needed
    const modelAccuracy = output.accuracy;

    //Sending back a detailed response
    res.json({
      message: "Prediction complete",
      predictedOutcome,
      modelAccuracy,
    });
  });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
