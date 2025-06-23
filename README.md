# Football Predictor

A web application that predicts the outcome of English Premier League football matches using historical data and machine learning.

## Features

- Fetches and preprocesses historical match data from the Football-Data.org API.
- Trains a logistic regression model (Python, scikit-learn) to predict match outcomes.
- Interactive web interface for users to select teams and number of recent matches to analyze.
- Displays predicted outcome and model accuracy.

## Project Structure

- [`dataFetcher.js`](dataFetcher.js): Fetches and preprocesses match data, coordinates prediction workflow.
- [`predictor.py`](predictor.py): Python script for training and running the machine learning model.
- [`server.js`](server.js): Express server that handles API requests and runs the prediction pipeline.
- [`public/`](public/): Static frontend files ([`index.html`](public/index.html), [`script.js`](public/script.js), [`styles.css`](public/styles.css)).
- [`preprocessedHistoricalMatches.json`](preprocessedHistoricalMatches.json), [`historicalMatches.json`](historicalMatches.json), [`matchData.json`](matchData.json): Data files used for predictions.

## Setup

### Prerequisites

- Node.js (v16+ recommended)
- Python 3.x
- Install Python dependencies:
  ```sh
  pip install pandas scikit-learn
  ```

### Installation

1. Clone the repository.
2. Install Node.js dependencies:
   ```sh
   npm install
   ```

### Running the Application

Start the server (this will also run the Python predictor as needed):

```sh
node server.js
```

Open your browser and go to [http://localhost:3000](http://localhost:3000).

## Usage

1. Enter the home team, away team, and number of recent matches to analyze.
2. Click "Get Prediction".
3. View the predicted outcome and model accuracy.

## Notes

- The project uses the Football-Data.org API. You may need to update the API key in [`dataFetcher.js`](dataFetcher.js).
- The machine learning model is retrained each time a prediction is requested.

## License

ISC

---