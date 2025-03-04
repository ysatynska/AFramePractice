import { loadFile } from "../utils/load_file.js";

AFRAME.registerComponent("tree", {
  schema: {
    diameter: { type: "number" },
    height: { type: "number" },
    crown_height: { type: "number" },
    crown_diameter: { type: "number" },
    species_code: { type: "number" },
    color: { type: "string" },
  },
  init: function () {
    this.color = "red";
  },
});

AFRAME.registerComponent("tree-terrain", {
  schema: {
    filename: { type: "string" },
  },
  init: function () {
    const data = loadFile(filename);
  },
});