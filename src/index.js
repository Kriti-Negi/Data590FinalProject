import { Renderer } from './rendering/Renderer.js';
import { Scene, Node } from './engine/Scene.js';
import { CubeMesh } from './engine/Mesh.js';

//ui
const canvas = document.getElementById("xr-canvas");
const cubeList = document.getElementById("cube-list");
const inspector = document.getElementById("inspector");
//button
const addCubeBtn = document.getElementById("add-cube-btn");
const deleteCubeBtn = document.getElementById("delete-cube-btn");
const startMRBtn = document.getElementById("start-btn");

let xrSession = null;
let xrRefSpace = null;
let gl = null;
let renderer = null;
let scene = null;
let selectedNode = null;

function initScene() {
  scene = new Scene();

  // default cube
  const cube = new Node({
    position: [0, 1.6, -3],
    scale: [1, 1, 1]
  });

  cube.addComponent(new CubeMesh());
  scene.addNode(cube);

  updateCubeList();
  updateInspectorPanel();
}

function updateCubeList() {
  cubeList.innerHTML = "";

  scene.getNodes().forEach((node, index) => {
    const li = document.createElement("li");
    li.textContent = `Cube ${index}`;

    if (node === selectedNode) {
      li.classList.add("selected");
    }

    li.addEventListener("click", () => {
      selectedNode = node;
      updateCubeList();
      updateInspectorPanel();
    });

    cubeList.appendChild(li);
  });
}

function updateInspectorPanel() {
  if (!selectedNode) {
    inspector.innerHTML = "<p>No object selected</p>";
    return;
  }

  const pos = selectedNode.position;
  const scale = selectedNode.scale;
  const rotation = selectedNode.rotation;

  inspector.innerHTML = `
      <h4>Transform</h4>

      <label>Position</label><br>
      <div style="margin-bottom: 10px;">
        <label sytle="width:20px; display:inline-block;">X:</label>
        <input id="pos-x" type="number" step="0.1" value="${pos[0]}">
        <label sytle="width:20px; display:inline-block;">Y:</label>
        <input id="pos-y" type="number" step="0.1" value="${pos[1]}">
        <label sytle="width:20px; display:inline-block;">Z:</label>
        <input id="pos-z" type="number" step="0.1" value="${pos[2]}">
      </div>

      <label>Scale</label><br>
      <div>
        <label style="width:20px; display:inline-block;">X:</label>
        <input id="scale-x" type="number" step="0.1" value="${scale[0]}" style="width:70px;">
        <label style="width:20px; display:inline-block;">Y:</label>
        <input id="scale-y" type="number" step="0.1" value="${scale[1]}" style="width:70px;">
        <label style="width:20px; display:inline-block;">Z:</label>
        <input id="scale-z" type="number" step="0.1" value="${scale[2]}" style="width:70px;">
      </div>

      <label>Rotation</label><br>
      <div>
        <label style="width:20px; display:inline-block;">X:</label>
        <input id="rotation-x" type="number" step="0.1" value="${rotation[0]}" style="width:70px;">
        <label style="width:20px; display:inline-block;">Y:</label>
        <input id="rotation-y" type="number" step="0.1" value="${rotation[1]}" style="width:70px;">
        <label style="width:20px; display:inline-block;">Z:</label>
        <input id="rotation-z" type="number" step="0.1" value="${rotation[2]}" style="width:70px;">
      </div>
  `;

  bindInspectorEvents();
}

function bindInspectorEvents() {
  if (!selectedNode) return;

  document.getElementById("pos-x").addEventListener("input", e => {
    selectedNode.position[0] = parseFloat(e.target.value);
  });
  document.getElementById("pos-y").addEventListener("input", e => {
    selectedNode.position[1] = parseFloat(e.target.value);
  });
  document.getElementById("pos-z").addEventListener("input", e => {
    selectedNode.position[2] = parseFloat(e.target.value);
  });

  document.getElementById("scale-x").addEventListener("input", e => {
    selectedNode.scale[0] = parseFloat(e.target.value);
  });
  document.getElementById("scale-y").addEventListener("input", e => {
    selectedNode.scale[1] = parseFloat(e.target.value);
  });
  document.getElementById("scale-z").addEventListener("input", e => {
    selectedNode.scale[2] = parseFloat(e.target.value);
  });

  document.getElementById("rotation-x").addEventListener("input", e => {
    selectedNode.rotation[0] = parseFloat(e.target.value);
  });
  document.getElementById("rotation-y").addEventListener("input", e => {
    selectedNode.rotation[1] = parseFloat(e.target.value);
  });
  document.getElementById("rotation-z").addEventListener("input", e => {
    selectedNode.rotation[2] = parseFloat(e.target.value);
  });

  updateCubeList();
}

addCubeBtn.addEventListener("click", () => {
  const cube = new Node({
    position: [Math.random()*2 - 1, 1.6, -3],
    scale: [1, 1, 1]
  });

  cube.addComponent(new CubeMesh());
  scene.addNode(cube);

  updateCubeList();
});

deleteCubeBtn.addEventListener("click", () => {
  if (!selectedNode) return;

  scene.removeNode(selectedNode);
  selectedNode = null;

  updateCubeList();
  updateInspectorPanel();
});

function startFallbackRender() {
  gl = canvas.getContext("webgl");
  renderer = new Renderer(gl);
  initScene();

  function loop(time) {
    resizeCanvasToDisplaySize(canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const projection = makePerspective(Math.PI/3, canvas.width/canvas.height, 0.1, 100);
    const view = makeLookAt([0, 1.6, 3], [0, 1.6, 0], [0,1,0]);

    renderer.renderScene(scene, projection, view);
    requestAnimationFrame(loop);
  }
  loop(0);
}

//xr
async function initXR() {
  if (!navigator.xr) {
    startFallbackRender();
    return;
  }

  const supported = await navigator.xr.isSessionSupported("immersive-vr");
  if (!supported) return startFallbackRender();

  xrSession = await navigator.xr.requestSession("immersive-vr", {
    requiredFeatures: ["local-floor"]
  });

  gl = canvas.getContext("webgl", { xrCompatible: true });
  await gl.makeXRCompatible();


  renderer = new Renderer(gl);
  initScene();

  const baseLayer = new XRWebGLLayer(xrSession, gl);
  xrSession.updateRenderState({ baseLayer });

  xrRefSpace = await xrSession.requestReferenceSpace("local-floor");
  xrSession.requestAnimationFrame(onXRFrame);
}

function onXRFrame(time, frame) {
  const session = frame.session;
  session.requestAnimationFrame(onXRFrame);

  const pose = frame.getViewerPose(xrRefSpace);
  if (!pose) return;

  const glLayer = session.renderState.baseLayer;
  gl.bindFramebuffer(gl.FRAMEBUFFER, glLayer.framebuffer);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  for (const view of pose.views) {
    const viewport = glLayer.getViewport(view);
    gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

    renderer.renderScene(scene,
      view.projectionMatrix,
      view.transform.inverse.matrix);
  }
}

//graphics
function makePerspective(fovy, aspect, near, far) {
  const f = 1.0 / Math.tan(fovy / 2);
  const nf = 1 / (near - far);
  return new Float32Array([
    f/aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far+near)*nf, -1,
    0, 0, (2*far*near)*nf, 0
  ]);
}

function makeLookAt(eye, center, up) {
  const [ex, ey, ez] = eye;
  const [cx, cy, cz] = center;

  let zx = ex - cx, zy = ey - cy, zz = ez - cz;
  const zlen = Math.hypot(zx, zy, zz);
  zx/=zlen; zy/=zlen; zz/=zlen;

  let xx = up[1]*zz - up[2]*zy;
  let xy = up[2]*zx - up[0]*zz;
  let xz = up[0]*zy - up[1]*zx;
  const xlen = Math.hypot(xx, xy, xz);
  xx/=xlen; xy/=xlen; xz/=xlen;

  let yx = zy*xz - zz*xy;
  let yy = zz*xx - zx*xz;
  let yz = zx*xy - zy*xx;

  return new Float32Array([
    xx, yx, zx, 0,
    xy, yy, zy, 0,
    xz, yz, zz, 0,
    -(xx*ex + xy*ey + xz*ez),
    -(yx*ex + yy*ey + yz*ez),
    -(zx*ex + zy*ey + zz*ez),
    1
  ]);
}

function resizeCanvasToDisplaySize(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth * dpr;
  const height = canvas.clientHeight * dpr;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}

//start
startMRBtn.addEventListener("click", () => {
  initXR();
});