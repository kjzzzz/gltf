
import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r125/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/controls/OrbitControls.js';
import {GUI} from 'https://threejsfundamentals.org/threejs/../3rdparty/dat.gui.module.js';
import {GLTFExporter} from 'https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/exporters/GLTFExporter.js';

function UpdateCamera(camera){
    camera.updateProjectionMatrix();
}

function CreateTexture(RANDOM){
    const N = RANDOM.N
    let tr = zeros([N, N]);
    let ti = zeros([N, N]);
    let Fmin = Number(document.getElementById("fmin").value);
    let Fmax = Fmin + Number(document.getElementById("frange").value);
    let exponent = Number(document.getElementById("exponent").value);
    document.getElementById("fmin-output").textContent = Fmin;
    document.getElementById("frange-output").textContent = Fmax - Fmin;
    document.getElementById("exponent-output").textContent = exponent.toFixed(1);
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            if (i == 0 && j == 0){continue;}
            let f1 = Math.min(i, N-i);
            let f2 = Math.min(j, N-j);
            let f = Math.sqrt(f1*f1+f2*f2);
            let scale = (Fmin <= f && f <= Fmax) * Math.pow(f, 2*exponent);
            let x = RANDOM.x.get(i, j) * scale;
            let y = RANDOM.y.get(i, j) * scale;
            tr.set(i, j, x);
            ti.set(i, j, y);
        }
    }
    outputToCanvas2D('2d-r', tr, true);
    fft(-1, tr, ti);
    outputToCanvas2D('ifft-2d-r', tr);
    console.log("tr",tr)
    return tr;
}

function CreateRandomValue(N){
    return new RandomValues(N);
}

function CreateMaterial(texture){
    texture.flipY=false;
    const material = new THREE.MeshBasicMaterial({
        // color:0x987654,
        side:THREE.DoubleSide,
        map:texture,
    })
    return material;
}

// function MyFilter(map,X,Y){
//     const W=map.shape[0];
//     const H=map.shape[1];
//     let remap = [];
//     for(let i=0;i<X;i++){
//         for(letj=0;j<Y;j++){

//         }
//     }
// }

function CreateGeometry(height){
    let size = height.shape[0];
    let vertices = [],indices = [],uv = [];
    CreateGeometry.buffers=[];
    CreateGeometry.buffers[height.shape[0]] = zeros(height.shape);
    let scale = .5;
    let scaled = CreateGeometry.buffers[height.shape[0]];
    let inf = ops.inf(height), sup = ops.sup(height);
    let mul = scale / Math.max(1e-4, (sup - inf)), add = -inf;
    ops.adds(scaled, height, add);
    ops.mulseq(scaled, mul);
    ops.adds(scaled,scaled,-0.5*scale);
    // console.log(height)
    // size-=1;
    for(let row=0;row<=size;row++){
        let y = row/size;
        for(let col=0;col<=size;col++){
            let x = (col-0.25+0.5*(row&1))/size;
            if(row*size+col >=scaled.shape[0]*scaled.shape[1])
                vertices.push(x,y,0);
            else
                vertices.push(x,y,scaled.data[row*size+col]);
            uv.push(row/size,col/size)
            if(row>0&&col<size){
                let i = vertices.length/3-1;
                if(row&1){
                    indices.push(i+1,i,i-size);
                    indices.push(i,i-size-1,i-size);
                }
                else{
                    indices.push(i,i+1,i-size-1);
                    indices.push(i+1,i-size-1,i-size);
                }
            }
        }
    }
    // for (let i=0;i<indices.length;++i){
    //     indices[i]*=3;
    // }
    // let position = [];
    // for(let i=0;i<indices.length;i+=3){
    //     position.push(
    //         vertices[indices[i]],vertices[indices[i]+1],vertices[indices[i]+2],
    //         vertices[indices[i+1]],vertices[indices[i+1]+1],vertices[indices[i+1]+2],
    //         vertices[indices[i+2]],vertices[indices[i+2]+1],vertices[indices[i+2]+2],
    //     )
    // }
    // console.log("position",position);
    // console.log(vertices,indices)
    // console.log('uv',uv);
    // position = new Float32Array(position);
    uv = new Float32Array(uv);
    vertices = new Float32Array(vertices)
    // indices = new Float32Array(indices)

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.BufferAttribute(vertices,3));
    geometry.setIndex(indices);
    geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2))
    return geometry;
}
class GUIHelper{
    constructor(obj,prop){
        this.obj=obj;
        this.prop=prop;
    }
    get value() {
        return `#${this.object[this.prop].getHexString()}`;
    }
    set value(hexString) {
        this.object[this.prop].set(hexString);
    }
}
const scene = new THREE.Scene();
function Exporter(){
    const exporter = new GLTFExporter();
    // let options = {
    //     trs: document.getElementById( 'option_trs' ).checked,
    //     onlyVisible: document.getElementById( 'option_visible' ).checked,
    //     truncateDrawRange: document.getElementById( 'option_drawrange' ).checked,
    //     binary: document.getElementById( 'option_binary' ).checked,
    //     forcePowerOfTwoTextures: document.getElementById( 'option_forcepot' ).checked,
    //     maxTextureSize: Number( document.getElementById( 'option_maxsize' ).value ) || Infinity // To prevent NaN value
    // };

    // Parse the input and generate the glTF output
    exporter.parse( scene, function ( gltf ) {
        console.log( gltf );
        var output = JSON.stringify( gltf, null, 2 );
		console.log( output );
		saveString( output, 'scene.gltf');
    });
}

function saveString( text, filename ) {
	save( new Blob( [ text ], { type: 'text/plain' } ), filename );
}
function save( blob, filename ){
    var link = document.createElement("a");
	link.href = URL.createObjectURL( blob );
	link.download = filename;
	link.click();
	// URL.revokeObjectURL( url ); breaks Firefox...
}

function main(){
    const canvas = document.querySelector('#ifft-2d-heightmap');
    const renderer = new THREE.WebGLRenderer({canvas});
    //camera
    const fov=45;
    const aspect=canvas.clientWidth/canvas.clientHeight;
    const near = .1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov,aspect,near,far);
    camera.position.set(0,0,2);
    //controls
    const controls = new OrbitControls(camera,canvas);
    controls.target.set(0,0.5,0);
    controls.update();

    //scene
    
    scene.background = new THREE.Color(0x123456);
    const planeSize = 2;
    //plane
    const loader = new THREE.TextureLoader();

    
    // light
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.AmbientLight(color, intensity);
    scene.add(light);

    // object
    let random = CreateRandomValue(128);
    const height = CreateTexture(random);
    const geometry = CreateGeometry(height);
    let png = document.getElementById("ifft-2d-r");
    let objtexture = loader.load(png.toDataURL());
    objtexture.magFilter = THREE.LinearFilter;
    let material = CreateMaterial(objtexture);
    const obj = new THREE.Mesh(geometry,material);
    scene.add(obj);
    console.log(obj);

    const texture = loader.load(png.toDataURL());
    texture.magFilter = THREE.NearestFilter;
    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshToonMaterial({
     map: texture,
    side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    // mesh.rotation.x = Math.PI * -.5;
    // mesh.position.set(0,-1,0);
    const scale = 1/2;
    const transform = new THREE.Matrix4();
    transform.set(
        scale,0,0,-0.55,
        0,scale,0,0.5,
        0,0,scale,0,
        0,0,0,1
    );
    mesh.applyMatrix4(transform);
    mesh.rotateZ(-Math.PI/2);
    scene.add(mesh);

    function render(){
        UpdateCamera(camera);
        // texture = CreateTexture(random)
        // material = CreateMaterial(texture);
        // obj.material = material;
        // obj.geometry =CreateGeometry(texture)
        renderer.render(scene,camera);
        requestAnimationFrame(render);
        // Exporter();
    }
    requestAnimationFrame(render);
}
main();
