/**
 * light estimation
 *
 * The scene estimates light and maps it on the mesh, making it blend into the environment like a real object
 */

import * as THREE from "three";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { ARButton } from "three/addons/webxr/ARButton.js";
import { XREstimatedLight } from "three/addons/webxr/XREstimatedLight.js";

let camera: THREE.PerspectiveCamera,
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer;
let controller: THREE.XRTargetRaySpace;
let defaultEnvironment: THREE.Texture;

init();

function init() {
  const container = document.createElement("div");
  document.body.appendChild(container);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    20
  );

  const defaultLight = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  defaultLight.position.set(0.5, 1, 0.25);
  scene.add(defaultLight);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  renderer.xr.enabled = true;
  container.appendChild(renderer.domElement);


  const ballGeometry = new THREE.SphereGeometry(0.3, 32, 32);
  const ballMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    metalness: 1.0, // Full reflectivity
    roughness: 0.1 // Very smooth surface
  });
  const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
  ballMesh.position.z = -2;

  scene.add(ballMesh);

  // Don't add the XREstimatedLight to the scene initially.
  // It doesn't have any estimated lighting values until an AR session starts.

  const xrLight = new XREstimatedLight(renderer);

  xrLight.addEventListener("estimationstart", () => {
    // Swap the default light out for the estimated one one we start getting some estimated values.
    scene.add(xrLight);
    scene.remove(defaultLight);

    // The estimated lighting also provides an environment cubemap, which we can apply here.
    if (xrLight.environment) {
      scene.environment = xrLight.environment;
    }
  
  });

  xrLight.addEventListener("estimationend", () => {
    // Swap the lights back when we stop receiving estimated values.
    scene.add(defaultLight);
    scene.remove(xrLight);

    // Revert back to the default environment.
    scene.environment = defaultEnvironment;
  });

  //

  new RGBELoader()
    .setPath("textures/equirectangular/")
    .load("royal_esplanade_1k.hdr", function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;

      defaultEnvironment = texture;

      scene.environment = defaultEnvironment;
    });

  //

  // In order for lighting estimation to work, 'light-estimation' must be included as either an optional or required feature.
  document.body.appendChild(
    ARButton.createButton(renderer, {
      optionalFeatures: ["light-estimation", "hit-test"],
    })
  );


  function onSelect() {
    const session = renderer.xr.getSession();
    if (!session) { return; }

    session.requestAnimationFrame((_time, frame) => {
      const referenceSpace = renderer.xr.getReferenceSpace();
      const pose = frame.getViewerPose(referenceSpace!);

      if (pose) {
        const position = pose.transform.position;
        ballMesh.matrix.fromArray(pose.transform.matrix)

        console.log("Viewer Position (for gaze/screen inputs):", position);
      } else {
        console.warn("Viewer pose not available.");
      }
    });
    ballMesh.position.set(0, 0, -2).applyMatrix4(controller.matrixWorld);
  }

  controller = renderer.xr.getController(0);
  controller.addEventListener("select", onSelect);
  scene.add(controller);

  //

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

//

function animate() {
  renderer.render(scene, camera);
}
