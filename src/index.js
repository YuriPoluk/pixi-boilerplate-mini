import './styles/styles.css'
import GameController from './GameController.js';

GameController.init(document.getElementById("scene"));
window.Game = GameController;
window.PIXI = PIXI;