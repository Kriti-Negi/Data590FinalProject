export class PlaneController {
  constructor(){
    this.allMeshes = new Map();
  }

  getAllPlanes(){
    return [...this.allMeshes.keys()];
  }

  getSomePlanePosition(){
    const meshContextIterator = this.allMeshes.values();
    const mesh1 = meshContextIterator.next().value;
    return mesh1.position; 
  }

  getOnePlane(){
    // placeholder
    return this.getAllPlanes()[0];
  }

  processMeshes(timestamp, frame, renderer) {
    //const referenceSpace = renderer.xr.getReferenceSpace();
    /*
    const referenceSpace = renderer.engine.xrRefSpace;

    if (!frame.detectedMeshes) {
        return;
    }
    this.allMeshes.forEach((prevTimeStamp, mesh) => {
        if (!frame.detectedMeshes.has(mesh)) {
            this.allMeshes.delete(mesh);
        }
    });
    frame.detectedMeshes.forEach(mesh => {
      const meshPose = frame.getPose(mesh.meshSpace, referenceSpace);
      const matrix = meshPose.transform.matrix;
      if (this.allMeshes.has(mesh) && meshPose != null) {
            const prev = this.allMeshes.get(mesh);
            
            if (prev.timestamp < mesh.lastChangedTime) {
                prev.timestamp = mesh.lastChangedTime;
                prev.position = [ matrix[12], matrix[13], matrix[14] ];
            }
        } else {
          
          this.allMeshes.set(mesh, {
                timestamp: mesh.lastChangedTime,
                position: [ matrix[12], matrix[13], matrix[14] ]
            });
        }
    });*/


  }
}