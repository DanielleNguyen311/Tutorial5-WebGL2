import { initBuffers } from "./init-buffers.js";
import { drawScene } from "./draw-scene.js";
main();

let cubeRotation = 0.0;
let deltaTime = 0;
let copyVideo = false;

function main()
{
    //obtain reference to the canvas, assign a variable name to it
    const canvas = document.querySelector("#glcanvas");

    /*initialize context by asking the web if it supports webgl
      if browser does not support webgl, browser initializes context,
      we set clear color to black*/
    const gl = canvas.getContext("webgl");

    if(gl == null)
    {
        alert("Browser does not support webGl");
        return;
    }

    gl.clearColor(0.0,0.0,0.0,1.0);//black
    gl.clear(gl.COLOR_BUFFER_BIT);

    // start render to the initialized context : 
        //include glMatrix lib
        //Draw the scene
            //Define VS and FS source 
    const vsSource = `
        attribute vec4 aVertexPosition;
        attribute vec3 aVertexNormal;
        attribute vec2 aTextureCoord;

        uniform mat4 uNormalMatrix;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;

        varying highp vec2 vTextureCoord;
        varying highp vec3 vLighting;

        void main(void) {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            vTextureCoord = aTextureCoord; 
        
            highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
            highp vec3 directionalLightColor = vec3(1, 1, 1);
            highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

            highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal,1.0);
            highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
            vLighting = ambientLight + (directionalLightColor * directional);
        
        }`;
        
    //fs is called once for every pixel on each shape to be drawn to determine the pixel's color 
    //color is then returned to webgl layer by storing it in gl_FragColor
    //right now we are just drawing white
    const fsSource = `
        varying highp vec2 vTextureCoord;
        varying highp vec3 vLighting;

        uniform sampler2D uSampler;

        void main(void) { 
            highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
            gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
        }`;


    const shaderProgram = initShaderProgram(gl,vsSource,fsSource);
    //QUESTION: wHAT IS UNIFORM SAMPLER2D USAMPLER? PURPOSE? 

    /*Collect info for shader program.
    Look up attribute in use for aVertexPositon and its uniform locations */
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
            vertexNormal: gl.getAttribLocation(shaderProgram, "aVertexNormal"),
            textureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
            normalMatrix: gl.getUniformLocation(shaderProgram, "uNormalMatrix"),
            uSampler: gl.getUniformLocation(shaderProgram, "uSampler"),
        },
    };
    //call buffer init routine to build object we are drawing
    const buffers = initBuffers(gl);

    //Tutorial 5 (cont) call loadTexture() to load the image
        //const texture = loadTexture(gl, "https://cdn.glitch.global/8dfdad4f-830a-4851-991e-f4e3e52ac93f/Shahr_Texture.PNG?v=1678687378257");

    const texture = initTexture(gl);
    const video = setupVideo("https://cdn.glitch.global/9db6f7ff-a82a-4afd-837b-a58828638347/WhatsApp%20Video%202023-03-19%20at%2010.53.06.mp4?v=1679248401835");

    //browser copy pxl fr loaded img in top to bot order, top left corner
    //webGL copy pxl bot to top (reverse), bottom left 
    //-> need pixelStorei() with gl.UNPACK_FLIP_Y_WEBGL parameter set to tru
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);


    let then = 0;
    function render(now)
    {
        now *= 0.001;//convert to seconds
        deltaTime = now - then;
        then = now;

        if(copyVideo)
        {
            updateTexture(gl,texture,video);
        }

        drawScene(gl ,programInfo ,buffers, texture, cubeRotation);
        cubeRotation += deltaTime;

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

}
/*Helper function initShaderProgram: After defining 2 shaders, pass them to webgl, compile and link them.
The code below creates 2 shaders by calling loadShader, passing it the types and
sources. 
LoadShader then create a prog, attach the shader and link them. 
If compiling and link shaders fail, code display alert*/

function initShaderProgram(gl,vsSource,fsSource)  {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl,gl.FRAGMENT_SHADER,fsSource );

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if(!gl.getProgramParameter(shaderProgram,gl.LINK_STATUS))
    {
        alert('Unable to init the shader progrqam: ${gl.getProgramInfoLog(shaderProgram)}');
        return null;
    }
    return shaderProgram;

}
//create a shader of the given type, upload the source and compiles it
//if compilation failes -> alert. else return shader
function loadShader(gl,type,source)
{
    const shader = gl.createShader(type);
    gl.shaderSource(shader,source);//send source
    gl.compileShader(shader);//compiles
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        alert('Shader compilation fails: ${gl.getShaderInfoLog(shader)}');
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

//create a WebGL texture by createTexture() 
//then uploads a sinigle blue pixel using texImage2D()
//this makes an immediate place holder blue texture while waiting for the texture img

//load image for static texture 
function loadTexture(gl, url)
{
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    //put a pixel into the texImage2D as a place holder for image while waiting for it to be downloaded
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
    gl.texImage2D(
        gl.TEXTURE_2D,
        level,
        internalFormat,
        width,
        height,
        border,
        srcFormat,
        srcType,
        pixel
    );

    //to load texture from img file
    const image = new Image();
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            internalFormat,
            srcFormat,
            srcType,
            image
        );

        //webGL has different requirement for power of 2 images vs non power of 2 images 
        //-> check if the image is a power of 2 in both dimensions
        if(isPowerOf2(image.width) && isPowerOf2(image.height))
        {
            //generate mips if is a power of 2
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            //if not power of 2, turn off mips and set wrapping to clamp to edge
            gl.texParamateri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParamateri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParamateri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };
    //assign src to url 

    requestCORSIfNotSameOrigin(image,url);
    image.src = url;
    return texture;
}

function isPowerOf2(value) {
    return (value & (value - 1)) === 0; //bitwise operation , 3 = sign means : is of same type and value 
  }

//load video for animating texture
function initTexture(gl)
{
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    //put a pixel into the texImage2D as a place holder for image while waiting for it to be downloaded
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
    gl.texImage2D(
        gl.TEXTURE_2D,
        level,
        internalFormat,
        width,
        height,
        border,
        srcFormat,
        srcType,
        pixel
    );

    //turn off mimaps and set clamp to edge to accomodate to video dimension
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    return texture;
}

function updateTexture(gl,texture,video)
{
    gl.bindTexture(gl.TEXTURE_2D, texture);
    const level = 0; const internalFormat = gl.RGBA; const srcFormat = gl.RGBA; const srcType = gl.UNSIGNED_BYTE;
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, video);
}

//this function is required for appropriate handling of Cross-Origin Resource Sharing 
//CORS is an HTTP header based mechanism
//that allows a server to indicate any origins other than is own
//from which a browser can load resources

//loading WebGL texture from another domain needs a CORS approval
function requestCORSIfNotSameOrigin(img, url)
{
    if((new URL(url, window.location.href)).origin !== window.location.origin){
        img.crossOrigin = " ";
    }
}

//set up animating texture 
function setupVideo(url)
{
    const video = document.createElement("video");

    let playing = false;
    let timeupdate = false;

    video.playsInline = true;
    video.muted = false;
    video.loop = true;

    //check if video is playing time has been updated -> ensure data availale and safe to upload as texture to cube
    video.addEventListener(
        "playing", 
        () => {
            playing = true;
            checkReady();
        }, 
        true
    );

    video.addEventListener(
        "timeupdate",
        () => {
            timeupdate = true;
            checkReady();
        }
    );

    requestCORSIfNotSameOrigin(video,url);
    video.src = url;
    video.play();

    function checkReady()
    {
        if(playing && timeupdate){
            copyVideo = true;
        }
    }
    
    window.onload = function(){
        document.getElementById("audio").play();
    }

    return video;
}
