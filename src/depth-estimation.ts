import * as THREE from "three";
import { ARButton } from "three/addons/webxr/ARButton.js";

let container;
let camera: THREE.PerspectiveCamera,
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer;
let controller: THREE.XRTargetRaySpace;
let occlusionObject; // The virtual object that will be occluded
init();

function init() {
  container = document.createElement("div");
  document.body.appendChild(container);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    20
  );

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  renderer.xr.enabled = true;

  container.appendChild(renderer.domElement);

  // Create the occluded object (e.g., a red sphere)
  const occlusionMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  occlusionObject = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 32), occlusionMaterial);
  occlusionObject.position.set(0, 0, -1); // Place it in front of the camera
  scene.add(occlusionObject);
  
  // Set up lighting
  const light = new THREE.AmbientLight(0xffffff, 1);
  scene.add(light);

  document.body.appendChild(
    ARButton.createButton(renderer, { 
      requiredFeatures: ["depth-sensing"], // Enable depth sensing
      optionalFeatures: ["hit-test", "hand-tracking"], // Allow hand tracking if available
      depthSensing: {
        usagePreference: ["cpu-optimized", "gpu-optimized"],
        dataFormatPreference: ['luminance-alpha']
      }
    })
  );

  controller = renderer.xr.getController(0);
  scene.add(controller);

  window.addEventListener("resize", onWindowResize);
}

function upscaleDepthMap(depthData: XRCPUDepthInformation) {
  const width = depthData.width;
  const height = depthData.height;
  const depthArray = new Uint8Array(width * height);
  // for (let y = 0; y <  height; y++) {
  //   for (let x = 0; x <  width; x++) {
  //     try {
  //       const normalizedX = Math.min(Math.max(x / width, 0), 1);
  //       const normalizedY = Math.min(Math.max(y / height, 0), 1);
  //       const depth = depthData.getDepthInMeters(normalizedX, normalizedY);
  //       // Normalize depth to a value between 0-255 for grayscale
  //       const normalizedDepth = (depth - minDepth) / (maxDepth - minDepth);
  //       console.log('normalizedDepth', normalizedDepth);
  //       depthArray[y * width + x] = Math.round(normalizedDepth * 255);
  //     } catch(e) {
  //       console.log('error', e);
  //     }
  //   }
  // }

  for (let i = 0; i < depthArray.length; i++) {
    depthArray[i] = (i / depthArray.length) * 255; // Fake increasing depth
  }

  // console.log('depthArray', depthArray.slice(0, 100));

  // Create Three.js texture
  const depthTexture = new THREE.DataTexture(
    depthArray,
    width,
    height,
    THREE.RGBAFormat
  );
  depthTexture.needsUpdate = true;
  
  return depthTexture;
}


function checkOcclusion(depthData, object3D, camera) {
  if (!depthData) return;

  const depthWidth = depthData.width;
  const depthHeight = depthData.height;

  // Convert object position from world space to screen space
  const vector = new THREE.Vector3();
  vector.setFromMatrixPosition(object3D.matrixWorld);
  vector.project(camera); // Converts world coordinates to screen space

  // Convert screen space (-1 to 1) to normalized depth coordinates (0 to 1)
  const normalizedX = (vector.x + 1) / 2;
  const normalizedY = 1 - (vector.y + 1) / 2; // Flip Y-axis

  // Ensure values are clamped within [0,1] range
  const clampedX = Math.min(Math.max(normalizedX, 0), 1);
  const clampedY = Math.min(Math.max(normalizedY, 0), 1);

  try {
    // Get real-world depth at this position (normalized coordinates)
    const realWorldDepth = depthData.getDepthInMeters(clampedX, clampedY);
    const objectDepth = object3D.position.distanceTo(camera.position); // Distance from camera

    // Hide object if it's behind a real-world surface
    object3D.visible = objectDepth <= realWorldDepth;
  } catch (error) {
    console.log('clampedX', clampedX, 'clampedY', clampedY);
    console.error("Error getting depth for occlusion check:", error);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(_time, frame: XRFrame) {
  if (!frame) return;

  const session = renderer.xr.getSession();
  if (!session) return;

  const referenceSpace = renderer.xr.getReferenceSpace();
  if (!referenceSpace) return;

  const viewerPose = frame.getViewerPose(referenceSpace);
  if (!viewerPose) return;
  
  const depthData = frame.getDepthInformation(viewerPose.views[0]);

  if (!depthData) {
    return;
  }

  if (!depthData) {
    console.warn("Depth data not available yet.");
    return;
  }

  checkOcclusion(depthData, occlusionObject, camera);

  renderer.render(scene, camera);
}
