import WebGL from 'three/addons/capabilities/WebGL.js';
import { MainScene } from './main-scene';
import { Controller } from './controller';

if ( WebGL.isWebGLAvailable() ) {
	const screenMeasures = {
		height: window.screen.availHeight,
		width: window.screen.availWidth
	}

	const scene = new MainScene();
	const controller = new Controller(5, screenMeasures);

	scene.start(controller, screenMeasures);
	controller.register(scene);

	window.controller = controller;
} else {

	const warning = WebGL.getWebGLErrorMessage();
	document.getElementById( 'container' ).appendChild( warning );

}