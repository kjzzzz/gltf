import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r125/build/three.module.js';

const VertexShaderSource=`
    attribute vec4 a_position;
    attribute vec4 a_color;
    attribute vec4 a_normal;
    
    uniform vec4 u_lightColor;
    uniform vec4 u_lightPos;
    uniform vec4 u_ambient;
    uniform mat4 u_model;
    uniform mat4 u_view;
    uniform mat4 u_project;
    uniform mat4 u_normalMatrix;
    
    varying vec4 v_color;
    void main(){
        gl_Position = u_project * u_view * u_model * a_position;
        
        vec4 normal = normalize(u_normalMatrix * a_normal);
        vec4 lightDir = normalize(u_lightPos - u_model * a_position);
        float intense = max(dot(lightDir ,normal),0.0);
        vec4 diffuse = u_lightColor * a_color * intense;
        vec4 ambient = u_ambient * a_color;
        v_color = diffuse + ambient;
    }
`;
const FragmentShaderSource=`
    precision mediump float;
    varying vec4 v_color;
    void main(){
        gl_FragColor = v_color;
    }
`;
const canvas = document.getElementById('test');
const gl = canvas.getContext('webgl');
const prg = gl.createProgram();

function InitVertex(){
    const bufferdata = new Float32Array([
        0.0, 0.5, -0.4, 0.4, 1.0, 0.4,
        -0.5, -0.5, -0.4, 0.4, 1.0, 0.4,
        0.5, -0.5, -0.4, 1.0, 0.4, 0.4,
        
        0.5, 0.4, -0.2, 1.0, 0.4, 0.4,
        -0.5, 0.4, -0.2, 1.0, 1.0, 0.4,
        0.0, -0.6, -0.2, 1.0, 1.0, 0.4,

        0.0, 0.5, 0.0, 0.4, 0.4, 1.0,
        -0.5, -0.5, 0.0, 0.4, 0.4, 1.0,
        0.5, -0.5, 0.0, 1.0, 0.4, 0.4,
    ]);
    console.log(bufferdata);
    const position_location = gl.getAttribLocation(prg,'a_position');
    const color_location = gl.getAttribLocation(prg,'a_color');
    const posBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();
    const size = bufferdata.BYTES_PER_ELEMENT;

    gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,bufferdata,gl.STATIC_DRAW);
    gl.enableVertexAttribArray(position_location);
    gl.vertexAttribPointer(position_location,3,gl.FLOAT,false,size*6,0);

    gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,bufferdata,gl.STATIC_DRAW);
    gl.enableVertexAttribArray(color_location);
    gl.vertexAttribPointer(color_location,3,gl.FLOAT,false,size*6,size*3);

    return bufferdata.length/6;
}

function InitCube() {
    const vertex = new Float32Array([
        1,1,1, 1,1,1,
        -1,1,1, 1,0,1,
        -1,-1,1, 1,0,0,
        1,-1,1, 0,1,0,
        1,1,-1, 1,1,0,
        1,-1,-1, 0,1,1,
        -1,1,-1, 0,0,1,
        -1,-1,-1, 0,0,0
    ]);
    const indices = new Uint8Array([
        0,1,2, 0,2,3, 0,3,5, 0,5,4, 0,4,6, 0,6,1,
        7,3,2, 7,5,3, 7,1,6, 7,2,1, 7,6,4, 7,4,5
    ]);

    const buffer = new Float32Array([
        1,1,1, 0,0,1, 1,0,0,//0
        1,1,1, 0,1,0, 1,0,0,
        1,1,1, 1,0,0, 1,0,0,

        -1,1,1, 0,0,1, 1,0,0,//1
        -1,1,1, 0,1,0, 1,0,0,
        -1,1,1, -1,0,0, 1,0,0,

        -1,-1,1, 0,0,1, 1,0,0,//2
        -1,-1,1, 0,-1,0, 1,0,0,
        -1,-1,1, -1,0,0, 1,0,0,

        1,-1,1, 0,0,1, 1,0,0,//3
        1,-1,1, 0,-1,0, 1,0,0,
        1,-1,1, 1,0,0, 1,0,0,
        //
        1,1,-1, 0,0,-1, 1,0,0,//4
        1,1,-1, 0,1,0, 1,0,0,
        1,1,-1, 1,0,0, 1,0,0,

        1,-1,-1, 0,0,-1, 1,0,0,//5
        1,-1,-1, 0,-1,0, 1,0,0,
        1,-1,-1, 1,0,0, 1,0,0,

        -1,1,-1, 0,0,-1, 1,0,0,//6
        -1,1,-1, 0,1,0, 1,0,0,
        -1,1,-1, -1,0,0, 1,0,0,

        -1,-1,-1, 0,0,-1, 1,0,0,//7
        -1,-1,-1, 0,-1,0, 1,0,0,
        -1,-1,-1, -1,0,0, 1,0,0
    ]);
    const index=new Uint8Array([
        0,3,6, 0,6,9, 2,11,17, 2,17,14, 1,13,19, 1,19,4,
        22,10,7, 22,16,10, 23,5,20, 23,8,5, 21,18,12, 21,12,15
    ]);



    const position_location = gl.getAttribLocation(prg,'a_position');
    const color_location = gl.getAttribLocation(prg,'a_color');
    const normal_location = gl.getAttribLocation(prg,'a_normal');
    const posBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();
    const normalBuffer = gl.createBuffer();
    const indexBuffer = gl.createBuffer();
    const size = buffer.BYTES_PER_ELEMENT;
    const stride = buffer.length/24;

    gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,buffer,gl.STATIC_DRAW);
    gl.enableVertexAttribArray(position_location);
    gl.vertexAttribPointer(position_location,3,gl.FLOAT,false,size*stride,0);

    gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,buffer,gl.STATIC_DRAW);
    gl.enableVertexAttribArray(color_location);
    gl.vertexAttribPointer(color_location,3,gl.FLOAT,false,size*stride,size*6);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,index,gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,buffer,gl.STATIC_DRAW);
    gl.enableVertexAttribArray(normal_location);
    gl.vertexAttribPointer(normal_location,3,gl.FLOAT,false,size*stride,size*3);
    //
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,nindexBuffer);
    // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,n_indices,gl.STATIC_DRAW);

    console.log(indices.length);
}

function Draw(){
    let xrot = Number(document.getElementById('xrot').value);
    let yrot = Number(document.getElementById('yrot').value);
    let box = Number(document.getElementById('box').value);

    xrot = xrot/180*Math.PI;
    const model_location = gl.getUniformLocation(prg,'u_model');
    const view_location = gl.getUniformLocation(prg,'u_view');
    const project_location = gl.getUniformLocation(prg,'u_project');
    const lightColor_location = gl.getUniformLocation(prg,'u_lightColor');
    const lightPos_location = gl.getUniformLocation(prg,'u_lightPos');
    const ambient_location = gl.getUniformLocation(prg,'u_ambient');
    const normalMatrix_location = gl.getUniformLocation(prg,'u_normalMatrix');


    gl.uniform4f(lightPos_location,0,0,10,1);
    gl.uniform4f(ambient_location,0.2,0.2,0.2,1.0);
    let intense = 1.0;
    gl.uniform4f(lightColor_location,intense,intense,intense,1.0);

    let model = new THREE.Matrix4();
    let view = new THREE.Matrix4();
    let project = new THREE.Matrix4();

    let translation = new THREE.Matrix4();
    let rotation = new THREE.Matrix4();
    let scale = new THREE.Matrix4();

    //MVP.makePerspective(-box,box,box,-box,0.1,10);
    project.makeOrthographic(-box,box,box,-box,0.1,10);
    model.makeRotationFromEuler(new THREE.Euler(Math.PI/6,Math.PI/6,0));
    translation.makeTranslation(2*Math.sin(xrot),0,2*Math.cos(xrot));
    rotation.makeRotationFromEuler(new THREE.Euler(0,xrot,0));
    view.multiply(translation).multiply(rotation).multiply(scale);
    view.invert();
    let normalMatrix = model.clone();
    normalMatrix.invert().transpose();
    console.log(view.elements,normalMatrix.elements);
    // MVP.lookAt(
    //     new THREE.Vector3(Math.sin(xrot),1,Math.cos(xrot)), //eye point
    //     new THREE.Vector3(0,0,0),// look-at point
    //     new THREE.Vector3(0,1,0));// up vec
    gl.uniformMatrix4fv(model_location,false,model.elements);
    gl.uniformMatrix4fv(view_location,false,view.elements);
    gl.uniformMatrix4fv(project_location,false,project.elements);
    gl.uniformMatrix4fv(normalMatrix_location,false,normalMatrix.elements);




    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    //gl.drawArrays(gl.TRIANGLES,0,9);
    gl.drawElements(gl.TRIANGLES,36,gl.UNSIGNED_BYTE,0);
}

function main(){
    const vs = gl.createShader(gl.VERTEX_SHADER), fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vs,VertexShaderSource);
    gl.compileShader(vs);
    if(!gl.getShaderParameter(vs,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(vs));

    gl.shaderSource(fs,FragmentShaderSource);
    gl.compileShader(fs);
    if(!gl.getShaderParameter(fs,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(fs));

    gl.attachShader(prg,vs);
    gl.attachShader(prg,fs);
    gl.linkProgram(prg);
    if(!gl.getProgramParameter(prg,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(prg));
    gl.useProgram(prg);
    //gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    // const n = InitVertex();
    InitCube();
    Draw();
    document.getElementById('xrot').oninput = Draw;
    document.getElementById('yrot').oninput = Draw;
    document.getElementById('box').oninput = Draw;
}

main();