import './styles/styles.css'
import GameController from './GameController.js';

GameController.init(document.getElementById("scene"));
window.Game = GameController;
window.PIXI = PIXI;

javascript:(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()
