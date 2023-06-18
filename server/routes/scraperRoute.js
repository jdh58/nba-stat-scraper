import express from 'express';
import * as NBAController from '../controllers/NBAscraperController.js';

const route = express.Router();

route.get('/nba/:playerName', NBAController.getPlayer);

export default route;
