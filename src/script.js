import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as dat from "dat.gui";

const gui = new dat.GUI();
const canvas = document.querySelector("canvas.webgl");
const scene = new THREE.Scene();
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};
let camera, pointLight, model, mixer, controls, renderer;
const clock = new THREE.Clock();

const init = () => {
	scene.background = new THREE.Color(0x2a3b4c);

	const newMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
	pointLight = new THREE.DirectionalLight(0xffffff, 0.5);
	pointLight.position.x = 2;
	pointLight.position.y = 3;
	pointLight.position.z = 11;
	pointLight.castShadow = true;
	scene.add(pointLight);

	const lightFolder = gui.addFolder("Light");
	lightFolder.add(pointLight.position, "x");
	lightFolder.add(pointLight.position, "y");
	lightFolder.add(pointLight.position, "z");
	lightFolder.add(pointLight, "intensity");

	camera = new THREE.PerspectiveCamera(
		40,
		sizes.width / sizes.height,
		0.3,
		100
	);
	camera.position.x = 0;
	camera.position.y = 1;
	camera.position.z = 50;
	scene.add(camera);
	pointLight.position.copy(camera.position);

	const cameraFolder = gui.addFolder("Camera");
	cameraFolder.add(camera.position, "x");
	cameraFolder.add(camera.position, "y");
	cameraFolder.add(camera.position, "z");

	controls = new OrbitControls(camera, canvas);
	controls.enableDamping = true;
	controls.enablePan = false;
	controls.addEventListener("change", light_update);

	function light_update() {
		pointLight.position.copy(camera.position);
	}

	renderer = new THREE.WebGLRenderer({
		canvas: canvas,
	});
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

	const loader = new GLTFLoader();
	loader.load(
		"./ImageToStl.com_beating-heart-v004a-animated.glb",
		(gltfscene) => {
			model = gltfscene.scene;
			mixer = new THREE.AnimationMixer(model);

			model.traverse((o) => {
				if (o.isMesh) o.material = newMaterial;
			});
			scene.add(model);

			const animation = gltfscene.animations[0];
			const action = mixer.clipAction(animation);
			action.play();

			console.dir(animation);
		}
	);
};

const tick = () => {
	const deltaTime = clock.getDelta();

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);

	// Update Orbital Controls
	controls.update();

	// Update objects
	if (mixer !== undefined) {
		mixer.update(deltaTime * 2.01);
	}

	// Render
	renderer.render(scene, camera);
};

//Event Listeners.
window.addEventListener("resize", () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

init();
tick();
