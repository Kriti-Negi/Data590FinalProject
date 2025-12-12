import { PlaneObject } from "./PlaneObject";

function getPlaneCenter(plane){
    var totalX = 0;
    var totalY = 0;
    var totalZ = 0;

    var totalPts;
    for (let point in plane.polygon){
        totalX += point.x;
        totalY += point.y;
        totalZ += point.z
        totalPts++;
    }
    return [totalX/totalPts, totalY/totalPts, totalZ/totalPts];
}

const planes = Map();
// https://immersive-web.github.io/plane-detection/#example-5ff73e1a

// to be run every frame.
// taken from the docs
export default function updatePlanes(timestamp, frame, planeObjects) {
  const detectedPlanes = frame.detectedPlanes; 
  // First, let’s check if any of the planes we knew about is no longer tracked:
  for (const [plane, timestamp] of planes) {
    if(!detectedPlanes.has(plane)) {
      // Handle removed plane - `plane` was present in previous frame,
      // but is no longer tracked.
      // We know the plane no longer exists, remove it from the map:
      planes.delete(plane);
    }
  }

  // Then, let’s handle all the planes that are still tracked.
  // This consists both of tracked planes that we have previously seen (may have
  // been updated), and new planes.
  detectedPlanes.forEach(plane => {
    if (planes.has(plane)) {
      // update plane by id

      if(plane.lastChangedTime > planes.get(plane)) {
        // Handle previously seen plane that was updated.
        // It means that one of the plane’s properties is different than
        // it used to be - most likely, the polygon has changed.

        // Render / prepare the plane for rendering, etc.

        // Update the time when we have updated the plane:
        planes.set(plane, plane.lastChangedTime);
      } else {
        // Handle previously seen plane that was not updated in current frame.
        // Note that plane’s pose relative to some other space MAY have changed.
      }
    } else {
      // Handle new plane.
      // add a new plane at the closest point?
      planeObjects.push(new PlaneObject(plane));


      // Set the time when we have updated the plane:
      planes.set(plane, plane.lastChangedTime);
    }
    // Irrespective of whether the plane was previously seen or not,
    // & updated or not, its pose MAY have changed:
    const planePose = frame.getPose(plane.planeSpace, xrReferenceSpace);
  });
  // update all frames based on planes array here
  // do 'most likely' model
  // may be slow
  // assign closest plane to detected planes
  // based on SA?

  // order plane objects
  

  for(var i = 0; i < detectedPlanes; i++){
    for(var j = 0; j < detectedPlanes; j++){
        c1 = getPlaneCenter(detectedPlanes[i]);
        c2 = getPlaneCenter(detectedPlanes[j]);
        d1 = c1[0] * c1[0] + c1[1] * c1[1] + c1[2]*c1[2];
        d2 = c2[0] * c2[0] + c2[1] * c2[1] + c2[2]*c2[2];
        if(d1 > d2){
            temp = detectedPlanes[j];
            detectedPlanes[j] = detectedPlanes[i];
            detectedPlanes[i] = temp;
        }
    }
  }

  for(var i = 0; i < planeObjects; i++){
    for(var j = 0; j < planeObjects; j++){
        c1 = planeObjects[i].planeCenterCoord();
        c2 = planeObjects[j].planeCenterCoord();
        d1 = c1[0] * c1[0] + c1[1] * c1[1] + c1[2]*c1[2];
        d2 = c2[0] * c2[0] + c2[1] * c2[1] + c2[2]*c2[2];
        if(d1 > d2){
            temp = planeObjects[j];
            planeObjects[j] = planeObjects[i];
            planeObjects[i] = temp;
        }
    }
  }

  for(var i = 0; i < length(planeObjects); i++){
    planeObjects[i] = detectedPlanes[i];
  }

  return planeObjects;
}