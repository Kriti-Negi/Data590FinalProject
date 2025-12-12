import { Scene, Node } from './Scene.js';
import { CubeMesh } from './Mesh.js';
import { Renderer } from '../rendering/Renderer.js';
import {planeUpdatePerFrame} from "../enviornment/PlaneController.js";
import { notEqual } from 'three/tsl';

export class Engine {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = null;
    this.renderer = null;

    this.scene = new Scene();
    this.xrSession = null;
    this.xrRefSpace = null;

    this.lastTime = null; 
    this.logs = [];         
    //default cube
    this.placeCube([0, 1.6, -3]);
    // plane info
    this.planes = new Map();
    this.closest;
    this.farthest;
    this.largestSA;
    this.smallestSA;
  }

  //for xr
  async startXR() {
    if (!navigator.xr) {
      console.warn('No WebXR, falling back to normal render');
      this.startFallback();
      return;
    }

    const mode = (await navigator.xr.isSessionSupported('immersive-ar')
      .catch(() => false)) ? 'immersive-ar' : 'immersive-vr';

    let session;
    try {
      session = await navigator.xr.requestSession(mode, {
        requiredFeatures: ['local-floor'],
        requiredFeatures: ["plane-detection"]
      });
    } catch (e) {
      console.warn('XR request failed, falling back', e);
      this.startFallback();
      return;
    }

    this.xrSession = session;

    this.gl = this.canvas.getContext('webgl', { xrCompatible: true });
    if (!this.gl) {
      alert('WebGL not supported');
      return;
    }
    await this.gl.makeXRCompatible?.();

    //rendering initialization
    this.renderer = new Renderer(this.gl);

    const baseLayer = new XRWebGLLayer(this.xrSession, this.gl);
    this.xrSession.updateRenderState({ baseLayer });

    this.xrRefSpace = await this.xrSession.requestReferenceSpace('local-floor');

    this.lastTime = null;
    this.xrSession.requestAnimationFrame(this.onXRFrame.bind(this));
  }

  //xr frame
  onXRFrame(time, frame) {
    const session = frame.session;
    session.requestAnimationFrame(this.onXRFrame.bind(this));

    const pose = frame.getViewerPose(this.xrRefSpace);
    if (!pose) return;

    const gl = this.gl;
    const glLayer = session.renderState.baseLayer;
    gl.bindFramebuffer(gl.FRAMEBUFFER, glLayer.framebuffer);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //update script
    if (this.lastTime == null) this.lastTime = time;
    const dt = (time - this.lastTime) / 1000.0;
    this.lastTime = time;
    this.update(dt);

    this.planes = planeUpdatePerFrame(time, frame, this.planes);

    for (const view of pose.views) {
      const viewport = glLayer.getViewport(view);
      gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

      const projection = view.projectionMatrix;
      const viewMatrix = view.transform.inverse.matrix;

      this.renderer.renderScene(this.scene, projection, viewMatrix);
    }
    
  }

  //fallback
  startFallback() {
    const gl = this.canvas.getContext('webgl');
    if (!gl) {
      alert('WebGL not supported');
      return;
    }
    this.gl = gl;
    this.renderer = new Renderer(gl);

    const loop = (time) => {
      requestAnimationFrame(loop);

      if (this.lastTime == null) this.lastTime = time;
      const dt = (time - this.lastTime) / 1000.0;
      this.lastTime = time;
      this.update(dt);

      this.resizeCanvasToDisplaySize();
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      const aspect = this.canvas.width / this.canvas.height;
      const projection = makePerspective(Math.PI / 3, aspect, 0.1, 100);

      //camera view
      const view = makeLookAt(
        [0, 1.6, 3],
        [0, 1.6, 0],
        [0, 1, 0]
      );

      this.renderer.renderScene(this.scene, projection, view);
    };

    this.lastTime = null;
    requestAnimationFrame(loop);
  }

  resizeCanvasToDisplaySize() {
    const canvas = this.canvas;
    const dpr = window.devicePixelRatio || 1;
    const width = (canvas.clientWidth || window.innerWidth) * dpr | 0;
    const height = (canvas.clientHeight || window.innerHeight) * dpr | 0;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      this.gl.viewport(0, 0, width, height);
    }
  }

  //update frame
  update(dt) {
    for (const node of this.scene.getNodes()) {
      for (const c of node.components) {
        if (typeof c.update === 'function') {
          c.update(dt);
        }
      }
    }
  }

  getPosition(plane){
    var totalX = 0;
    var totalY = 0;
    var totalZ = 0;

    var totalPts = 0;
    for (let point of plane.polygon){
      totalX += point.x;
      totalY += point.y;
      totalZ += point.z
      totalPts++;
    }
    return centerPos = [totalX/totalPts, totalY/totalPts, totalZ/totalPts];
  }

  getDistance(centerPos){
    return centerPos[0] * centerPos[0] + centerPos[1] * centerPos[1] + centerPos[2]*centerPos[2]
  }

  //place cube
  placeCube(position = [0, 1.6, -3], ScriptClass = null) {
    const node = new Node({ position, scale: [1, 1, 1] });
    node.addComponent(new CubeMesh());

    // updating all seen planes

    const arrAllPlanes = Array.from(this.planes.keys());

    if(arrAllPlanes.length > 0){
      this.closest = this.getPosition(arrAllPlanes[0]);
      this.farthest = this.getPosition(arrAllPlanes[0]);
      this.largestSA = this.getPosition(arrAllPlanes[0]);
      this.smallestSA = this.getPosition(arrAllPlanes[0]);
    }

    for(var plane of arrAllPlanes){
      // closest plane location 
      var distance1 = getDistance(this.getPosition(plane));
      //closest
      if(distance1 < this.getDistance(this.closest)){
        this.closest = this.getPosition(plane);
      }
      // farthest plane location
      if(distance1 > this.getDistance(this.farthest)){
        this.farthest = this.getPosition(plane);
      }
      // largest SA location

      // smallest SA location
    }

    if(node.attachToAll == true){
      // uhh
    }

    if(node.attachTo == 0 && node.given == 0){ // SA, largest

    }else if(node.attachTo == 1 && node.given == 0){ // pos, farthest
      node.position[0] += this.farthest[0];
      node.position[1] += this.farthest[1];
      node.position[2] += this.farthest[2];

    }else if(node.attachTo == 0 && node.given == 1){ // SA, smallest

    }else if(node.attachTo == 1 && node.given == 1){ // pos, closest
      node.position[0] += this.closest[0];
      node.position[1] += this.closest[1];
      node.position[2] += this.closest[2];
    }

    if (ScriptClass) {
      const script = new ScriptClass();
      node.addComponent(script);
      if (typeof script.start === 'function') {
        script.start();
      }
    }

    this.scene.addNode(node);
    this.logEvent('placeCube', { position, nodeId: node.id });

  
    return node;
  }

  logEvent(type, data = {}) {
    this.logs.push({
      time: performance.now(),
      type,
      ...data
    });
  }
}

//for fallback
function makePerspective(fovy, aspect, near, far) {
  const f = 1 / Math.tan(fovy / 2);
  const nf = 1 / (near - far);
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, (2 * far * near) * nf, 0
  ]);
}

function makeLookAt(eye, center, up) {
  const [ex, ey, ez] = eye;
  const [cx, cy, cz] = center;
  const [ux, uy, uz] = up;

  let zx = ex - cx;
  let zy = ey - cy;
  let zz = ez - cz;
  let zlen = Math.hypot(zx, zy, zz);
  zx /= zlen; zy /= zlen; zz /= zlen;

  let xx = uy * zz - uz * zy;
  let xy = uz * zx - ux * zz;
  let xz = ux * zy - uy * zx;
  let xlen = Math.hypot(xx, xy, xz);
  xx /= xlen; xy /= xlen; xz /= xlen;

  let yx = zy * xz - zz * xy;
  let yy = zz * xx - zx * xz;
  let yz = zx * xy - zy * xx;

  return new Float32Array([
    xx, yx, zx, 0,
    xy, yy, zy, 0,
    xz, yz, zz, 0,
    -(xx * ex + xy * ey + xz * ez),
    -(yx * ex + yy * ey + yz * ez),
    -(zx * ex + zy * ey + zz * ez),
    1
  ]);
}
