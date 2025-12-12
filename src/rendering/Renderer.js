import { subgroupXor } from 'three/tsl';
import { CubeMesh } from '../engine/Mesh.js';

function mult4x4(a, b, dst) {
  dst = dst || new Float32Array(16);

  const b00 = b[0],  b01 = b[1],  b02 = b[2],  b03 = b[3];
  const b10 = b[4],  b11 = b[5],  b12 = b[6],  b13 = b[7];
  const b20 = b[8],  b21 = b[9],  b22 = b[10], b23 = b[11];
  const b30 = b[12], b31 = b[13], b32 = b[14], b33 = b[15];

  const a00 = a[0],  a01 = a[1],  a02 = a[2],  a03 = a[3];
  const a10 = a[4],  a11 = a[5],  a12 = a[6],  a13 = a[7];
  const a20 = a[8],  a21 = a[9],  a22 = a[10], a23 = a[11];
  const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

  dst[0]  = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
  dst[1]  = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
  dst[2]  = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
  dst[3]  = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;

  dst[4]  = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
  dst[5]  = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
  dst[6]  = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
  dst[7]  = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;

  dst[8]  = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
  dst[9]  = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
  dst[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
  dst[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;

  dst[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
  dst[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
  dst[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
  dst[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;

  return dst;
}


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
    const [x, y, z] = node.position;
    const [sx, sy, sz] = node.scale;
    const rotation = node.rotation || [0, 0, 0];

    const rx = rotation[0] * Math.PI / 180;
    const ry = rotation[1] * Math.PI / 180;
    const rz = rotation[2] * Math.PI / 180;

    var translationMatrix = new Float32Array([1.0, 0.0, 0.0, 0.0,
                        0.0,1.0, 0.0, 0.0,
                        0.0,0.0,1.0, 0.0, 
                        x, y, z, 1.0]
                        );
    var rxMatrix = new Float32Array([1.0,0.0,0.0,0.0,
                        0.0, Math.cos(rx), Math.sin(rx), 0.0,
                        0.0, -Math.sin(rx),Math.cos(rx), 0.0,
                        0.0, 0.0, 0.0, 1.0]
                        );
    var ryMatrix = new Float32Array([Math.cos(ry), 0.0, -Math.sin(ry), 0.0,
                        0.0, 1.0, 0.0, 0.0, 
                        Math.sin(ry),0.0, Math.cos(ry), 0.0,
                        0.0, 0.0, 0.0, 1.0]
                        );
    var rzMatrix = new Float32Array([Math.cos(rz), Math.sin(rz), 0.0, 0.0,
                        -Math.sin(rz),Math.cos(rz), 0.0, 0.0,
                        0.0, 0.0, 1.0, 0.0,
                        0.0, 0.0, 0.0, 1.0]
                        );
    var scaleMatrix = new Float32Array([sx, 0.0, 0.0, 0.0,
                        0.0,sy, 0.0, 0.0,
                        0.0, 0.0, sz, 0.0,
                        0.0,0.0,0.0,1.0]
                        );    
    
    let model = new Float32Array(16);
    mult4x4(rzMatrix, scaleMatrix, model);          // M1 = Rz * S
    mult4x4(rxMatrix, model, model);                // M2 = Rx * M1
    mult4x4(ryMatrix, model, model);                // M3 = Ry * M2
    mult4x4(translationMatrix, model, model);       // M4 = T * M3

    return model;
  }
}
