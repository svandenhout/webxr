/**
 * environment collision
 *
 * Use the layout of your environment as a boundary
 *
 * A cylinder is rendered in the location where the device is pointing to, it will not move through a wall or other object. 
 */
import * as THREE from "three";
import { ARButton } from "three/addons/webxr/ARButton.js";

let container;
let camera: THREE.PerspectiveCamera,
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer;
let controller: THREE.XRTargetRaySpace;

let mesh: THREE.Mesh;
let hitTestSource: XRHitTestSource | null = null;

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

  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 3);
  light.position.set(0.5, 1, 0.25);
  scene.add(light);

  //

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  renderer.xr.enabled = true;
  container.appendChild(renderer.domElement);

  renderer.xr.addEventListener("sessionstart", async () => {
    const session = renderer.xr.getSession();
    if (!session) return;
    
    const referenceSpace = await session.requestReferenceSpace('viewer');
  
    if (!referenceSpace) return;

    session.requestHitTestSource({ space: referenceSpace }).then((source) => {
      hitTestSource = source;
      console.log("HitTestSource initialized:", hitTestSource);
    });
  
    session.addEventListener("end", () => {
      hitTestSource = null;
    });
  });

  document.body.appendChild(
    ARButton.createButton(renderer, { 
      requiredFeatures: ["hit-test", "depth-sensing"], // Enable depth sensing
      depthSensing: {
        usagePreference: ["cpu-optimized", "gpu-optimized"],
        dataFormatPreference: ['luminance-alpha']
      }
    })
  );

  const geometry = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 32).translate(
    0,
    0.1,
    0
  );
  const material = new THREE.MeshPhongMaterial( { color: 0xffffff * Math.random() } );
  mesh = new THREE.Mesh( geometry, material );
  scene.add(mesh)

  controller = renderer.xr.getController(0);
  scene.add(controller);

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function checkCollisionWithRealWorld(_frame, object3D, depthData, slack = 0.1) {
  if (!depthData) return;

  // Convert object position from world space to screen space
  const vector = new THREE.Vector3();
  vector.setFromMatrixPosition(object3D.matrixWorld);
  vector.project(camera); // Converts world coordinates to screen space

  // Convert screen coordinates (-1 to 1) to normalized depth coordinates (0 to 1)
  const normalizedX = (vector.x + 1) / 2;
  const normalizedY = 1 - (vector.y + 1) / 2; // Flip Y-axis

  // Ensure values are clamped within [0,1] range
  const clampedX = Math.min(Math.max(normalizedX, 0), 1);
  const clampedY = Math.min(Math.max(normalizedY, 0), 1);

  try {
    // Get real-world depth at this position
    const realWorldDepth = depthData.getDepthInMeters(clampedX, clampedY);
    const objectDepth = object3D.position.distanceTo(camera.position); // Distance from camera

    // Detect collision: If virtual object is "inside" real-world depth
    if (objectDepth > realWorldDepth + slack) {
      console.log("Collision Detected!");
      
      object3D.material.color.set(0xff0000); // Turn red on collision
      return true;
    } else {
      object3D.material.color.set(0x00ff00); // Green if no collision
      return false;
    }
  } catch (error) {
    console.error("Error getting depth for collision check:", error);
  }
}

function animate(_time, frame: XRFrame) {
  if (!frame) return;

  const referenceSpace = renderer.xr.getReferenceSpace();
  if (!referenceSpace) return;

  if (!hitTestSource) return;
  const hitTestResults = frame.getHitTestResults(hitTestSource);

  const viewerPose = frame.getViewerPose(referenceSpace);
  if (!viewerPose) return;
  
  const depthData = frame.getDepthInformation(viewerPose.views[0]);
  if (!depthData) { return; }

  if (hitTestResults.length > 0) {  
    const pose = hitTestResults[0].getPose(referenceSpace);
    if (!checkCollisionWithRealWorld(frame, mesh, depthData)) {
      mesh.position.setFromMatrixPosition(new THREE.Matrix4().fromArray(pose.transform.matrix))
      mesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().fromArray(pose.transform.matrix))
    }
  }

  renderer.render(scene, camera);
}
