document.getElementById('prediction-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const homeTeam = document.getElementById('homeTeam').value;
  const awayTeam = document.getElementById('awayTeam').value;
  const matchCount = document.getElementById('matchCount').value;

  try {
    const response = await fetch('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ homeTeam, awayTeam, matchCount }),
    });

    const data = await response.json();
    console.log("Response Data:", data);

    if (response.ok) {
      document.getElementById('predictionResult').innerHTML = `
        <p><strong>Prediction:</strong> ${data.message || "Prediction complete"}</p>
        <p><strong>Predicted Outcome:</strong> ${data.predictedOutcome || "No outcome available"}</p>
        <p><strong>Model Accuracy:</strong> ${data.modelAccuracy !== undefined ? data.modelAccuracy : "N/A"}</p>
      `;
    } else {
      document.getElementById('predictionResult').innerText = 'Error fetching prediction.';
    }
  } catch (error) {
    console.error('Error fetching prediction:', error);
    document.getElementById('predictionResult').innerText = 'Error fetching prediction.';
  }
});
