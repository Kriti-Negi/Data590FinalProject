import { PlaneObject } from "./PlaneObject";
/*
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
}*/



// https://immersive-web.github.io/plane-detection/#example-5ff73e1a

// to be run every frame.
// taken from the docs
/*
export default function updatePlanes(timestamp, frame, plane) {
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
      //planeObjects.push(new PlaneObject(plane));


      // Set the time when we have updated the plane:
      planes.set(plane, plane.lastChangedTime);
    }
    // Irrespective of whether the plane was previously seen or not,
    // & updated or not, its pose MAY have changed:
    const planePose = frame.getPose(plane.planeSpace, xrReferenceSpace);
    return plane;
  });
}*/

  // update all frames based on planes array here
  // do 'most likely' model
  // may be slow
  // assign closest plane to detected planes
  // based on SA?

  // order plane objects
  

// `planes` will track all detected planes that the application is aware of,
// and at what timestamp they were updated. Initially, this is an empty map.

/*const planes = Map();*/
/*
export default function planeUpdatePerFrame(timestamp, frame, planes) {
  const detectedPlanes = frame.detectedPlanes;
  for (const [plane, timestamp] of planes) {
    if(!detectedPlanes.has(plane)) {
      planes.delete(plane);
    }
  }
  detectedPlanes.forEach(plane => {

    alert("lksfjlksdf print");
    console.log("Sdfsdfdsf");

    if (planes.has(plane)) {
      if(plane.lastChangedTime > planes.get(plane)) {
        planes.set(plane, plane.lastChangedTime);
      } 
    } else { 
      planes.set(plane, plane.lastChangedTime);
    }
    const planePose = frame.getPose(plane.planeSpace, xrReferenceSpace);
  });
  frame.session.requestAnimationFrame(onXRFrame);
  return planes;
}*/

export function planeUpdatePerFrame(timestamp, frame, planes) {
  const detectedPlanes = frame.detectedPlanes;

  // Remove missing planes
  for (const [plane, lastTime] of planes) {
    if (!detectedPlanes.has(plane)) {
      planes.delete(plane);
    }
  }

  // Add/update detected planes
  detectedPlanes.forEach(plane => {
    const lastKnown = planes.get(plane);

    if (lastKnown === undefined || plane.lastChangedTime > lastKnown) {
      planes.set(plane, plane.lastChangedTime);
    }

    const pose = frame.getPose(plane.planeSpace, xrReferenceSpace);
    // use pose
  });

  frame.session.requestAnimationFrame(onXRFrame);
  return planes;
}


/*
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
}*/