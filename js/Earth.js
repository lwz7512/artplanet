//-------- A planet Object for earth ---------
//--- by rainbirdtech.com -------

//----- core algorithm reference Google WebGL Globe -----
//http://code.google.com/p/webgl-globe/

//----- 2012/06/07 -----------
//-- lwz7512 ----

var RBT = RBT || {};

RBT.Earth = function(container){//container:DIV
	
	 var earth = this;//easily to reference...
	 
	 var radius = 200, distance=600;
	 var globeWidth=window.innerWidth-10, globeHeight=window.innerHeight-10;
	 var camera, controls, scene, projector, renderer;
	 var geometry, material, meshPlanet;
	 var objects = [];
	 //使用哪种摄影机控制器
	 var useOrbitControls = false;
	 
	 //TODO, NEW API USED FOR CITY BASED EARTH SEARTCH...
	 //2012/06/10
	 this.flyTo = function(lat, lng){//纬度、经度
		 
	 };
	 
	 //callback function...
	 this.onMeshClick = function(id,name){};//callback function
	 
	 //api implementation...	 	 
	 this.createCube = function (lat, lng, size, color, id, name){
		   var geometry = new THREE.CubeGeometry(0.75, 0.75, 1, 1, 1, 1, null, false, { px: true,
		          nx: true, py: true, ny: true, pz: false, nz: true});

		    for (var i = 0; i < geometry.vertices.length; i++) {
		      var vertex = geometry.vertices[i];
		      vertex.z += 0.5;
		    }
		    var material = new THREE.MeshBasicMaterial({
	            color: 0xffffff,
	            vertexColors: THREE.FaceColors,
	            morphTargets: false
	          });
		    var cube = new THREE.Mesh(geometry,material);
		    cube.id = id;
		    cube.name = name;
		    
		    //FIXME, 添加经纬线校准后结果
		    //2012/06/06
		    //TODO, 还要验证西经、南纬的计算公式，用负值表示
		    //2012/06/10
		    var phi = (90 - lat) * Math.PI / 180;
		    var theta = -lng * Math.PI / 180;		    	 

		    cube.position.x = radius * Math.sin(phi) * Math.cos(theta);
		    cube.position.y = radius * Math.cos(phi);
		    cube.position.z = radius * Math.sin(phi) * Math.sin(theta);		   
		    
		    cube.lookAt(meshPlanet.position);
		    
		    size = size*radius;
		    cube.scale.z = -size;
		    cube.updateMatrix();

		    var i;
		    for (i = 0; i < cube.geometry.faces.length; i++) {
		    	cube.geometry.faces[i].color = color;
		    }

		    scene.add(cube);
		    objects.push(cube);
		    
		    return cube;
	  }; //end of createCube

	
	 function init() {
		 
			scene = new THREE.Scene();
			projector = new THREE.Projector();
			
			renderer = new THREE.WebGLRenderer( { clearAlpha: 1, clearColor: 0x000000, antialias: true } );
			renderer.setSize(globeWidth, globeHeight);
			renderer.sortObjects = false;
			renderer.autoClear = false;
			renderer.gammaInput = true;
			renderer.gammaOutput = true;
			container.appendChild( renderer.domElement );
			
			camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
			camera.position.z = distance;
			scene.add( camera );
			
			
			if(useOrbitControls){
				//FIXME, 点击cube不能触发交互
				//所以暂时还不能使用该控制器
				//2012/06/07
				controls = new THREE.OrbitControls( camera );
				controls.addEventListener( 'change', render );
				controls.userZoomSpeed = 0.4;
			}else{
				controls = new THREE.TrackballControls( camera, renderer.domElement );
				controls.rotateSpeed = 1.0;
				controls.zoomSpeed = 1.2;
				controls.panSpeed = 0.2;		
				controls.dynamicDampingFactor = 0.3;
				controls.minDistance = radius * 1.1;
				controls.maxDistance = radius * 100;
			}								
			
			// planet
			material = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'textures/planets/earth_atmos_2048_meridian _line.jpg' ), overdraw: true } ); 		
			geometry = new THREE.SphereGeometry( radius, 100, 50 );
			geometry.computeTangents();

			meshPlanet = new THREE.Mesh( geometry, material );		
			
			scene.add( meshPlanet );
			
			// stars
			var starsGeometry = new THREE.Geometry();

			for ( var i = 0; i < 1500; i ++ ) {

				var vertex = new THREE.Vector3();
				vertex.x = Math.random() * 2 - 1;
				vertex.y = Math.random() * 2 - 1;
				vertex.z = Math.random() * 2 - 1;
				vertex.multiplyScalar( radius );

				starsGeometry.vertices.push( vertex );

			}

			var stars,
			starsMaterials = [
				new THREE.ParticleBasicMaterial( { color: 0x555555, size: 2, sizeAttenuation: false } ),
				new THREE.ParticleBasicMaterial( { color: 0x555555, size: 1, sizeAttenuation: false } ),
				new THREE.ParticleBasicMaterial( { color: 0x333333, size: 2, sizeAttenuation: false } ),
				new THREE.ParticleBasicMaterial( { color: 0x3a3a3a, size: 1, sizeAttenuation: false } ),
				new THREE.ParticleBasicMaterial( { color: 0x1a1a1a, size: 2, sizeAttenuation: false } ),
				new THREE.ParticleBasicMaterial( { color: 0x1a1a1a, size: 1, sizeAttenuation: false } )
			];

			for ( i = 10; i < 30; i ++ ) {

				stars = new THREE.ParticleSystem( starsGeometry, starsMaterials[ i % 6 ] );

				stars.rotation.x = Math.random() * 6;
				stars.rotation.y = Math.random() * 6;
				stars.rotation.z = Math.random() * 6;

				var s = i * 10;
				stars.scale.set( s, s, s );

				stars.matrixAutoUpdate = false;
				stars.updateMatrix();

				scene.add( stars );

			}
			
			window.addEventListener('resize', onWindowResize, false);
			document.addEventListener( 'click', onDocumentClick, false );
		 
	 } //end of init()
	 
	 //FIXME, NOT WORKABLE WHILE USE ORBITCONTROLS
	 //2012/06/07
	  function onWindowResize( event ) {
		  //FIXME, 用全部尺寸出现滚动条了，弄小点
		  //
		  globeWidth = window.innerWidth-10;
		  globeHeight = window.innerHeight-10;

		 if(!useOrbitControls){
				renderer.setSize( globeWidth, globeHeight );
				camera.aspect = globeWidth / globeHeight;
				camera.updateProjectionMatrix();
				
				controls.screen.width = globeWidth;
				controls.screen.height = globeHeight;
				
				camera.radius = ( globeWidth + globeHeight ) / 4;				
		}
			
	  }
	  
	  
	  function onDocumentClick(event){
		 
		  var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
		  projector.unprojectVector( vector, camera );

		  var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );
		  //检查对象列表
		  var intersects = ray.intersectObjects( objects );
		  
		  if ( intersects.length > 0 ) {
				var target = intersects[0].object;//this is mesh obj
				if(target.geometry instanceof THREE.CubeGeometry ){
					//callback to external function, deliver the object to outter app...
					if(earth.onMeshClick){
						earth.onMeshClick(target.id, target.name);
					}else{
						//console.log("no mesh click callback handler!");
					}
					//console.log("click on cube!");
				}
				//console.log(target);
		  }else{
			//console.log("no intersects  ");
		  }
			
	 } //end of document click
	
	
	//locally used for initial globe rotation...
	var rotateCamera = false;
	var cameraStartX = -75;
	var cameraStartY = 260;
	var cameraStartZ = -350;
	var xEnded = false;
	var yEnded = false;
	var zEnded = false;
	
	animate = function() {
		requestAnimationFrame( animate );
		
		render();//initially rotate globe...
		if(useOrbitControls) controls.update();
	};
	
	function render() {
		
		//加段动画，旋转地球到中国区域
		if(!rotateCamera){
			if(camera.position.x>cameraStartX){
				camera.position.x -= 1;
			}else{
				xEnded = true;
			}
			if(camera.position.y<cameraStartY){
				camera.position.y += 3;
			}else{
				yEnded = true;
			}
			if(camera.position.z>cameraStartZ){				
				camera.position.z -= 6;					
			}else{
				zEnded = true;
			}
			camera.lookAt( scene.position );
			
			if(xEnded && yEnded && zEnded){
				rotateCamera = true;
			}
			
		}
		
		if(!useOrbitControls) controls.update();	
		
		renderer.clear();
		renderer.render( scene, camera );		
	}
	
	 //--- Constructor ------------
	 init();
	 
	 //------- API NEED TO PUT IN BOTTOM -----------------	 
	 this.run = animate;
	
	return this;
	
}; //end of RBT.Earth;