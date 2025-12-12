import {CubeMesh} from '../engine/Mesh';

export class PlaneObject{
    constructor(plane) {
        this.objectsAttached = [];
        this.plane = plane;
        // may need to add an ID
        this.centerPos = [];
        this.updatePlane();
    }

    updatePlane(){
        // update center pos
        var totalX = 0;
        var totalY = 0;
        var totalZ = 0;

        var totalPts;
        for (let point in this.plane.polygon){
            totalX += point.x;
            totalY += point.y;
            totalZ += point.z
            totalPts++;
        }
        this.centerPos = [totalX/totalPts, totalY/totalPts, totalZ/totalPts];
    }

    addObject(mesh){
        this.objectsAttached.push(mesh);
    }
    get meshes(){
        return this.objectsAttached;
    }
    get planeType(){
        return this.plane.XRPlaneOrientation;
    }
    get planePolygonCoords(){
        return this.plane.polygon;
    }
    get planeCenterCoord(){
        return this.centerPos;
    }
    set newPlane(plane){
        this.plane = plane;
    }
    // for debugging we want to maybe render the plane
    
}
