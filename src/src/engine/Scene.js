export class Scene {
  constructor() {
    this.nodes = [];
  }

  addNode(node) {
    this.nodes.push(node);
    return node;
  }

  removeNode(node) {
    this.nodes = this.nodes.filter(n => n !== node);
  }

  getNodes() {
    return this.nodes;
  }
}

let nextId = 1;

export class Node {
  constructor({ position=[0,0,0], scale=[1,1,1], rotation=[0,0,0] } = {}) {
    this.id = nextId++;
    this.position = position;
    this.scale = scale;
    this.rotation = rotation;
    this.components = [];
    this.given = 0;
    this.attachTo = 0;
    this.attachToAll = false;
  }

  addComponent(c) {
    this.components.push(c);
    c.node = this;
    return c;
  }

  getComponent(type) {
    return this.components.find(c => c instanceof type);
  }
}
