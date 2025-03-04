//ADD PRE AND POST CONDITIONS
AFRAME.registerComponent("custom-plane-builder", {
  schema: {
    filename: { type: "string", default: "inputdata" },
    elevation: { type: "boolean", default: false },
  },

  init: async function () {
    //if elevation is true, attach the listener now (before setAttribute).
    console.log(this.data.filename);
    if (this.data.elevation) {
      this.el.addEventListener(
        "componentchanged",
        (evt) => {
          if (evt.detail.name === "geometry") {
            this.modifyVertices(data);
          }
        },
        { once: true }
      );
    }

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

    this.el.setAttribute("geometry", {
      primitive: "plane",
      segmentsHeight: segments,
      segmentsWidth: segments,
    });
  },

  modifyVertices: function (data) {
    const mesh = this.el.getObject3D("mesh");
    if (!mesh) {
      return;
    }

    const positionAttr = mesh.geometry.attributes.position;
    console.log(positionAttr);
    if (!positionAttr) {
      return;
    }

    const groupSize = this.el.getAttribute("geometry").segmentsHeight;

    const elevationData1 = data.split("\n");
    if (elevationData1.length !== positionAttr.count) {
      console.error(`Incorrect number of vertices in file`);
      return;
    }

    let newVertices = new Float32Array(positionAttr.array.length);
    let count2 = 0;

    for (let i = 0; i < elevationData1.length; i++) {
      const [xStr, yStr, zStr] = elevationData1[i].split(/\s+/);
      newVertices[count2] = parseFloat(xStr);
      count2++;
      newVertices[count2] = parseFloat(yStr);
      count2++;
      newVertices[count2] = parseFloat(zStr);
      count2++;
    }

    mesh.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(newVertices, 3)
    );
    positionAttr.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
  },
});