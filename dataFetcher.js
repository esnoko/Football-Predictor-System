import axios from "axios";
import fs from "fs";
import promptSync from "prompt-sync";
import chalk from "chalk";
import { exec } from "child_process"; // Import exec using ES module syntax

// Initialize prompt
const prompt = promptSync();

// Function to fetch historical match data for specified teams
async function fetchHistoricalData(homeTeam, awayTeam) {
  const apiKey = "ef053968622e4736aef1605d60935941"; // Your API key
  const url =
    "https://api.football-data.org/v4/competitions/PL/matches?season=2023";

  try {
    const response = await axios.get(url, {
      headers: {
        "X-Auth-Token": apiKey,
        Accept: "application/json",
      },
    });

    // Filter matches played by the specified teams
    const matches = response.data.matches
      .filter(
        (match) =>
          match.homeTeam.name === homeTeam ||
          match.awayTeam.name === homeTeam ||
          match.homeTeam.name === awayTeam ||
          match.awayTeam.name === awayTeam
      )
      .map((match) => ({
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        result:
          match.score.fullTime.home > match.score.fullTime.away
            ? "home win"
            : match.score.fullTime.home < match.score.fullTime.away
            ? "away win"
            : "draw",
        date: new Date(match.utcDate).toLocaleString(),
        homeGoals: match.score.fullTime.home,
        awayGoals: match.score.fullTime.away,
      }));

    // Saving historical match data to a JSON file
    fs.writeFileSync(
      "historicalMatches.json",
      JSON.stringify(matches, null, 2),
      "utf-8"
    );
    console.log(
      chalk.green(
        `Historical match data for ${homeTeam} and ${awayTeam} saved to historicalMatches.json`
      )
    );
  } catch (error) {
    console.error(chalk.red("Error fetching historical data:", error.message));
  }
}

// Function to preprocess historical match data
async function preprocessHistoricalData() {
  try {
    const historicalMatches = JSON.parse(
      fs.readFileSync("historicalMatches.json", "utf-8")
    );

    const preprocessedData = historicalMatches.map((match) => ({
      homeTeam: match.homeTeam.trim(),
      awayTeam: match.awayTeam.trim(),
      result: match.result,
      date: new Date(match.date),
      homeGoals: match.homeGoals,
      awayGoals: match.awayGoals,
    }));

    fs.writeFileSync(
      "preprocessedHistoricalMatches.json",
      JSON.stringify(preprocessedData, null, 2),
      "utf-8"
    );
    console.log(
      chalk.green(
        "Preprocessed historical match data saved to preprocessedHistoricalMatches.json"
      )
    );
  } catch (error) {
    console.error(
      chalk.red("Error preprocessing historical data:", error.message)
    );
  }
}

// Function to analyze recent form and metrics
function analyzeRecentForm(matches, matchCount) {
  const recentMatches = matches.slice(-matchCount);
  const formData = {
    homeWins: recentMatches.filter((m) => m.result === "home win").length,
    awayWins: recentMatches.filter((m) => m.result === "away win").length,
    draws: recentMatches.filter((m) => m.result === "draw").length,
    homeGoals: recentMatches.reduce((total, m) => total + m.homeGoals, 0),
    awayGoals: recentMatches.reduce((total, m) => total + m.awayGoals, 0),
    totalMatches: recentMatches.length,
  };

  return formData;
}

// Function to fetch upcoming match data and make predictions
async function fetchUpcomingMatchData(homeTeam, awayTeam, matchCount) {
  const apiKey = "ef053968622e4736aef1605d60935941"; // Your API key
  const url =
    "https://api.football-data.org/v4/competitions/PL/matches?matchday=11";

  try {
    const response = await axios.get(url, {
      headers: {
        "X-Auth-Token": apiKey,
        Accept: "application/json",
      },
    });

    const matches = response.data.matches;
    const match = matches.find(
      (m) => m.homeTeam.name === homeTeam && m.awayTeam.name === awayTeam
    );

    if (match) {
      const matchData = {
        matchday: match.matchday,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        date: new Date(match.utcDate).toLocaleString(),
        matchId: match.id,
      };

      console.log(chalk.green("Match data saved to matchData.json"));


      console.log(
        chalk.blue(
          `\nMatchday ${matchData.matchday}: ${matchData.homeTeam} vs ${matchData.awayTeam} on ${matchData.date} (Match ID: ${matchData.matchId})`
        )
      );

      fs.writeFileSync(
        "matchData.json",
        JSON.stringify(matchData, null, 2),
        "utf-8"
      );
      // Load historical data for predictions
      const historicalMatches = JSON.parse(
        fs.readFileSync("preprocessedHistoricalMatches.json", "utf-8")
      );

      const results = historicalMatches.filter(
        (m) =>
          (m.homeTeam === homeTeam && m.awayTeam === awayTeam) ||
          (m.homeTeam === awayTeam && m.awayTeam === homeTeam)
      );

      // Analyzing recent performance
      const formData = analyzeRecentForm(results, matchCount);

      // Calculating performance metrics
      const homeWinPercentage =
        (formData.homeWins / formData.totalMatches) * 100 || 0;
      const awayWinPercentage =
        (formData.awayWins / formData.totalMatches) * 100 || 0;
      const drawPercentage =
        (formData.draws / formData.totalMatches) * 100 || 0;

      // Determine the predicted outcome
      let predictedOutcome;
      if (
        homeWinPercentage > awayWinPercentage &&
        homeWinPercentage >= drawPercentage
      ) {
        predictedOutcome = chalk.green("Home Win");
      } else if (
        awayWinPercentage > homeWinPercentage &&
        awayWinPercentage >= drawPercentage
      ) {
        predictedOutcome = chalk.green("Away Win");
      } else {
        predictedOutcome = chalk.yellow("Draw");
      }

      // Logging predictions with percentages and predicted outcome
      console.log(
        chalk.blue(
          `Predictions based on historical data (last ${matchCount} matches):`
        )
      );

      // Visualize results
      console.log(chalk.blue("\n--- Match Form Visualization ---"));
      console.log(
        chalk.green(`Home Team Wins: ${"█".repeat(formData.homeWins)}`)
      );
      console.log(
        chalk.red(`Away Team Wins: ${"█".repeat(formData.awayWins)}`)
      );
      console.log(chalk.yellow(`Draws: ${"█".repeat(formData.draws)}`));

      console.log(
        chalk.yellow(
          `Home Wins: ${formData.homeWins} (${homeWinPercentage.toFixed(
            2
          )}%), Away Wins: ${formData.awayWins} (${awayWinPercentage.toFixed(
            2
          )}%), Draws: ${formData.draws} (${drawPercentage.toFixed(2)}%)`
        )
      );
      console.log(
        chalk.yellow(
          `Home Goals: ${formData.homeGoals}, Away Goals: ${formData.awayGoals}`
        )
      );
      console.log(chalk.blue(`Predicted Outcome: ${predictedOutcome}`));
    } else {
      console.log(chalk.red("Match not found."));
    }
  } catch (error) {
    console.error(chalk.red("Error fetching data:", error.message));
  }
}

// Main function to execute both data fetching functions
async function run(homeTeam, awayTeam, matchCount) {
  if (isNaN(matchCount) || matchCount <= 0) {
      console.log(chalk.red("Please enter a valid number of matches to analyze."));
      return;
  }

  await fetchHistoricalData(homeTeam, awayTeam);
  await preprocessHistoricalData();
  await fetchUpcomingMatchData(homeTeam, awayTeam, matchCount);

  // Call the Python predictor script after all data fetching and processing
  exec("python predictor.py", (error, stdout, stderr) => {
      if (error) {
          console.error(`Error executing Python script: ${error}`);
          return;
      }
      console.log(`Prediction Output:\n${stdout}`);
  });
}

// Executing the run function
export { run };