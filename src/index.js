import MatchPredictor from './predictor.js';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const predictor = new MatchPredictor();

app.post('/predict', (req, res) => {
    const { homeTeam, awayTeam } = req.body;
    const prediction = predictor.predictMatch(homeTeam, awayTeam);
    res.json(prediction);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 