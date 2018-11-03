function init() {
    console.log("Three.js version: " + THREE.REVISION);   

    // listen to the resize events
    window.addEventListener('resize', onResize, false);
        
    var stats = initStats();

    // create a scene, that will hold all our elements such as objects, cameras and lights.
    var scene = new THREE.Scene();

    // create a render and set the size
    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0x000000));
    renderer.setSize(window.innerWidth, window.innerHeight);  
    renderer.shadowMap.enabled = true;  

    // create a camera, which defines where we're looking at.
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    // position and point the camera to the center of the scene
    camera.position.set(1, 8, 3);
    camera.up = new THREE.Vector3(0,0,1);
    camera.lookAt(scene.position);

    // add spotlight for the shadows
    var spotLight = new THREE.SpotLight(0xFFFFFF);
    spotLight.position.set(-10, 10, 8);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize = new THREE.Vector2(2048, 2048);
    spotLight.shadow.camera.far = 30;
    spotLight.shadow.camera.near = 5;

    // If you want a more detailled shadow you can increase the 
    // mapSize used to draw the shadows.
    // spotLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
    scene.add(spotLight);

    var ambienLight = new THREE.AmbientLight(0x353535);
    scene.add(ambienLight);    

    // show axes in the screen
    var axes = new THREE.AxesHelper(20);
    scene.add(axes);    

    // create the ground plane
    var planeGeometry = new THREE.PlaneGeometry(8, 8);
    var planeMaterial = new THREE.MeshLambertMaterial({
        color: 0xAAAAAA
    });
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true;    
    // rotate and position the plane
    plane.rotation.x = 0 * Math.PI;
    plane.position.set(0, 0, 0); 
    // add the plane to the scene
    scene.add(plane);       

    var sphereGeometry = new THREE.SphereGeometry(0.5, 20, 20);
    var sphereMaterial = new THREE.MeshLambertMaterial({
      color: 0x7777ff
    });
    var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.castShadow = true;    
    sphere.position.set( 1, 0, 0.5 );
    scene.add(sphere);
  
    // create a cube
    var cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    var cubeMaterial = new THREE.MeshLambertMaterial({
        color: 0xFF0000,
        wireframe: false
    });
    var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);  
    cube.castShadow = true;      
    // position the cube
    cube.position.set(0, 0, 0.5);
    // add the cube to the scene
    scene.add(cube);    
    
    // add the output of the renderer to the html element
    document.getElementById("webgl-output").appendChild(renderer.domElement);

    // call the render function
    var step = 0;

    var controls = new function () {
        this.rotationSpeed = 2;
    };

    var gui = new dat.GUI();
    gui.add(controls, 'rotationSpeed', 0, 10);

    var mouseControls = new THREE.OrbitControls(camera, renderer.domElement);
    mouseControls.rotationSpeed = 0.5;
    var clock = new THREE.Clock();

    renderScene();

    function renderScene() {
        // update the stats and the controls
        mouseControls.update(clock.getDelta());        
        stats.update();

        // rotate the cube around its axes
        cube.rotation.x += 0;
        cube.rotation.y += 0;
        cube.rotation.z += controls.rotationSpeed / 100;

        // bounce the sphere up and down
        step += controls.rotationSpeed / 100 * 2;
        sphere.position.z = 0.5 + (2 * Math.abs(Math.sin(step)));        

        // render using requestAnimationFrame
        requestAnimationFrame(renderScene);
        renderer.render(scene, camera);
    }

    function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }      
}