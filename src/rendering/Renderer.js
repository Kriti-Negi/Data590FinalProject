import { CubeMesh } from '../engine/Mesh.js';

export class Renderer {
  constructor(gl) {
    this.gl = gl;

    this.initGL();
    this.initShaders();
    this.initCubeGeometry();
  }

  initGL() {
    const gl = this.gl;
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.1, 0.1, 0.1, 1);
  }

  initShaders() {
    const gl = this.gl;

    const vs = `
      attribute vec3 aPos;
      uniform mat4 uProjection;
      uniform mat4 uView;
      uniform mat4 uModel;
      void main() {
        gl_Position = uProjection * uView * uModel * vec4(aPos, 1.0);
      }
    `;

    const fs = `
      precision mediump float;
      void main() {
        gl_FragColor = vec4(0.2, 0.8, 0.3, 1.0);  // 绿色 cube
      }
    `;

    const vsObj = this.compileShader(gl.VERTEX_SHADER, vs);
    const fsObj = this.compileShader(gl.FRAGMENT_SHADER, fs);

    this.program = this.linkProgram(vsObj, fsObj);

    gl.useProgram(this.program);

    this.aPos = gl.getAttribLocation(this.program, 'aPos');
    this.uProjection = gl.getUniformLocation(this.program, 'uProjection');
    this.uView = gl.getUniformLocation(this.program, 'uView');
    this.uModel = gl.getUniformLocation(this.program, 'uModel');
  }

  compileShader(type, source) {
    const gl = this.gl;
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);

    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error('Shader error: ' + gl.getShaderInfoLog(s));
    }
    return s;
  }

  linkProgram(vs, fs) {
    const gl = this.gl;
    const p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);

    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      throw new Error('Program error: ' + gl.getProgramInfoLog(p));
    }
    return p;
  }

  initCubeGeometry() {
    const gl = this.gl;

    const vertices = new Float32Array([
      -0.5, -0.5,  0.5,
       0.5, -0.5,  0.5,
       0.5,  0.5,  0.5,
      -0.5,  0.5,  0.5,
      -0.5, -0.5, -0.5,
       0.5, -0.5, -0.5,
       0.5,  0.5, -0.5,
      -0.5,  0.5, -0.5,
    ]);

    const indices = new Uint16Array([
      0, 1, 2, 0, 2, 3,
      4, 6, 5, 4, 7, 6,
      4, 0, 3, 4, 3, 7,
      1, 5, 6, 1, 6, 2,
      3, 2, 6, 3, 6, 7,
      4, 5, 1, 4, 1, 0,
    ]);

    this.indexCount = indices.length;

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  }

  renderScene(scene, projection, view) {
    const gl = this.gl;

    gl.useProgram(this.program);

    gl.uniformMatrix4fv(this.uProjection, false, projection);
    gl.uniformMatrix4fv(this.uView, false, view);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.enableVertexAttribArray(this.aPos);
    gl.vertexAttribPointer(this.aPos, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    for (const node of scene.getNodes()) {
      const mesh = node.getComponent(CubeMesh);
      if (!mesh) continue;

      const model = this.computeModelMatrix(node);
      gl.uniformMatrix4fv(this.uModel, false, model);

      gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
    }
  }

  computeModelMatrix(node) {
    const m = new Float32Array(16);
    const [x, y, z] = node.position;
    const [sx, sy, sz] = node.scale;

    m.set([
      sx, 0,  0,  0,
      0,  sy, 0,  0,
      0,  0,  sz, 0,
      x,  y,  z,  1
    ]);

    return m;
  }
}
