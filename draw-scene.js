function drawScene(gl, programInfo, buffers, texture, cubeRotation)
{
    gl.clearColor(0,0,0,1);//clear to fully opaque black
    gl.clearDepth(1.0);//clear all depth data
    gl.enable(gl.DEPTH_TEST);
    /*DepthFunc specifies  the function used to compare 
    each incoming pixel's depth value present in depth buffer.
    The comparison is performed only if depth testing is enabled 
    
    GL_LEQUAL: passes if the incoming depth value is <= stored depth value*/
    gl.depthFunc(gl.LEQUAL); 

    //clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    const angleOfView = Math.PI/4;
    const aspectRadio = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;

    //create projection and modelview matrix
    const projectionMatrix = mat4.create();

    //gl matrix always receive result of transformation first 
    mat4.perspective(projectionMatrix,angleOfView,aspectRadio,zNear,zFar);

    const modelViewMatrix = mat4.create();//camera is set at identity point ie centre of scene

    //move camera further into sceen (z axis)
    mat4.translate(
        modelViewMatrix, // destination matrixW
        modelViewMatrix, // matrix to translate
        [-0.0, 0.0, -6.0]);

    mat4.rotate(
        modelViewMatrix,//dest matrix
        modelViewMatrix,//source matrix
        cubeRotation, //amount to rotate in rad
        [0,0,1] // rotate z
        );
    mat4.rotate(
        modelViewMatrix,//dest matrix
        modelViewMatrix,//source matrix
        cubeRotation * 0.7, //amount to rotate in rad
        [0,1,0] // rotate y
        );

    mat4.rotate(
        modelViewMatrix,//dest matrix
        modelViewMatrix,//source matrix
        cubeRotation * 0.3, //amount to rotate in rad
        [1,0,0] // rotate x
        );
    //Update uniform matrices to generate and give shahder a normal matrix
    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    //tell webgl to to pull position from position buffer to vertex position attribute
    setPositionAttribute(gl, buffers, programInfo);

    //setColorAttribute(gl, buffers, programInfo);
    //replace setColorAttribute to setTextureAttribute
    setTextureAttribute(gl, buffers, programInfo);

    //tell webgll to pull normal data from normalBuffer
    setNormalAttribute(gl,buffers,programInfo);


    //tell webgl which indices to use to index the vertices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    //tell webgl to use our pro when drawing 
    gl.useProgram(programInfo.program);

    //set shader uniform
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix, false, projectionMatrix );
   
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix );
    {
        const offset = 0;
        const vertexCount = 36;
        const type = gl.UNSIGNED_SHORT;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }

    //set normal matrix
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.normalMatrix,
        false,
        normalMatrix
    );

    //WebGL provides a min of 8 texture units, from TEXTURE0 to TEXTURE8.
    //you gotta choose what texture unit you want to change, then bind that texture to TEXTURE_2D
    //then inform shader to use texture unit 0 for uSampler

    // Tell WebGL we want to affect texture unit 0
    gl.activeTexture(gl.TEXTURE0);
    // Bind the texture to texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Tell the shader we bound the texture to texture unit 0
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

}
/**END OF DRAW SCENE() FUNCTION */


function setPositionAttribute(gl,buffers,programInfo)
{
    const numComponents  = 3; //pull out 2 values per iteration
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;//number of bytes to get from one set og values to the next
    const offset = 0;//number of bytes inside the buffer to start

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents , type, normalize, stride, offset);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);        
    
}

function setColorAttribute(gl,buffers,programInfo)
{
    const numComponents  = 4; //pull out 2 values per iteration
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;//number of bytes to get from one set og values to the next
    const offset = 0;//number of bytes inside the buffer to start

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents , type, normalize, stride, offset);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);        
    
}

//tutorial 5 - adding function to draw a textured cube
function setTextureAttribute(gl,buffers,programInfo)
{
    const num = 2;//all coord comnposed of 2 values
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0; // number of bytes to get from one set to the next
    const offset = 0; //how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.vertexAttribPointer(
        programInfo.attribLocations.textureCoord,
        num,
        type,
        normalize,
        stride,
        offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
}

//tutorial 5 - adding light - bind normals array to shader attribute after creating a normalBuffer in init
function setNormalAttribute(gl, buffers, programInfo)
{
    const num = 3;//vertex coord in 3D space 
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0; // number of bytes to get from one set to the next
    const offset = 0; //how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexNormal,
        num,
        type,
        normalize,
        stride,
        offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);
}

export { drawScene };