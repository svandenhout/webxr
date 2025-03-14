import * as THREE from "three";
import { ARButton } from "three/addons/webxr/ARButton.js";

let container;
let camera: THREE.PerspectiveCamera,
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer;
let controller: THREE.XRTargetRaySpace;

let mesh: THREE.Mesh;
const hitMatrix = new THREE.Matrix4();
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
      requiredFeatures: ["depth-sensing"], // Enable depth sensing
      optionalFeatures: ["hit-test"], // Optional feature for hit testing
      depthSensing: {
        usagePreference: ["cpu-optimized"], // Optimize for CPU or GPU usage
        dataFormatPreference: ["luminance-alpha"], // Depth format
      },
    })
  );

  //

  const geometry = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 32).translate(
    0,
    0.1,
    0
  );
  const material = new THREE.MeshPhongMaterial( { color: 0xffffff * Math.random() } );
  mesh = new THREE.Mesh( geometry, material );
  scene.add(mesh)

  controller = renderer.xr.getController(0);
  controller.addEventListener('select', (_event) => {
    const material = new THREE.MeshPhongMaterial( { color: 0xffffff * Math.random() } );
    const mesh = new THREE.Mesh( geometry, material );
    mesh.position.setFromMatrixPosition(hitMatrix)
    mesh.quaternion.setFromRotationMatrix(hitMatrix)
    scene.add(mesh)
  })
  scene.add(controller);

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(_time, frame: XRFrame) {
  if (!frame) return;

  const referenceSpace = renderer.xr.getReferenceSpace();

  if (!hitTestSource) return;
  const hitTestResults = frame.getHitTestResults(hitTestSource);

  if (hitTestResults.length > 0) {  
    const pose = hitTestResults[0].getPose(referenceSpace);

    hitMatrix.fromArray(pose.transform.matrix);
  }

  renderer.render(scene, camera);
}
