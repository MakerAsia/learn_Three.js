var scene, renderer, camera, controls;
var stats, gui, parameters;
var dirLight, pointLight;

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
    
    gui = new dat.GUI();
    gui.domElement.style.zIndex = "100";

    parameters =
    {
        text: "Hello World!",
        Convert: "Preview",
    }    
    var folder1 = gui.addFolder('Text');
    folder1.add( parameters, "text").name("Text").onChange(updateText);

    gui.add(parameters, 'Convert', {
        "(Text Preview)": "Preview", 
        "Laser Cutter (SVG)": "SVG", 
        "3D Printer (STL)": "STL"
    }).onChange(updateText)    

    addAxis();
    addLight();

    updateText();  

    document.getElementById("webgl-output").appendChild(renderer.domElement);

    window.addEventListener( 'resize', onWindowResize, false );  
    
    render();    
}

function addLight() {
    dirLight = new THREE.DirectionalLight( 0xffffff, 0.125 );
    dirLight.position.set( 0, 0, 1 ).normalize();
    scene.add( dirLight );
    
    pointLight = new THREE.PointLight( 0xffffff, 1.5 );
    pointLight.position.set( 0, 100, 90 );
    scene.add( pointLight );
}

function addAxis() {
    // show axes in the screen
    var axes = new THREE.AxesHelper(20);
    scene.add(axes);  
}

function updateText() {
    var currentText = scene.getObjectByName('text');
    if (currentText) 
        scene.remove(currentText);
    var currentPlate = scene.getObjectByName('plate');
    if (currentPlate) 
        scene.remove(currentPlate);

    createText();
}

function createObject( shapes ) {
    var xMid, yMid, text;
    var color = 0x006699;
    var matLite = new THREE.MeshBasicMaterial( {
        color: color,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
    } );
    var matDark = new THREE.LineBasicMaterial( {
        color: color,
        side: THREE.DoubleSide
    } );      
    var matSolid = new THREE.MeshBasicMaterial( {
        color: color,
        transparent: false,
        side: THREE.DoubleSide
    } );          

    materials = [
        new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } ), // front
        new THREE.MeshPhongMaterial( { color: 0xffffff } ) // side
    ];    

    //text.position.z = - 150;
    if( parameters.Convert == 'Preview' ) {
        var geometry = new THREE.ShapeBufferGeometry( shapes );
        geometry.computeBoundingBox();
        xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
        yMid = - 0.5 * ( geometry.boundingBox.max.y - geometry.boundingBox.min.y );

        geometry.translate( xMid, 0, 0 );
        // make shape ( N.B. edge view not visible )
        text = new THREE.Mesh( geometry, matLite );
        text.name = "text"

        scene.add( text );
    }
    else if( parameters.Convert == 'SVG' ) {
        var holeShapes = [];
        for ( var i = 0; i < shapes.length; i ++ ) {
            var shape = shapes[ i ];
            if ( shape.holes && shape.holes.length > 0 ) {
                for ( var j = 0; j < shape.holes.length; j ++ ) {
                    var hole = shape.holes[ j ];
                    holeShapes.push( hole );
                }
            }
        }
        shapes.push.apply( shapes, holeShapes );     
        
        var lineText = new THREE.Object3D();
        for ( var i = 0; i < shapes.length; i ++ ) {
            var shape = shapes[ i ];
            var points = shape.getPoints();
            var geometry = new THREE.BufferGeometry().setFromPoints( points );

            var lineMesh = new THREE.Line( geometry, matDark );
            lineText.add( lineMesh );                
        }
        var helper = new THREE.BoxHelper(lineText, 0xff0000);
        helper.update();
        helper.geometry.computeBoundingBox();
        xMid = - 0.5 * ( helper.geometry.boundingBox.max.x - helper.geometry.boundingBox.min.x );
        yMid = - 0.5 * ( helper.geometry.boundingBox.max.y - helper.geometry.boundingBox.min.y );            

        //lineText.translate( 0, 0, 0 );
        lineText.translateOnAxis( new THREE.Vector3(1, 0, 0), xMid );

        lineText.name = "text"
        scene.add( lineText );            
    }
    else if( parameters.Convert == 'STL' ) {

        var extrusionSettings = {
            amount: 20, curveSegments: 12,
            bevelThickness: 1, bevelSize: 2, bevelEnabled: false,
            material: 0, extrudeMaterial: 1
        };
        
        var lineText = new THREE.Object3D();
        for ( var i = 0; i < shapes.length; i ++ ) {
            var shape = shapes[ i ];
            var geometry = new THREE.ExtrudeGeometry( shape, extrusionSettings ); 

            var lineMesh = new THREE.Mesh( geometry, materials );
            lineText.add( lineMesh );                
        }
        var helper = new THREE.BoxHelper(lineText, 0xff0000);
        helper.update();
        helper.geometry.computeBoundingBox();
        xMid = - 0.5 * ( helper.geometry.boundingBox.max.x - helper.geometry.boundingBox.min.x );
        yMid = - 0.5 * ( helper.geometry.boundingBox.max.y - helper.geometry.boundingBox.min.y );            

        //lineText.translate( 0, 0, 0 );
        lineText.translateOnAxis( new THREE.Vector3(1, 0, 0), xMid );

        lineText.name = "text"
        scene.add( lineText );           
    }
}

function createText() {
    var loader = new THREE.FontLoader();
    loader.load( '../assets/fonts/droid/droid_sans_regular.typeface.json', function ( font ) {
        var message = parameters.text;
        var shapes = font.generateShapes( message, 100 );

        createObject(shapes);

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