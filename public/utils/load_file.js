THREE.Cache.enabled = true;

function loadFile(file) {
  const loader = new THREE.FileLoader();
  const data = loader.load(file, function (data) {
    console.log(data);
  });
  return data;
}

export { loadFile };
