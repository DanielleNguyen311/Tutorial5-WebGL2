/**Before rendering any shapes, we need buffer holding vertex positons 
 * Behold the buffer initialization routine
*/



function initBuffers(gl)
{
    const positionBuffer = initPositionBuffer(gl);

        //adding colors
    //const colorBuffer = initColorBuffer(gl);

    //replace colorBuffer with textureBuffer
    const textureCoordBuffer = initTextureBuffer(gl);
    
    //adding 3D
    const indexBuffer = initIndexBuffer(gl);

    //adding normals for lights
    const normalBuffer = initNormalBuffer(gl);

    return {
        position: positionBuffer, 
        textureCoord: textureCoordBuffer,
        indices: indexBuffer,
        normal: normalBuffer,
    };
}

function initPositionBuffer(gl){
    //create a buffer for the square's position 
    const positionBuffer = gl.createBuffer();

    //select position buffer as the one to apply buffer operations to apply buffer operations from here out
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    //create an array of positions for the square
    const positions = [
        -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,//front face
        -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, //back
        -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,//top face
        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,//bot face
        1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,//right face
        -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, //left face
    ];

    /*pass the positions into webgl to build shape 
    by creating a float array, fill it and use it to fill vertex buffer */

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return positionBuffer;

}

function initColorBuffer(gl) {
    const faceColors  = [
        [1.0, 1.0, 1.0, 1.0], // Front face: white
        [1.0, 0.0, 0.0, 1.0], // Back face: red
        [0.0, 1.0, 0.0, 1.0], // Top face: green
        [0.0, 0.0, 1.0, 1.0], // Bottom face: blue
        [1.0, 1.0, 0.0, 1.0], // Right face: yellow
        [1.0, 0.0, 1.0, 1.0], // Left face: purple
    ];

    var colors = [];
    for (var j = 0; j < faceColors.length; j++)
    {
        const c = faceColors[j];
        // Repeat each color four times for the four vertices of the face
        colors = colors.concat(c,c,c,c);
    }

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    return colorBuffer;
}

function initIndexBuffer(gl) {
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    //indices array defines each face like a pair of triangles, specifyinf 
    //each  triangles vertices as an index into cube's vertex array
    //thus the cube is a collection of 12 triangles
    const indices = [ 0,1,2,0,2,3,//front
    4,5,6,4,6,7,//back
    8,9,10,8,10,11,//top
    12,13,14,12,14,15,//bottom
    16,17,18,16,18,19,//right
    20,21,22,20,22,23,//left 
    ];

    //send element array to gl
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return indexBuffer;
}

//est the mapping of texture coordinates to the vertices of the faces 
function initTextureBuffer(gl) {
    //create buffer to store the texture coord for each face
    const textureCoordBuffer = gl.createBuffer();
    //bind that buffer with the gl array buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

    //make an array to define the texture coordinate to each vertex of each face
    //NOTE: txtr coord goes fr 0 to 1
    //dimension of textures are normalized to a ramge of 0 to 1 regardless of their actual sz
    const textureCoordinates = [
        0, 0, 1, 0, 1, 1, 0, 1,
        0, 0, 1, 0, 1, 1, 0, 1,
        0, 0, 1, 0, 1, 1, 0, 1,
        0, 0, 1, 0, 1, 1, 0, 1,
        0, 0, 1, 0, 1, 1, 0, 1,
        0, 0, 1, 0, 1, 1, 0, 1,
    ]

    //pass texture mapping array into gl array buffer 
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
    return textureCoordBuffer;
  }

function initNormalBuffer(gl) {
    //create buffer to store the texture coord for each face
    const normalBuffer = gl.createBuffer();
    //bind that buffer with the gl array buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

    //make an array to define the vertexNormals to each vertex of each face
    //NOTE: vertexNormals goes fr -1 to 1
    //unlike in texture Coord (0-1)
    const vertexNormals = [
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, //Front
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,//Back
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,//Top
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,//Bottom
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,//Right
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,//Left
    ]

    //pass texture mapping array into gl array buffer 
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
    return normalBuffer;
}

export{initBuffers};
