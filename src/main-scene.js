import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { MeshLine, MeshLineMaterial } from 'three.meshline';
import { BaseScene } from './base-scene';
import TWEEN, { Tween } from 'three-tween';

class AnimatedLine {
    constructor(points, name, label='', labelPosition=null, labelStyle={}, hideVector=null) {
        this.points = points;
        this.hideVector = hideVector;
    
        const pointsGeometry = new THREE.BufferGeometry().setFromPoints( this.points );
        const line = new MeshLine();
        line.setGeometry(pointsGeometry);
    
        this.lineMesh = new THREE.Mesh(line, new MeshLineMaterial({ 
            color: 0xffffff,
            lineWidth: 0.1,
        }))
    
        this.lineMesh.scale.lerp(this.hideVector || new THREE.Vector3(0,0,0), 1);
        this.lineMesh.name = `${name}Line`;
    
        const element = document.createElement('p');

        Object.entries(labelStyle).forEach(([key, value]) => {
            element.style[key] = value;
        })

        element.innerText = label;

        const div = document.createElement('div');
        div.appendChild(element);
        this.labelDom = new CSS3DObject( div );
        this.labelDom.position.lerp(labelPosition, 1);
    
        this.labelDom.scale.lerp(this.hideVector || new THREE.Vector3(0,0,0), 1);
    
        this.labelDom.name = `${name}Label`;
    }

    get line() {
        return this.lineMesh;
    }

    get label() {
        return this.labelDom;
    }

    show(lookAtPosition) {
        new Tween(this.lineMesh.scale)
            .to(
                new THREE.Vector3(1, 1, 1),
                300,
            )
            .easing(TWEEN.Easing.Cubic.InOut)
            .onComplete(() => {
                if(lookAtPosition) {
                    this.labelDom.lookAt(lookAtPosition);
                }
                
                new Tween(this.labelDom.scale)
                    .to(
                        new THREE.Vector3(1, 1, 1),
                        300,
                    )
                    .easing(TWEEN.Easing.Cubic.InOut)
                    .start();
            })
            .start();
    }

    hide() {
        new Tween(this.lineMesh.scale)
            .to(
                this.hideVector || new THREE.Vector3(0, 0, 0),
                300,
            )
            .easing(TWEEN.Easing.Cubic.InOut)
            .start();

        new Tween(this.labelDom.scale)
            .to(
                this.hideVector || new THREE.Vector3(0, 0, 0),
                300,
            )
            .easing(TWEEN.Easing.Cubic.InOut)
            .start();
    }
}

export class MainScene extends BaseScene {
    constructor() {
        super(() => null, 0);

        this.cleanupInterval = null;
        this.cleanupExecutedTimes = 0;

        this.assetsBasePath = import.meta.env.ASSETS_PATH || '';
    }

    showTitle() {
        document.getElementById('title').getElementsByTagName('h1')[0].innerText = 'Ponte D. Luís';

        document.getElementById('title').classList.remove('position-on-bottom');
        document.getElementById('title').classList.add('position-on-top');
        document.getElementById('title').classList.remove('font-zero');
        document.getElementById('title-bg').classList.add('bg-gradient-fade-in');
        document.getElementById('title-bg').classList.remove('bg-gradient-fade-out');
    }

    hideTitle() {
        document.getElementById('title').classList.add('font-zero');
        document.getElementById('title-bg').classList.add('bg-gradient-fade-out');
        document.getElementById('title-bg').classList.remove('bg-gradient-fade-in');
    }

    showEnding() {
        document.getElementById('title').getElementsByTagName('h1')[0].innerText = 'Até a próxima!';

        document.getElementById('title').classList.remove('position-on-top');
        document.getElementById('title').classList.add('position-on-bottom');
        document.getElementById('title').classList.remove('font-zero');
        document.getElementById('title-bg').classList.add('bg-gradient-fade-in');
        document.getElementById('title-bg').classList.remove('bg-gradient-fade-out');
    }

    showInfo(id) {
        document.getElementById(id).classList.remove('hidden');
        document.getElementById(id).classList.remove('font-zero');

        document.getElementById(id).classList.remove('bg-radial-gradient-fade-out');
        document.getElementById(id).classList.add('bg-radial-gradient-fade-in');
        
        const images = [...(document.getElementById(id).getElementsByTagName('img') || [])];
        images.forEach(image => {
            image.classList.remove('img-fade-out');
            image.classList.add('img-fade-in');
        });
    }

    hideInfo(id) {
        document.getElementById(id).classList.remove('bg-radial-gradient-fade-in');
        document.getElementById(id).classList.add('bg-radial-gradient-fade-out');
        
        const images = [...document.getElementById(id).getElementsByTagName('img')];
        images.forEach(image => {
            image.classList.remove('img-fade-in');
            image.classList.add('img-fade-out');
        });

        setTimeout(() => {
            document.getElementById(id).classList.add('font-zero');
            document.getElementById(id).classList.add('hidden');
        }, 500);
    }

    hydrateSlidesButtonsActions(controller) {
        const nextSlideBt = document.getElementById('next-slide-bt');

        if(this.nextSlideEvent) {
            nextSlideBt.removeEventListener('mouseup', this.nextSlideEvent);
        }

        this.nextSlideEvent = () => {
            console.log('Going to slide ', controller.currSlide + 1)
            controller.goToSlide(controller.currSlide + 1);
        }

        nextSlideBt.addEventListener('mouseup', this.nextSlideEvent);

        const prevSlideBt = document.getElementById('prev-slide-bt');

        if(this.prevSlideEvent) {
            prevSlideBt.removeEventListener('mouseup', this.prevSlideEvent);
        }

        this.prevSlideEvent = () => {
            console.log('Going to slide ', controller.currSlide - 1)
            controller.goToSlide(controller.currSlide - 1);
        }

        prevSlideBt.addEventListener('mouseup', this.prevSlideEvent);
    }

    start(controller, screenMeasures) {
        const skyTexture_ft = new THREE.TextureLoader().load(`${this.assetsBasePath}textures/sky-box-ponte-d-luis/pontedluis_mid.jpg`);
        const skyTexture_bk = new THREE.TextureLoader().load(`${this.assetsBasePath}textures/sky-box-ponte-d-luis/pontedluis_mid.jpg`);
        const skyTexture_up = new THREE.TextureLoader().load(`${this.assetsBasePath}textures/sky-box-ponte-d-luis/pontedluis_sky.jpg`);
        const skyTexture_dn = new THREE.TextureLoader().load(`${this.assetsBasePath}textures/sky-box-ponte-d-luis/pontedluis_dn.jpg`);
        const skyTexture_rt = new THREE.TextureLoader().load(`${this.assetsBasePath}textures/sky-box-ponte-d-luis/pontedluis_mid.jpg`);
        const skyTexture_lf = new THREE.TextureLoader().load(`${this.assetsBasePath}textures/sky-box-ponte-d-luis/pontedluis_mid.jpg`);

        const skyBoxMaterial = [
            new THREE.MeshBasicMaterial({ map: skyTexture_ft, side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ map: skyTexture_bk, side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ map: skyTexture_up, side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ map: skyTexture_dn, side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ map: skyTexture_rt, side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ map: skyTexture_lf, side: THREE.BackSide }),
        ]

        const skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
        const skybox = new THREE.Mesh(skyboxGeo, skyBoxMaterial);
        skybox.name = 'SkyBox';
        this.scene.add(skybox);

        const loader = new GLTFLoader();

        loader.load(
            `${this.assetsBasePath}models/ponte-d-luis/scene.gltf`,
            gltf => {
                gltf.scene.traverse((object) => {
                    if (object.isMesh) {
                        object.material.color = new THREE.Color(1.5, 1.5, 1.5);
                    }
                });

                this.scene.add( gltf.scene );
            },
            undefined,
            error => {
                console.error( error );
            }
        );

        const ponteDLuisFacingDoroTexture = new THREE.TextureLoader().load(`${this.assetsBasePath}textures/scenarios/ponte-d-luis/pontedluis_facing_doro.png`);
        const planeFacingDoroMaterial = new THREE.MeshBasicMaterial({ map: ponteDLuisFacingDoroTexture, transparent: true, color: new THREE.Color(0.15, 0.15, 0.15) });
        planeFacingDoroMaterial.shininess = 100;
        planeFacingDoroMaterial.needsUpdate = true;
        const planeFacingDoro = new THREE.Mesh( new THREE.PlaneGeometry( 140, 60 ), planeFacingDoroMaterial );
        planeFacingDoro.name = 'PlaneFacingDoro';
        planeFacingDoro.translateX(25);
        planeFacingDoro.translateZ(-80);

        this.scene.add( planeFacingDoro );

        const ponteDLuisFacingSeaTexture = new THREE.TextureLoader().load(`${this.assetsBasePath}textures/scenarios/ponte-d-luis/pontedluis_facing_sea.png`);
        const planeFacingSeaMaterial = new THREE.MeshBasicMaterial({ map: ponteDLuisFacingSeaTexture, transparent: true, color: new THREE.Color(0.15, 0.15, 0.15) });
        planeFacingSeaMaterial.shininess = 100;
        planeFacingSeaMaterial.needsUpdate = true;
        const planeFacingSea = new THREE.Mesh( new THREE.PlaneGeometry( 140, 40 ), planeFacingSeaMaterial );
        planeFacingSea.name = 'PlaneFacingSea';
        planeFacingSea.translateX(25);
        planeFacingSea.translateZ(10);
        planeFacingSea.rotateY(180 * (Math.PI/180));

        this.scene.add( planeFacingSea );

        const monasteryTexture = new THREE.TextureLoader().load(`${this.assetsBasePath}textures/scenarios/ponte-d-luis/monastery.png`);
        const monasteryMaterial = new THREE.MeshBasicMaterial({ map: monasteryTexture, transparent: true, color: new THREE.Color(0.15, 0.15, 0.15) });
        monasteryMaterial.shininess = 100;
        monasteryMaterial.needsUpdate = true;
        const monastery = new THREE.Mesh( new THREE.PlaneGeometry( 5, 5 ), monasteryMaterial );
        monastery.name = 'Monastery';
        monastery.translateX(54.569220761085624);
        monastery.translateY(17.563882361480754);
        monastery.translateZ(-39.82250999791923);
        monastery.rotateY(300 * (Math.PI/180));

        this.scene.add( monastery );

        const sunTexture = new THREE.TextureLoader().load(`${this.assetsBasePath}textures/scenarios/ponte-d-luis/sun.png`);
        const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture, transparent: true });
        const sun = new THREE.Mesh( new THREE.PlaneGeometry( 20, 20 ), sunMaterial );
        sun.name = 'Sun';
        sun.translateX(40);
        sun.translateY(200);
        sun.translateZ(-60);
        sun.rotateX(25 * (Math.PI/180));

        this.scene.add( sun );

        const light = new THREE.AmbientLight( 0xffffff );
        this.scene.add( light );

        this.camera.position.x = 13.169796379035336;
        this.camera.position.y = 15.5;
        this.camera.position.z = -10;

        const quaternion = new THREE.Quaternion(0.3727288632633984, 0.11904464228394568, 0.04202315312518834, -0.9193125813537454);

        this.camera.rotation.setFromQuaternion(quaternion); // Apply Quaternion

        this.camera.quaternion.normalize();  // Normalize Quaternion
        
        this.bridgeHeightLine = new AnimatedLine(
            [
                new THREE.Vector3( 23.21228002178978, 10.5, -19.919732115353263 ),
                new THREE.Vector3( 23.21228002178978, 0.5, -19.919732115353263 )
            ],
            'BridgeHeight',
            '52m',
            new THREE.Vector3(28, 4, -20),
            {
                fontSize: '12rem',
                color: '#ffffff',
                fontWeight: 700,
            },
            new THREE.Vector3(1, 0, 1)
        );

        this.scene.add(this.bridgeHeightLine.line);
        this.cssScene.add(this.bridgeHeightLine.label);

        this.bridgeLengthLine = new AnimatedLine(
            [
                new THREE.Vector3( 8, 18, -17.5 ),
                new THREE.Vector3( 32, 18, -23.2 )
            ],
            'BridgeLength',
            '395m',
            new THREE.Vector3(20.5, 18, -21),
            {
                fontSize: '4rem',
                color: '#ffffff',
                fontWeight: 700,
            },
            new THREE.Vector3(0, 1, 0)
        );

        this.scene.add(this.bridgeLengthLine.line);
        this.cssScene.add(this.bridgeLengthLine.label);
        
        this.bridgeWidthLine = new AnimatedLine(
            [
                new THREE.Vector3( 20, 12, -19.8 ),
                new THREE.Vector3( 19.7, 12, -21.1 )
            ],
            'BridgeWidth',
            '8m',
            new THREE.Vector3(
                screenMeasures.width >= 600
                    ? 20
                    : 20.5, 
                12, 
                -20.5
            ),
            {
                fontSize: '4rem',
                color: '#ffffff',
                fontWeight: 700,
            },
            new THREE.Vector3(1, 1, 0)
        );

        this.scene.add(this.bridgeWidthLine.line);
        this.cssScene.add(this.bridgeWidthLine.label);

        this.showInfo('next-slide-bt');

        this.hydrateSlidesButtonsActions(controller);

        super.play();
    }

    play(controller) {  
        if(this.cleanupInterval && this.cleanupExecutedTimes >= 5) {
            clearInterval(this.cleanupInterval);
        }

        this.cleanupInterval = setInterval(() => {
            switch(controller.currSlide) {
                case 1:
                case 5:
                    this.bridgeHeightLine.hide();
                    this.bridgeLengthLine.hide();
                    this.bridgeWidthLine.hide();
                    break;
                case 2:
                    this.bridgeLengthLine.hide();
                    this.bridgeWidthLine.hide();
                    break;
                case 3:
                    this.bridgeHeightLine.hide();
                    this.bridgeWidthLine.hide();
                    break;
                case 4:
                    this.bridgeHeightLine.hide();
                    this.bridgeLengthLine.hide();
                    break;
                default:
                    break;
            }

            this.cleanupExecutedTimes += 1;
        }, 1000);

        this.hydrateSlidesButtonsActions(controller);

        if(controller.currSlide === 1) {
            this.hideInfo('info-1');
            this.hideInfo('info-2');
            this.hideInfo('info-3');
            this.hideInfo('prev-slide-bt');

            this.showTitle();
            this.showInfo('next-slide-bt');

            new Tween(this.camera.position)
                .to(
                    new THREE.Vector3(
                        13.169796379035336,
                        15.5,
                        -10
                    ),
                    1000,
                )
                .easing(TWEEN.Easing.Cubic.InOut)
                .start();

            new Tween(this.camera.rotation)
                .to(
                    new THREE.Vector3(
                        -0.7864857560139421,
                        -0.188669315763931,
                        -0.16982173667081665
                    ),
                    1000,
                )
                .easing(TWEEN.Easing.Cubic.InOut)
                .start();
        }
        if(controller.currSlide === 2) {
            this.hideTitle();
            this.hideInfo('info-2');
            this.hideInfo('info-3');

            this.showInfo('info-1');
            this.showInfo('next-slide-bt');
            this.showInfo('prev-slide-bt');

            new Tween(this.camera.position)
                .to(
                    new THREE.Vector3(
                        11.511698730236454, 
                        11.310895723652685, 
                        -14.152921728052107
                    ),
                    1000,
                )
                .easing(TWEEN.Easing.Cubic.InOut)
                .start();

            new Tween(this.camera.rotation)
                .to(
                    new THREE.Vector3(
                        Math.PI * -55 / 180,
                        Math.PI * -50 / 180,
                        Math.PI * -50 / 180,
                    ),
                    1000,
                )
                .easing(TWEEN.Easing.Cubic.InOut)
                .onComplete(() => {
                    this.bridgeHeightLine.show(this.camera.position);
                })
                .start();
        }
        if(controller.currSlide === 3) {
            this.hideInfo('info-1');
            this.hideInfo('info-3');
            this.hideTitle();

            this.showInfo('info-2');
            this.showInfo('next-slide-bt');
            this.showInfo('prev-slide-bt');

            new Tween(this.camera.position)
                .to(
                    new THREE.Vector3(
                        20,
                        25,
                        -20
                    ),
                    1000,
                )
                .easing(TWEEN.Easing.Cubic.InOut)
                .start();

            new Tween(this.camera.rotation)
                .to(
                    new THREE.Vector3(
                        Math.PI * -90 / 180,
                        0,
                        0,
                    ),
                    1000,
                )
                .easing(TWEEN.Easing.Cubic.InOut)
                .onComplete(() => {
                    this.bridgeLengthLine.show();
                    this.bridgeLengthLine.labelDom.rotation.setFromVector3(new THREE.Vector3(
                        90 * (Math.PI/180),
                        180 * (Math.PI/180),
                        195 * (Math.PI/180)
                    ))
                })
                .start();
        }
        if(controller.currSlide === 4) {
            this.hideInfo('info-1');
            this.hideInfo('info-2');
            this.hideTitle();

            this.showInfo('info-3');
            this.showInfo('next-slide-bt');
            this.showInfo('prev-slide-bt');

            new Tween(this.camera.position)
                .to(
                    new THREE.Vector3(
                        controller.screenMeasures.width >= 600
                            ? 20
                            : 21,
                        controller.screenMeasures.width >= 600
                            ? 15
                            : 16,
                        -20
                    ),
                    1000,
                )
                .easing(TWEEN.Easing.Cubic.InOut)
                .start();

            new Tween(this.camera.rotation)
                .to(
                    new THREE.Vector3(
                        Math.PI * -90 / 180,
                        0,
                        Math.PI * 102 / 180,
                    ),
                    1000,
                )
                .easing(TWEEN.Easing.Cubic.InOut)
                .onComplete(() => {
                    this.bridgeWidthLine.show();
                    this.bridgeWidthLine.labelDom.rotation.setFromVector3(new THREE.Vector3(
                        90 * (Math.PI/180),
                        180 * (Math.PI/180),
                        -77 * (Math.PI/180)
                    ))
                })
                .start();
        }
        if(controller.currSlide >= 5) {
            this.hideInfo('info-1');
            this.hideInfo('info-2');
            this.hideInfo('info-3');
            this.hideInfo('next-slide-bt');

            this.showInfo('prev-slide-bt');

            new Tween(this.camera.position)
                .to(
                    new THREE.Vector3(
                        20,
                        25,
                        -35
                    ),
                    1000,
                )
                .easing(TWEEN.Easing.Cubic.InOut)
                .start();

            new Tween(this.camera.rotation)
                .to(
                    new THREE.Vector3(
                        Math.PI * -120 / 180,
                        0,
                        Math.PI * 180 / 180,
                    ),
                    1000,
                )
                .easing(TWEEN.Easing.Cubic.InOut)
                .onComplete(() => {
                    this.showEnding();
                })
                .start();
        }
    }
}
