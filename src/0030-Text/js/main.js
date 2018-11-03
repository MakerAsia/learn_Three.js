var scene, renderer, camera, controls;
var stats, gui, parameters;

function init() {

    stats = initStats();

    // create a scene, that will hold all our elements such as objects, cameras and lights.
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xf0f0f0 );    

    // create a camera, which defines where we're looking at.
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.up = new THREE.Vector3(0,0,1);

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set( 0, - 200, 600 );
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.target.set( 0, 0, 0 );
    controls.update();    
    


    loadScene();
    addAxis();

    gui = new dat.GUI();
    gui.domElement.style.zIndex = "100";

    parameters =
    {
        text: "Hello World!",
        plateEnabled: true,
    }    
    var folder1 = gui.addFolder('Text');
    folder1.add( parameters, "text").name("Text").onChange(updateText);
    folder1.add( parameters, "plateEnabled").name("Plate").onChange(updateText);    

    document.getElementById("webgl-output").appendChild(renderer.domElement);

    window.addEventListener( 'resize', onWindowResize, false );  
    
    render();    
}

function updateText() {
    console.log( parameters.text );
}

function addAxis() {
    // show axes in the screen
    var axes = new THREE.AxesHelper(20);
    scene.add(axes);  
}

function loadScene() {
    var loader = new THREE.FontLoader();
    loader.load( '../assets/fonts/helvetiker_regular.typeface.json', function ( font ) {
        var xMid, yMid, text;
        var color = 0x006699;
        var matLite = new THREE.MeshBasicMaterial( {
            color: color,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        } );
        var message = parameters.text;
        var shapes = font.generateShapes( message, 100 );
        var geometry = new THREE.ShapeBufferGeometry( shapes );
        geometry.computeBoundingBox();
        xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
        yMid = - 0.5 * ( geometry.boundingBox.max.y - geometry.boundingBox.min.y );

        geometry.translate( xMid, yMid, 0 );
        // make shape ( N.B. edge view not visible )
        text = new THREE.Mesh( geometry, matLite );
        //text.position.z = - 150;
        scene.add( text );
    });
}

function animate() {
    requestAnimationFrame( animate );
    render();
}    

function render() {
    stats.update();

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}