var camera, scene, renderer, animmesh, controls;
var clock = new THREE.Clock();

var cameraAngle = 45,
    camerNear = 0.1,
    cameraFar = 10000;

var controls;


var cube;

var windowSize = {
    width: window.innerWidth,
    height: window.innerHeight
};

var pointLight;

var cylinders = [];

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function hexStr2HexVal(str) {
    return parseInt(str.replace(/^#/, ''), 16);
}

function init() {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(cameraAngle, window.innerWidth / window.innerHeight, camerNear, cameraFar);

//    camera.position.z = 500;
    
    camera.position.x = -497.0897588478286;
    camera.position.y = -10.282720712119367;
    camera.position.z = -52.877569000135736;
    
    camera.rotation.x = 2.747287683882044;
    camera.rotation.y = -1.5172379147024933;
    camera.rotation.z = 2.747796375502795;

    controls = new THREE.OrbitControls(camera);
//    controls.autoRotate = true;
    controls.addEventListener("change", function(abc) {
        console.log(camera);
    });

    scene.add(camera);

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    window.onresize = onWindowResize;
    onWindowResize();
    //renderer.shadowMap.enabled = true;
    //renderer.shadowMap.soft = false;
    // to antialias the shadow
    //renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0); // the default

    document.body.appendChild(renderer.domElement);

    //addCube();
    //addCircle(100);

    var zInterval = 30,
        noc = 8;

    //addCylinder(100, 5, 0);
    for (var i = 1; i <= noc; i++) {
        var z = (-1 + (i % 2) * 2) * (Math.floor(i / 2) * zInterval);
        //console.log(z);
        var cylinder = addCylinder(150, 2, z)
        console.log();
        //cylinder.material.color.setHex(hexStr2HexVal(circleColors[i - 1]));
        cylinder.material.color.setStyle(circleColors[i - 1]);
        cylinder.material.opacity=0.8;
        //cylinder.geometry.__dirtyColors = true;
        cylinders.push(cylinder);

        var rand = Math.random();
        cylinder.scale.set(0, 0, 0);
    }


    addSpotLight();
    //addAmbientLight();
    //addPointLight();
    //pointLightMove();

    animate();
}

function addSpotLight() {
    //var dirLight = new THREE.DirectionalLight(0xffffff, 0.5);

    //var light = dirLight;
    var light = new THREE.SpotLight(0xffffff, 1.5);
    light.position.set(0, 0, 500);

    light.castShadow = true;
    light.shadow.darkness = 0.8;

    var d = 100;
    light.shadow.camera.near = 100;
    light.shadow.camera.far = 600;
    /*light.shadow.camera.left = -d; // CHANGED
    light.shadow.camera.right = d; // CHANGED
    light.shadow.camera.top = d; // CHANGED
    light.shadow.camera.bottom = -d; // CHANGED*/

    light.shadow.camera.fov = 70;
    light.shadow.bias = -0.000222;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;

    scene.add(light);

    var newlight = light.clone(true, true);
    newlight.position.set(0, 0, -500);
    scene.add(newlight);
    //scene.add( new THREE.DirectionalLightHelper(light, 0.2) );
}

function addAmbientLight() {
    var ambientLight = new THREE.AmbientLight(0x808080, 1);
    scene.add(ambientLight);
}

function addPointLight() {
    pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.set(-300, 0, 300);
    scene.add(pointLight);

    /*
    pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.set(-200, -200, -200);
    scene.add(pointLight);
    */
}

function addCube() {
    var cubeGeometry = new THREE.CubeGeometry(100, 100, 100);
    var cubeMaterial = new THREE.MeshLambertMaterial({
        color: 0x1ec876
    });
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

    cube.rotation.y = Math.PI * 45 / 180;

    scene.add(cube);
}

function addCircle(radius) {
    var material = new THREE.MeshBasicMaterial({
        color: 0x1ec876,
        side: THREE.DoubleSide
    });

    //var radius = 5;
    var segments = 32;

    var circleGeometry = new THREE.CircleGeometry(radius, segments);
    var circle = new THREE.Mesh(circleGeometry, material);
    scene.add(circle);

    material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide
    });

    var circleGeometry = new THREE.CircleGeometry(radius / 2, segments);
    var circle = new THREE.Mesh(circleGeometry, material);
    circle.position.z += 50;
    scene.add(circle);
}

function addCylinder(radius, height, z) {

    var radiusTop = radius,
        radiusBottom = radius,
        segments = 360;

    var geometry = new THREE.CylinderGeometry(radius, radius, height, segments);
    var material = new THREE.MeshLambertMaterial({
        transparent: true,
        opacity: 0.5
        //color: 0xffff00,
        //specular: 0x009900,
        //shininess: 15,
        //shading: THREE.FlatShading
    });
    var cylinder = new THREE.Mesh(geometry, material);

    cylinder.rotation.x = 90 / 180 * Math.PI;
    cylinder.position.z = z;
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;

    scene.add(cylinder);

    return cylinder;
}

function pointLightMove() {
    renderer.domElement.onmousemove = function (ev) {
        var pos = mouse2ThreeCoord(ev.clientX, ev.clientY);
        pointLight.position.set(pos.x, pos.y, camera.position.z);
    }
}

function mouse2ThreeCoord(x, y) {
    var vector = new THREE.Vector3();

    vector.set(
        (x / windowSize.width) * 2 - 1, -(y / windowSize.height) * 2 + 1,
        0.5);

    vector.unproject(camera);

    var dir = vector.sub(camera.position).normalize();

    var distance = -camera.position.z / dir.z;

    var pos = camera.position.clone().add(dir.multiplyScalar(distance));
    return pos;
}

function animate() {
    if(isPlaying) {
        updateCylinders();
        //updatePointLight();
        render();
        controls.update();
    }
    
    requestAnimationFrame(animate);
}

function updatePointLight() {
    pointLight.position.set(camera.position.x, camera.position.y, camera.position.z);
}

function updateCylinders() {
    if (!isPlaying)
        return;

    // Get the new frequency data
    analyser.getByteFrequencyData(frequencyData);

    var k = 0;
    //console.log(k);
    for (var i = 0; i < cylinders.length; i++, k += 3) {

        var scale = frequencyData[k] / 255;
        cylinders[i].scale.set(scale, scale, scale);
        //console.log(frequencyData[i]);
    }
}

function render() {
    renderer.render(scene, camera);
    //camera.lookAt(cube);
    //camera.lookAt(new THREE.Vector3(0, 0, 0));
}
init();