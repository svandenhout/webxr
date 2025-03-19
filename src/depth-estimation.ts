import * as THREE from "three";
import { ARButton } from "three/addons/webxr/ARButton.js";

let container;
let camera: THREE.PerspectiveCamera,
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer;
let controller: THREE.XRTargetRaySpace;
let depthMesh: THREE.Object3D<THREE.Object3DEventMap>;
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

function createDepthPlaneWithHeatmap(depthData, width, height, scale = 1) {
  const geometry = new THREE.PlaneGeometry(2, 2, width - 1, height - 1);
  const vertices = geometry.attributes.position.array;
  const colors = new Float32Array(vertices.length); // RGB for each vertex

  let minDepth = 0.01, maxDepth = 5;

  // First pass: Find min and max depth for normalization
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const normalizedX = x / width;
      const normalizedY = y / height;

      try {
        let depth = depthData.getDepthInMeters(normalizedX, normalizedY);
        if (!depth || !isFinite(depth)) depth = 2.0; // Default depth

        minDepth = Math.min(minDepth, depth);
        maxDepth = Math.max(maxDepth, depth);
      } catch (error) {
        console.error(`Error getting depth at (${x}, ${y}):`, error);
      }
    }
  }

  // Second pass: Assign depth values and map to color
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const normalizedX = x / width;
      const normalizedY = y / height;

      try {
        let depth = depthData.getDepthInMeters(normalizedX, normalizedY);
        if (!depth || !isFinite(depth)) depth = maxDepth; // Default to far depth

        // Normalize depth to range [0,1]
        const normalizedDepth = (depth - minDepth) / (maxDepth - minDepth);

        // Apply depth as Z-position
        const vertexIndex = (y * width + x) * 3 + 2; // Access Z
        vertices[vertexIndex] = -depth * scale; // Scale for depth effect

        // Map normalized depth to color (Blue → Green → Red)
        const colorIndex = (y * width + x) * 3;
        colors[colorIndex] = normalizedDepth;       // Red (far)
        colors[colorIndex + 1] = 1.0 - normalizedDepth; // Green (middle)
        colors[colorIndex + 2] = 1.0 - normalizedDepth * 0.5; // Blue (near)

      } catch (error) {
        console.error(`Error getting depth at (${x}, ${y}):`, error);
      }
    }
  }

  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3)); // Assign colors
  geometry.attributes.position.needsUpdate = true;
  geometry.computeVertexNormals(); // Improve shading

  return new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide })
  );
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
  if (!depthData) { return; }

  if (!depthMesh) {
    // Create the depth mesh on first frame
    depthMesh = createDepthPlaneWithHeatmap(depthData, depthData.width, depthData.height);
    scene.add(depthMesh);
  } else {
    // Update depth mesh dynamically
    scene.remove(depthMesh);
    depthMesh = createDepthPlaneWithHeatmap(depthData, depthData.width, depthData.height);
    scene.add(depthMesh);
  }

  renderer.render(scene, camera);
}
