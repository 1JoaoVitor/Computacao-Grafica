
const vertexShaderSource = `
    attribute vec3 a_position;
    attribute vec3 a_color;
    varying vec3 v_color;
    uniform mat4 u_modelViewMatrix;
    uniform mat4 u_viewingMatrix;
    uniform mat4 u_projectionMatrix;

    void main() {
        gl_Position = u_projectionMatrix * u_viewingMatrix * u_modelViewMatrix * vec4(a_position,1.0);
        v_color = a_color;
    }
`;


const fragmentShaderSource = `
    precision mediump float;
    varying vec3 v_color;
    void main() {
        gl_FragColor = vec4(v_color,1.0);
    }
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Error linking program:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    return program;
}

function setCubeVertices(side){
  let v = side/2;
  return new Float32Array([
      // Front
      v, v, v,
      v, -v, v,
      -v, v, v,
      -v, v, v,
      v, -v, v,
      -v, -v, v,
 
      // Left
      -v, v, v,
      -v, -v, v,
      -v, v, -v,
      -v, v, -v,
      -v, -v, v,
      -v, -v, -v,
 
      // Back
      -v, v, -v,
      -v, -v, -v,
      v, v, -v,
      v, v, -v,
      -v, -v, -v,
      v, -v, -v,
 
      // Right
      v, v, -v,
      v, -v, -v,
      v, v, v,
      v, v, v,
      v, -v, v,
      v, -v, -v,
 
      // Top
      v, v, v,
      v, v, -v,
      -v, v, v,
      -v, v, v,
      v, v, -v,
      -v, v, -v,
 
      // Bottom
      v, -v, v,
      v, -v, -v,
      -v, -v, v,
      -v, -v, v,
      v, -v, -v,
      -v, -v, -v,
  ]);
}

function setCubeColors(){
  let colors = [];
  let color = [];
  for(let i=0;i<6;i++){
    color = [Math.random(),Math.random(),Math.random()];
    for(let j=0;j<6;j++)
      colors.push(...color);
  }

  return new Float32Array(colors);
}

function defineCoordinateAxes(){
    return new Float32Array([
      
      -1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
      
      0.0, -1.0, 0.0,
      0.0, 1.0, 0.0,
      
      0.0, 0.0, -1.0,
      0.0, 0.0, 1.0,
    ]);
}

function defineCoordinateAxesColors(){
    return new Float32Array([
      
      1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
      
      1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
      
      1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
    ]);
}

function main() {
    const canvas = document.getElementById('glCanvas');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        console.error('WebGL not supported');
        return;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getAttribLocation(program, 'a_color');

    const VertexBuffer = gl.createBuffer();
    let cubeVertices = [];

    const ColorBuffer = gl.createBuffer();
    let cubeColors = [];
    
    const modelViewMatrixUniformLocation = gl.getUniformLocation(program,'u_modelViewMatrix');
    const viewingMatrixUniformLocation = gl.getUniformLocation(program,'u_viewingMatrix');
    const projectionMatrixUniformLocation = gl.getUniformLocation(program,'u_projectionMatrix');

    let coordinateAxes = defineCoordinateAxes();
    let coordinateAxesColors = defineCoordinateAxesColors();

    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    
    let modelViewMatrix; 
    let viewingMatrix; 
    
    // PARÂMETROS DA CÂMERA - Controlados pelo teclado
    
    let P0 = [2.0,2.0,2.0];
    let Pref = [0.0,0.0,0.0];
    let V = [0.0,1.0,0.0];
    
    
    let xw_min = -1.0;
    let xw_max = 1.0;
    let yw_min = -1.0;
    let yw_max = 1.0;
    let z_near = -0.1;
    let z_far = -20.0;
    let projectionMatrix = m4.setOrthographicProjectionMatrix(xw_min,xw_max,yw_min,yw_max,z_near,z_far);

    
    cubeColors = setCubeColors();
    cubeVertices = setCubeVertices(0.5);

    function drawCube(){
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, VertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
 
      gl.enableVertexAttribArray(colorLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, ColorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, cubeColors, gl.STATIC_DRAW);
      gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
      
      
      modelViewMatrix = m4.identity();

      gl.uniformMatrix4fv(modelViewMatrixUniformLocation,false,modelViewMatrix);
      gl.uniformMatrix4fv(viewingMatrixUniformLocation,false,viewingMatrix);
      gl.uniformMatrix4fv(projectionMatrixUniformLocation,false,projectionMatrix);

      gl.drawArrays(gl.TRIANGLES, 0, 6*6);
    }

    function drawCoordinateAxes(){
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, VertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, coordinateAxes, gl.STATIC_DRAW);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(colorLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, ColorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, coordinateAxesColors, gl.STATIC_DRAW);
      gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
      
      
      modelViewMatrix = m4.identity();

      gl.uniformMatrix4fv(modelViewMatrixUniformLocation,false,modelViewMatrix);
      gl.uniformMatrix4fv(viewingMatrixUniformLocation,false,viewingMatrix);
      gl.uniformMatrix4fv(projectionMatrixUniformLocation,false,projectionMatrix);

      gl.drawArrays(gl.LINES, 0, 6);
    }

    
    function drawScene(){
      gl.clear(gl.COLOR_BUFFER_BIT);


      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      
      
      viewingMatrix = m4.setViewingMatrix(P0,Pref,V);
      
      drawCube();
      drawCoordinateAxes();

     
    }


    function handleKeyDown(event) {
        const step = 0.1; // "Velocidade" do movimento da câmera

        switch (event.key) {
          
            case 'w': 
                P0[2] -= step;
                break;
            case 's': 
                P0[2] += step;
                break;
            case 'a': 
                P0[0] -= step;
                break;
            case 'd': 
                P0[0] += step;
                break;
            case 'q': 
                P0[1] += step;
                break;
            case 'e':
                P0[1] -= step;
                break;

           
            case 'ArrowUp':
                Pref[1] += step;
                break;
            case 'ArrowDown':
                Pref[1] -= step;
                break;
            case 'ArrowLeft':
                Pref[0] -= step;
                break;
            case 'ArrowRight':
                Pref[0] += step;
                break;
            default:
                return; 
        }
        
        
        event.preventDefault(); 
        
        
        drawScene(); 
    }

    
    window.addEventListener('keydown', handleKeyDown);


    drawScene();
}

function unitVector(v){ 
    let vModulus = vectorModulus(v);
    return v.map(function(x) { return x/vModulus; });
}

function vectorModulus(v){
    return Math.sqrt(Math.pow(v[0],2)+Math.pow(v[1],2)+Math.pow(v[2],2));
}

function radToDeg(r) {
  return r * 180 / Math.PI;
}

function degToRad(d) {
  return d * Math.PI / 180;
}

window.addEventListener('load', main);