// From http://www.redblobgames.com/
// Copyright 2013 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>

console.info("I'm happy to answer questions about the code — email me at redblobgames@gmail.com");


/* global ops, zeros, complex, fft, Draggable */

const CANVASSIZE = 256;
const TAU = 2 * Math.PI;

/* Return a <= x <= b */
function clamp(x, a, b) {
    if (a > b) throw "clamp(_, a, b) requires a <= b";
    if (x < a) x = a;
    if (x > b) x = b;
    return x;
}


// 2D FFT

function outputToCanvas2D(id, array, halfoffset) {
    halfoffset = !!halfoffset;
    // halfoffset=false;
    // console.log("halfoffset: ",halfoffset)
    if (array.shape[0] !== array.shape[1]) throw "need square arrays in outputToCanvas2D";
    // console.log(array.shape)
    // Get a temp buffer to work with (avoid allocating these again)
    if (!outputToCanvas2D.buffers) { outputToCanvas2D.buffers = []; }
    // console.log(outputToCanvas2D.buffers)
    if (!outputToCanvas2D.buffers[array.shape[0]]) { outputToCanvas2D.buffers[array.shape[0]] = zeros(array.shape); }
    // console.log(outputToCanvas2D.buffers)
    let scaled = outputToCanvas2D.buffers[array.shape[0]];
    // console.log(scaled);

    // Rescale the array to 0-255, (x-min)/(max-min)*255
    let inf = ops.inf(array), sup = ops.sup(array);
    let mul = 255 / Math.max(1e-4, (sup - inf)), add = -inf;
    // console.log("mul:",mul);
    ops.adds(scaled, array, add);
    ops.mulseq(scaled, mul);

    // Draw each point as a pixelsize X pixelsize box
    let canvas = document.getElementById(id);
    let pixelsize = Math.floor(CANVASSIZE / array.shape[0]);
    // console.log(CANVASSIZE , array.shape[0],"px: ",pixelsize)
    canvas.width = array.shape[0] * pixelsize;
    canvas.height = array.shape[1] * pixelsize;

    let context = canvas.getContext('2d');
    let pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    // console.log(pixels);
    let k = 0, W = array.shape[0], H = array.shape[1];
    let i_offset = halfoffset*W/2, j_offset = halfoffset*H/2;
    for (let j = 0; j < H; j++) {
        for (let jj = 0; jj < pixelsize; jj++) {
            for (let i = 0; i < W; i++) {
                let y = scaled.get((i + i_offset) % W,(j + j_offset) % H);
                for (let ii = 0; ii < pixelsize; ii++) {
                    pixels.data[k++] = y;
                    pixels.data[k++] = y;
                    pixels.data[k++] = y;
                    pixels.data[k++] = 255;
                }
            }
        }
    }
    context.putImageData(pixels, 0, 0);
}



class RandomValues {
    constructor(N) {
        this.N = N;
        this.x = zeros([N, N]);
        this.y = zeros([N, N]);
        this.generate();
    }

    generate() {
        let {N, x, y} = this;
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                let r = Math.random() * N*N;
                let a = Math.random() * TAU;//0~2*pi
                x.set(i, j, r * Math.cos(a));
                y.set(i, j, r * Math.sin(a));
            }
        }
    }
}
        
const RANDOM = new RandomValues(128);
// console.log(RANDOM);

class PartTwo {
    constructor () {
        this.N = 128;
        this.tr = zeros([this.N, this.N]);
        this.ti = zeros([this.N, this.N]);
        this.regen();
    }
    
    // 2D IFFT
    regen() {
        //real part image part
        let tr = this.tr, ti = this.ti;
        let Fmin = Number(document.getElementById("fmin").value);
        let Fmax = Fmin + Number(document.getElementById("frange").value);
        let exponent = Number(document.getElementById("exponent").value);
        // console.log(Fmax,Fmin,exponent,document.getElementById("fmin-output").textContent)
        document.getElementById("fmin-output").textContent = Fmin;
        document.getElementById("frange-output").textContent = Fmax - Fmin;
        document.getElementById("exponent-output").textContent = exponent.toFixed(1);
        for (let i = 0; i < this.N; i++) {
            for (let j = 0; j < this.N; j++) {
                if (i == 0 && j == 0){continue;}
                let f1 = Math.min(i, this.N-i);
                let f2 = Math.min(j, this.N-j);
                let f = Math.sqrt(f1*f1+f2*f2);
                /* NOTE: why 2*exponent?? Eric Stansifer emailed me
                 * and said it's because the noise color is for the
                 * *power* spectrum and not the *amplitude*, and power
                 * is the square of the amplitude. */
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

        if (window.updateBuffers) { window.updateBuffers(tr); window.draw(); }
    }
}

function aaa(){
    const testCanvas = document.getElementById("test");
    const testCtx =testCanvas.getContext("2d");
    const size = testCanvas.width;
    testCtx.rect(0,0,size,size);
    testCtx.fill();
    
    let px = testCtx.getImageData(0,0,size,size);

    let k=0;
    for(let i=0;i<size;i++){
        for(let j=0;j<size;j++){
          px.data[k++] = 0.5*255
          px.data[k++] = 0.5*255
          px.data[k++] = 0.6*255
          px.data[k++] = 1.0*255
        }
    }
    console.log(px.data.length);
    console.log("aaa",px);
    testCtx.putImageData(px, 0, 0);
}
// Main:
// let partOne = new TestPart();
// let partTwo = new PartTwo();
// aaa();
// let partThree = new PartThree();

