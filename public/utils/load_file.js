THREE.Cache.enabled = true;

function loadFile(file) {
  console.log("in load file");
  const loader = new THREE.FileLoader();
  const data = loader.load(file, function (data) {
    console.log(data);
  });
  return data;
}

export { loadFile };
