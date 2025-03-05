AFRAME.registerComponent("tree", {
  schema: {
    diameter: { type: "number" },
    height: { type: "number" },
    crown_height: { type: "number" },
    crown_diameter: { type: "number" },
    species_code: { type: "number" },
    color: { type: "string" },
    cone_layers: { type: "number" },
  },
  init: function () {
    // Create cylinder (base)
    let cylinder = document.createElement('a-cylinder');
    cylinder.setAttribute('radius', this.data.diameter/2);
    cylinder.setAttribute('height', this.data.height - this.data.crown_height);
    cylinder.setAttribute('color', 'saddlebrown');
    this.el.appendChild(cylinder);

    // Create cone (top)
    // const cone_layers = 3; // Number of cone layers
    let coefficient = 0;
    for (let i = 0; i < this.data.cone_layers; i++) {
      coefficient += Math.pow(.8, i);
    }
    const first_layer_height = this.data.crown_height / coefficient;
    let prev_layers_height_sum = 0;

    for (let i = 0; i < this.data.cone_layers; i++) {
      let cone = document.createElement('a-cone');
      let layerScale = 1 - i/this.data.cone_layers;
      console.log(this.data.cone_layers);
      let layerHeight = first_layer_height * Math.pow(.8, i);
      const radius_bottom = (this.data.crown_diameter / 2) * layerScale;
      let radius_top = 0;
      if (this.data.cone_layers == 2 && i == 0) {
        radius_top = radius_bottom / 4;
      } else {
        radius_top = i === this.data.cone_layers - 1 ? 0 : radius_bottom / (this.data.cone_layers - (i === this.data.cone_layers - 2 ? 0 : 1));
      }
      cone.setAttribute('radius-bottom', radius_bottom);
      cone.setAttribute('radius-top', radius_top);
      cone.setAttribute('height', layerHeight);
      cone.setAttribute('color', this.data.color);
      let yOffset = (this.data.height - this.data.crown_height)/2  + prev_layers_height_sum + (layerHeight / 2);
      cone.setAttribute('position', `0 ${yOffset} 0`);
      this.el.appendChild(cone);
      prev_layers_height_sum += layerHeight;
    }
  },
});

AFRAME.registerComponent("tree-terrain", {
  schema: {
    filename: { type: "string", default: "trees.txt" },
  },
  init: async function () {
    this.data.species_colors = {
      1: "magenta",
      2: "orange",
      3: "green",
    };
    const data = await this.readData(`tests/${this.data.filename}`);
    const rows = data.trim().split('\n');
    const sceneEl = document.querySelector('a-scene');
    for (let i = 1; i < rows.length; i++) {
        const tree_data = rows[i].split(',');
        const entityEl = document.createElement('a-entity');
        const speciesCode = parseInt(tree_data[6]);
        const color = this.data.species_colors[speciesCode] || "white";
        entityEl.setAttribute("tree", {
          diameter: parseFloat(tree_data[2]),
          height: parseFloat(tree_data[3]),
          crown_height: parseFloat(tree_data[4]),
          crown_diameter: parseFloat(tree_data[5]),
          species_code: speciesCode,
          color: color,
          cone_layers: parseFloat(tree_data[7]),
        });
        entityEl.setAttribute("position", `${parseFloat(tree_data[0])} ${(parseFloat(tree_data[3]) - parseFloat(tree_data[4]))/2} ${-parseFloat(tree_data[1])}`);
        sceneEl.appendChild(entityEl);
    }
  },

  readData: function(filename) {
    return new Promise((resolve, reject) => {
      THREE.Cache.enabled = true;
      const loader = new THREE.FileLoader();
      loader.load(
        filename,
        (data) => resolve(data),
        undefined,
        (error) => reject(error)
      );
    });
  }  
});