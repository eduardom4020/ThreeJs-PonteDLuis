import * as THREE from 'three';
import { CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import TWEEN from 'three-tween';


const animate = animationHandler => (scene, camera, animationQeue, renderer, controls) => () => {
	requestAnimationFrame( animate(animationHandler)(scene, camera, animationQeue, renderer, controls) );
    
    animationHandler(scene, camera, animationQeue, renderer, controls); 
   
	renderer.render( scene, camera );

    TWEEN.update();
}

export class BaseScene {
    constructor(animationHandler, cameraPosition=5) {
        this.animationQeue = [];
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 11000 );
        this.camera.position.z = cameraPosition;

        this.renderer = new THREE.WebGLRenderer({alpha: true});
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.domElement.style.position = 'fixed';
        this.renderer.domElement.style.top = 0;

        this.cssRenderer = new CSS3DRenderer();

        this.cssRenderer.setSize(window.innerWidth, window.innerHeight);

        this.cssRenderer.domElement.style.position = 'fixed';
        this.cssRenderer.domElement.style.top = 0;

        this.cssRenderer.domElement.style.zIndex = 1;
        this.renderer.domElement.style.zIndex = 0;

        document.body.appendChild(this.cssRenderer.domElement);
        this.cssRenderer.domElement.appendChild(this.renderer.domElement);

        this.cssScene = new THREE.Scene();

        document.body.appendChild( this.renderer.domElement );
        document.body.appendChild( this.cssRenderer.domElement);

        this.animationHandler = animationHandler;
    }

    executeAnimationFrame(scene, camera, animationQeue, renderer, controls) {
        animate(this.animationHandler)(scene, camera, animationQeue, renderer, controls)();
    }

    play() {
        this.executeAnimationFrame(this.scene, this.camera, this.animationQeue, this.renderer, this.controls);
        this.executeAnimationFrame(this.cssScene, this.camera, this.animationQeue, this.cssRenderer, this.controls);
    }
}
