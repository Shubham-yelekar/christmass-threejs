import GUI from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

/**
 * Base
 */
// Debug
const gui = new GUI({
  width: 400,
});

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader();

// Draco loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("draco/");

// GLTF loader
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * Materials
 */
// Baked material
const bakedTexture = textureLoader.load("baked-3.jpg");
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture });
bakedTexture.flipY = false;
bakedTexture.colorSpace = THREE.SRGBColorSpace;

const lightColors = {
  starLight: "#ffffe5",
  tree1Light: "#fdfdce",
  tree2Light: "#ffffe5",
  fairyLight: "#def1fc",
};

// star light material
const starLightMaterial = new THREE.MeshBasicMaterial({
  color: lightColors.starLight,
});
const tree1LightMaterial = new THREE.MeshBasicMaterial({
  color: lightColors.tree1Light,
});
const tree2LightMaterial = new THREE.MeshBasicMaterial({
  color: lightColors.tree2Light,
});
const fairyLightMaterial = new THREE.MeshBasicMaterial({
  color: lightColors.fairyLight,
});

/**
 * Object
 */
// const cube = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1, 1),
//     new THREE.MeshBasicMaterial()
// )

// scene.add(cube)

/**
 * Model
 */

const room = new THREE.Group();

gltfLoader.load("christmass-scene-3-merged.glb", (gltf) => {
  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      child.material = bakedMaterial;
    }
  });
  room.add(gltf.scene);
  room.rotation.y = 0;
  scene.add(room);

  const starLightMesh = gltf.scene.children.find(
    (child) => child.name === "star"
  );
  const candleLightMesh = gltf.scene.children.find(
    (child) => child.name === "candle-light"
  );
  const fairyLightMesh = gltf.scene.children.find(
    (child) => child.name === "fairy-lights"
  );
  const lamp1LightMesh = gltf.scene.children.find(
    (child) => child.name === "lamp-light-1"
  );
  const lamp2LightMesh = gltf.scene.children.find(
    (child) => child.name === "lamp-light-2"
  );
  const tree1LightMesh = gltf.scene.children.find(
    (child) => child.name === "tree-1"
  );
  const tree2LightMesh = gltf.scene.children.find(
    (child) => child.name === "tree-2"
  );
  starLightMesh.material = starLightMaterial;
  fairyLightMesh.material = fairyLightMaterial;
  candleLightMesh.material = starLightMaterial;
  lamp1LightMesh.material = starLightMaterial;
  lamp2LightMesh.material = starLightMaterial;
  tree1LightMesh.material = tree1LightMaterial;
  tree2LightMesh.material = tree2LightMaterial;

  const fireLightMesh = gltf.scene.children.find(
    (child) => child.name === "fireplace-fire"
  );
  console.log(fireLightMesh);
});

// Particles

const snowGeometry = new THREE.BufferGeometry();
const snowCount = 2000;
const positions = new Float32Array(snowCount * 3);
const velocities = new Float32Array(snowCount * 3);

for (let i = 0; i < snowCount * 3; i += 3) {
  positions[i] = (Math.random() - 0.5) * 200;
  positions[i + 1] = Math.random() * 100;
  positions[i + 2] = (Math.random() - 0.5) * 200;
  velocities[i + 1] = -Math.random() * 2 - 0.5;
}
snowGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
const snowMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 2,
  transparent: true,
  opacity: 0.8,
});

const snow = new THREE.Points(snowGeometry, snowMaterial);
scene.add(snow);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

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

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  25,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(10, 8, -10);
scene.add(camera);

function clampCamera() {
  camera.position.x = THREE.MathUtils.clamp(camera.position.x, 6, 14);
  camera.position.y = THREE.MathUtils.clamp(camera.position.y, 5, 10);
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, -16, -6);
}

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.target.set(0, 1.5, 0);

controls.enablePan = false;
// Horizontal rotation (left-right)
controls.minAzimuthAngle = Math.PI / 2;
controls.maxAzimuthAngle = Math.PI;

// Vertical rotation (no top / no bottom)
controls.minPolarAngle = Math.PI / 3;
controls.maxPolarAngle = Math.PI / 2.05;

// Zoom limits
controls.minDistance = 12;
controls.maxDistance = 24;

// IMPORTANT
controls.update();
clampCamera();
/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
