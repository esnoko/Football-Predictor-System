import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
import json

# Load historical match data
def load_data():
    with open('preprocessedHistoricalMatches.json', 'r') as file:
        data = json.load(file)
    return pd.DataFrame(data)

# Prepare features and target
def prepare_data(df):
    df['homeGoals'] = df['homeGoals'].astype(int)
    df['awayGoals'] = df['awayGoals'].astype(int)

    # Create average goals scored in the last 5 matches
    df['home_goal_avg'] = df['homeGoals'].rolling(window=5).mean().shift(1)
    df['away_goal_avg'] = df['awayGoals'].rolling(window=5).mean().shift(1)

    # Add more features (Example: goal difference)
    df['goal_diff'] = df['homeGoals'] - df['awayGoals']
    df = df.dropna()  # Remove rows with NaN values
    X = df[['home_goal_avg', 'away_goal_avg', 'goal_diff']]  # Features
    y = df['result']  # Target variable
    return X, y


# Train and evaluate the model
def train_model(X, y):
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
    model = LogisticRegression()
    model.fit(X_train, y_train)
    predictions = model.predict(X_test)
    
    accuracy = accuracy_score(y_test, predictions,)

    # Return predictions and accuracy for Node.js to capture
    return predictions.tolist(), accuracy * 100  # Convert accuracy to percentage

if __name__ == "__main__":
    data = load_data()  # Load data
    X, y = prepare_data(data)  # Prepare features and target
    predictions, accuracy = train_model(X, y)  # Train and evaluate model

    # Output the results in JSON format
    result = {
        'predictions': predictions,
        'accuracy': accuracy
    }
    print(json.dumps(result))  # Print as JSON for Node.js to capture
