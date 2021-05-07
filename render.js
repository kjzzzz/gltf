/*
 * From https://www.redblobgames.com/articles/noise/2d/
 * Copyright 2019 Red Blob Games <redblobgames@gmail.com>
 * License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
 *
 * In 2013 I implemented the 3D renderer in raw WebGL. It created a
 * new mesh on redraw with the x, y, z, rgb values calculated on the
 * CPU. In 2019 I rewrote it to use regl.js. It creates an x,y mesh
 * statically, fills the z values into a texture to be used in the
 * vertex shader, and calculates rgb in the fragment shader. It also
 * adds outlines.
 */
'use strict';

const regl = createREGL({
    canvas: "#ifft-2d-heightmap",
    extensions: ['OES_element_index_uint', 'OES_standard_derivatives'],
});

// const textureCanvas = document.createElement('canvas');
const textureCanvas = document.getElementById('test')
const texture = regl.texture({data: textureCanvas, min: 'linear', max: 'linear', wrap: 'clamp'});

const staticMesh = (function createMesh(size) {
    // const size = 100;
    const rows = size, cols = size;
    let xy = [], elements = [];
    for (let r = 0; r <= rows; r++) {
        let y = r / rows;
        for (let q = 0; q <= cols; q++) {
            let x = (q - 0.25 + 0.5 * (r & 1)) / cols;
            xy.push(x, y);
            if (r > 0 && q < cols) {
                let i = xy.length / 2 - 1;
                if (r % 2 === 0) {
                    // elements.push(i, i-cols-1, i+1);
                    // elements.push(i+1, i-cols-1, i-cols);
                    elements.push(i,i-cols-1,i-cols);
                    elements.push(i+1,i,i-cols);
                } else {
                    // elements.push(i, i-cols-1, i-cols);
                    // elements.push(i, i-cols, i+1);
                    elements.push(i,i+1,i-cols-1);
                    elements.push(i+1,i-cols-1,i-cols);
                }
            }
        }
    }
    return {xy, elements};
});
// console.log("mesh:",staticMesh)

const renderer = function(staticMesh){
return regl({
    frag: `
#extension GL_OES_standard_derivatives : enable
precision mediump float;

uniform float u_outline;

varying float z;
varying vec2 v_uv;

void main() {
  float light = 0.3 + 0.7 * z - fwidth(z)* u_outline;
//   light = light * smoothstep(0.0, 0.2, smoothstep(0.3, 0.4, fract(z * 30.0))) * fwidth(z) * 400.0; // contour lines
  gl_FragColor = vec4(light, light, light, 1);
}`,

    vert: `
precision highp float;

attribute vec2 a_uv;

uniform sampler2D u_texture;
uniform float u_texturesize;
uniform mat4 u_view;
uniform mat4 u_zrot;
uniform mat4 u_xrot;
uniform mat4 u_yrot;

varying vec2 v_uv;
varying float z;

void main() {
  v_uv = a_uv;
  vec2 uv_floor = floor(v_uv * u_texturesize);
  vec2 uv_frac = fract(v_uv * u_texturesize);
  z = mix(
      mix(texture2D(u_texture, uv_floor/u_texturesize).g, 
          texture2D(u_texture, (uv_floor+vec2(1,0))/u_texturesize).g,
          uv_frac.x),
      mix(texture2D(u_texture, (uv_floor+vec2(0,1))/u_texturesize).g, 
          texture2D(u_texture, (uv_floor+vec2(1,1))/u_texturesize).g,
          uv_frac.x),
      uv_frac.y);
    float a=1.0;
    float b = -0.5;
    v_uv = a*v_uv+b;
  gl_Position = u_xrot*u_yrot*u_zrot * vec4(v_uv, 0.5 * (1.0 - z), 1.0);
}`,

    uniforms: {
        u_texture: texture,
        u_texturesize: regl.prop('u_texturesize'),
        u_light1: [-0.2, 0.5, -0.6],
        u_light2: [0.7, -0.2, -0.5],
        // u_view: regl.prop('u_view'),
        u_zrot: regl.prop('u_zrot'),
        u_yrot: regl.prop('u_yrot'),
        u_xrot: regl.prop('u_xrot'),
        u_outline: regl.prop('u_outline'),
        u_aba:0
    },

    depth: {
        enable:true,
    },

    attributes: {
        a_uv: staticMesh.xy,
    },
    elements: staticMesh.elements,
})
}


function updateBuffers(array) {
    let W = array.shape[0], H = array.shape[1];
    textureCanvas.width = W;
    textureCanvas.height = H;

    let scaled = zeros(array.shape);
    let inf = ops.inf(array), sup = ops.sup(array);
    let mul = 255 / Math.max(1e-4, (sup - inf)), add = -inf;
    ops.adds(scaled, array, add);
    ops.mulseq(scaled, mul);

    const ctx = textureCanvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, W, H);
    const pixels = imageData.data;

    for (let x = 0; x < W; x++) {
        for (let y = 0; y < H; y++) {
            let pos = 4 * (y * W + x);
            let z = scaled.get(x, y);
            pixels[pos] = z;
            pixels[pos+1] = z;
            pixels[pos+2] = z;
            pixels[pos+3] = 255;
        }
    }
    ctx.putImageData(imageData, 0, 0);

    texture({data: textureCanvas});
}

let u_outline = 15.0;
function draw() {
    u_outline =  Number(document.getElementById("outline").value);
    document.getElementById("outline-output").textContent = u_outline.toFixed(1);
    // let s = 0.3 * Math.PI;
    // let t = 0.4 * Math.PI;
    // let a = Math.cos(t), b = Math.sin(t), c = Math.cos(s), d = Math.sin(s), k=1;
    // let u_view = [k*b , k*a*c, k*a*d/10, 0,
    //               k*a ,-k*b*c,-k*b*d/10, 0,
    //               0   ,  -k*d,   k*c/10, 0,
    //               0   ,    0,         0, 1];
    regl.clear({color: [0.5, 0.5, 0.6, 1.0]});
    let tri =  Number(document.getElementById("tri").value);
    document.getElementById("tri-output").textContent = tri.toFixed(1);

    let deg =  Number(document.getElementById("zrot").value);
    document.getElementById("zrot-output").textContent = deg.toFixed(1);
    let rad = deg /180 * Math.PI;
    let u_zrot = [
        Math.cos(rad),-Math.sin(rad),0,0,
        Math.sin(rad),Math.cos(rad),0,0,
        0,0,1,0,
        0,0,0,1
    ];

    deg =  Number(document.getElementById("yrot").value);
    document.getElementById("yrot-output").textContent = deg.toFixed(1);
    rad = deg /180 * Math.PI;
    let u_yrot = [
        Math.cos(rad),0,Math.sin(rad),0,
        0,1,0,0,
        -Math.sin(rad),0,Math.cos(rad),0,
        0,0,0,1
    ];

    deg =  Number(document.getElementById("xrot").value);
    document.getElementById("xrot-output").textContent = deg.toFixed(1);
    rad = deg /180 * Math.PI;
    let u_xrot = [
        1,0,0,0,
        0,Math.cos(rad),-Math.sin(rad),0,
        0,Math.sin(rad),Math.cos(rad),0,
        0,0,0,1
    ];

    renderer(staticMesh(tri))({u_xrot,u_yrot,u_zrot, u_outline, u_texturesize: textureCanvas.width});
}
