//ADD PRE AND POST CONDITIONS
/*
elevation.txt format:
  line 1: (integer) n = number of segments to be build in plane
  must be followed by 6n^2 lines, where each line contains the 3 floats [a,b,c] (coordinates).
  Let: 
  "North” = -Z
  “South” = +Z
  “East” = +X
  “West” = -X
  “Up” = +Y
  “Down” = -Y
  where the XYZ orientation is based off the AFRAME coordinate system. The camera initially faces north (-Z) 
  when the scene begins.
  a: -ve is west and +ve is east
  b: -ve is north and +ve is south
  c: -ve is up and +ve is down

  6 vertices form a rectangle
  
  1, 5 are the standalone vertices
  2 = 4
  3 = 6

*/
AFRAME.registerComponent("custom-plane-builder", {
  schema: {
    filename: { type: "string", default: "inputdata.txt" },
  },

  init: async function () {
   
    // Fetch the file contents.
    const response = await fetch(`tests/${this.data.filename}`);
    let data = await response.text();
    
    const firstNewlineIdx = data.indexOf("\n");
    if (firstNewlineIdx === -1) {
      console.error("File does not contain a newline; cannot parse segments!");
      return;
    }
    const firstLine = data.substring(0, firstNewlineIdx).trim();
    const segments = parseInt(firstLine, 10);
    if (isNaN(segments)) {
      console.error(
        "Cannot parse the first line as integer segments:",
        firstLine
      );
      return;
    }

    // remove the first line from data
    data = data.substring(firstNewlineIdx + 1);
    this.remainingElevationData = data;

    this.el.setAttribute("geometry", {
      primitive: "plane",
      segmentsHeight: segments,
      segmentsWidth: segments,
    });

    this.segmentsReady = true;
    this.el.emit('segments-ready');
  },
});

AFRAME.registerComponent("add-elevation", {
  schema: {
    elevation: { type: "boolean", default: false },
  },
  init: function () {
    const el = this.el;
  
    if (el.components['custom-plane-builder'] && el.components['custom-plane-builder'].segmentsReady) {
      this.modifyVertices();
    } else {
      
      el.addEventListener('segments-ready', () => this.modifyVertices());
      console.log("we did dis");
    }
  },
  
  modifyVertices: function (data) {
    const mesh = this.el.getObject3D("mesh");
    if (!mesh) {
      console.error("Mesh not found")
      return;
    }

    const positionAttr = mesh.geometry.attributes.position;
    // console.log(positionAttr);
    if (!positionAttr) {
      console.error("positionAttr not found")
      return;
    }

    const groupSize = this.el.getAttribute("geometry").segmentsHeight;
    const elevationData1 = this.el.components['custom-plane-builder'].remainingElevationData.split("\n");

    if (elevationData1.length !== positionAttr.count) {
      console.error(`Incorrect number of vertices in file`);
      return;
    }
    
    this.el.object3D.parent.updateMatrixWorld(true);
    mesh.updateMatrixWorld(true); //to make sure worldtolocal works


    let newVertices = new Float32Array(positionAttr.array.length);
    let count2 = 0;
    let tempV3 = new THREE.Vector3();
    for (let i = 0; i < elevationData1.length; i++) {
      const [xStr, yStr, zStr] = elevationData1[i].split(/\s+/);
      tempV3.set(parseFloat(xStr),parseFloat(yStr),parseFloat(zStr));
      console.log(tempV3);
      mesh.updateMatrixWorld(true);
      tempV3 = mesh.worldToLocal(tempV3);
      console.log(tempV3);
      newVertices[count2] = tempV3.x;
      count2++;
      newVertices[count2] = tempV3.y;
      count2++;
      newVertices[count2] = tempV3.z;
      count2++;
    } 

    const newVerticesBuffer = new THREE.BufferAttribute(newVertices, 3)
    mesh.geometry.setAttribute(
      "position",
      newVerticesBuffer
    );
  
    positionAttr.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
  },
  });