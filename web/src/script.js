import GUI from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

const fireFragment = `
  // fireFragment.glsl
uniform float uTime;
varying vec2 vUv;

// Simple 2D noise
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);

  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(a, b, u.x) +
         (c - a) * u.y * (1.0 - u.x) +
         (d - b) * u.x * u.y;
}

void main() {
  vec2 uv = vUv;

  // Move noise upward
  float n = noise(vec2(uv.x * 3.0, uv.y * 5.0 - uTime * 2.0));

  // Shape flame (narrow at top)
  float flame = smoothstep(0.2, 1.0, uv.y);
  flame *= smoothstep(1.0, 0.3, abs(uv.x - 0.5) * 2.0);

  float intensity = n * flame;

  vec3 color = mix(
    vec3(1.0, 0.2, 0.0), // red
    vec3(1.0, 0.9, 0.3), // yellow
    intensity
  );

  gl_FragColor = vec4(color, intensity);
}

`;

const fireVertex = `
// fireVertex.glsl
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

`;

const loadingScreen = document.getElementById("loading-screen");

const loadingManager = new THREE.LoadingManager(() => {
  loadingScreen.style.display = "none";
});
/**
 * Base
 */
// Debug;
// const gui = new GUI({
//   width: 400,
// });

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader(loadingManager);

// Draco loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("draco/");

// GLTF loader
const gltfLoader = new GLTFLoader(loadingManager);
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * Materials
 */
// Baked material
const bakedTexture = textureLoader.load("baked-3-99.webp");
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture });
bakedTexture.flipY = false;
bakedTexture.colorSpace = THREE.SRGBColorSpace;

const bgTexture = textureLoader.load("bg-baked-3.jpg");
const bgMaterial = new THREE.MeshBasicMaterial({ map: bgTexture });
bgTexture.flipY = false;
bgTexture.colorSpace = THREE.SRGBColorSpace;

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

/**
 * Model
 */
const fireGeometry = new THREE.PlaneGeometry(0.8, 0.8, 1, 1);

const fireMaterial = new THREE.ShaderMaterial({
  vertexShader: fireVertex,
  fragmentShader: fireFragment,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  uniforms: {
    uTime: { value: 0 },
  },
});

const basicMaterial = new THREE.MeshBasicMaterial({
  color: "#ff0000",
});

const fireGroup = new THREE.Group();
const fire1 = new THREE.Mesh(fireGeometry, fireMaterial);
const fire2 = new THREE.Mesh(fireGeometry, fireMaterial);
fire2.rotation.y = Math.PI;
fireGroup.add(fire1, fire2);

// Position inside fireplace
fireGroup.position.set(-1.4, 0.9, -0.3);
fireGroup.rotation.y = 1.5;
// console.log(fire);
// const fireFolder = gui.addFolder("🔥 Fire");

// fireFolder.add(fire2.position, "x", -5, 5, 0.01);
// fireFolder.add(fire2.position, "y", 0, 5, 0.01);
// fireFolder.add(fire2.position, "z", -5, 5, 0.01);

// fireFolder.add(fire.rotation, "y", -Math.PI, Math.PI, 0.01);
// fireFolder.add(fire.rotation, "x", -Math.PI / 2, Math.PI / 2, 0.01);

// fireFolder.add(fire.scale, "x", 0.1, 3, 0.01);
// fireFolder.add(fire.scale, "y", 0.1, 3, 0.01);

// fireFolder.add(fire, "visible");

scene.add(fireGroup);
let cdMesh = null;
let vinylneedleMesh = null;
const vinylTexture = textureLoader.load("/viny-cd.png");
vinylTexture.colorSpace = THREE.SRGBColorSpace;

const vinylMaterial = new THREE.MeshBasicMaterial({
  map: vinylTexture,
});

const lidMaterial = new THREE.MeshBasicMaterial({
  color: "#565656",
  transparent: true, // 🔥 required
  opacity: 0.2, // adjust (0.25–0.5)

  depthWrite: false,
  side: THREE.DoubleSide, // 🔥 critical for clean transparency
});

const room = new THREE.Group();
const bg = new THREE.Group();

gltfLoader.load("bg.glb", (gltf) => {
  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      child.material = bgMaterial;
    }
  });

  bg.add(gltf.scene);
  scene.add(bg);
});
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

  cdMesh = gltf.scene.children.find((child) => child.name === "vinyl-cd-m");

  const vinylLidMesh = gltf.scene.children.find(
    (child) => child.name === "vinyl-lid-m"
  );

  vinylneedleMesh = gltf.scene.children.find(
    (child) => child.name === "vinly-needle-m"
  );

  starLightMesh.material = starLightMaterial;
  fairyLightMesh.material = fairyLightMaterial;
  candleLightMesh.material = starLightMaterial;
  lamp1LightMesh.material = starLightMaterial;
  lamp2LightMesh.material = starLightMaterial;
  tree1LightMesh.material = tree1LightMaterial;
  tree2LightMesh.material = tree2LightMaterial;
  cdMesh.material = vinylMaterial;
  vinylLidMesh.material = lidMaterial;
});

// Particles
const snowGroup = new THREE.Group();
scene.add(snowGroup); // or room.add(snowGroup)

const snowRadius = 8; // width/depth around scene
const snowHeight = 6; // how tall snow spawns
const snowCount = 300; // good for performance
const snowGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(snowCount * 3);
const velocities = new Float32Array(snowCount);

for (let i = 0; i < snowCount; i++) {
  const i3 = i * 3;

  positions[i3] = (Math.random() - 0.5) * snowRadius * 2;
  positions[i3 + 1] = Math.random() * snowHeight;
  positions[i3 + 2] = (Math.random() - 0.5) * snowRadius * 2;

  velocities[i] = Math.random() * 0.001 + 0.01;
}
snowGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
const snowMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.1,
  transparent: true,
  opacity: 0.8,
  depthWrite: false,
});

const snow = new THREE.Points(snowGeometry, snowMaterial);

snowGroup.add(snow);

function updateSnow() {
  const positions = snow.geometry.attributes.position.array;

  for (let i = 0; i < snowCount; i++) {
    const i3 = i * 3;

    positions[i3 + 1] -= velocities[i];

    // reset snow when it falls below scene
    if (positions[i3 + 1] < 0) {
      positions[i3 + 1] = snowHeight;
      positions[i3 + 0] = (Math.random() - 0.5) * snowRadius * 2;
      positions[i3 + 2] = (Math.random() - 0.5) * snowRadius * 2;
    }
  }

  snow.geometry.attributes.position.needsUpdate = true;
}

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
controls.minDistance = 8;
controls.maxDistance = 15;

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
const vinylSpeed = 0.5;
const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();
  fireMaterial.uniforms.uTime.value = clock.getElapsedTime() * 2;
  if (cdMesh) {
    cdMesh.rotation.y = elapsedTime * vinylSpeed;
  }
  updateSnow();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
