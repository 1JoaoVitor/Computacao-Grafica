const vertexShaderSourcePinwhell = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    varying vec4 v_color;

    void main() {
        gl_Position = a_position;
        v_color = a_color;
    }
`;

const fragmentShaderSourcePinwhell = `
    precision mediump float;
    varying vec4 v_color;

    void main() {
        gl_FragColor = v_color;
    }
`;

function createShaderPinwhell(gl, type, source) {
   const shader = gl.createShader(type);
   gl.shaderSource(shader, source);
   gl.compileShader(shader);

   if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Error compiling shader:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
   }

   return shader;
}

function createProgramPinwhell(gl, vertexShader, fragmentShader) {
   const program = gl.createProgram();
   gl.attachShader(program, vertexShader);
   gl.attachShader(program, fragmentShader);
   gl.linkProgram(program);

   if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Error linking program:", gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
   }

   return program;
}

function mainPinwhell() {
   const canvas = document.getElementById("glCanvasPinwhell");
   const gl = canvas.getContext("webgl");

   if (!gl) {
      console.error("WebGL not supported");
      return;
   }

   const vertexShader = createShaderPinwhell(
      gl,
      gl.VERTEX_SHADER,
      vertexShaderSourcePinwhell
   );
   const fragmentShader = createShaderPinwhell(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSourcePinwhell
   );
   const program = createProgramPinwhell(gl, vertexShader, fragmentShader);

   const pinwheelVertices = new Float32Array([
      0.0, 0.0, 1, 0.2, 0.2, 1, 0.08, 0.08, 1, 0.2, 0.2, 1, 0.0, 0.35, 1, 0.2,
      0.2, 1, 0.0, 0.0, 1, 0.2, 0.2, 1, 0.0, 0.35, 1, 0.2, 0.2, 1, -0.08, 0.08,
      1, 0.2, 0.2, 1,

      0.0, 0.0, 0.2, 1, 0.2, 1, 0.08, 0.08, 0.2, 1, 0.2, 1, 0.35, 0.0, 0.2, 1,
      0.2, 1, 0.0, 0.0, 0.2, 1, 0.2, 1, 0.35, 0.0, 0.2, 1, 0.2, 1, 0.08, -0.08,
      0.2, 1, 0.2, 1,

      0.0, 0.0, 0.2, 0.4, 1, 1, 0.08, -0.08, 0.2, 0.4, 1, 1, 0.0, -0.35, 0.2,
      0.4, 1, 1, 0.0, 0.0, 0.2, 0.4, 1, 1, 0.0, -0.35, 0.2, 0.4, 1, 1, -0.08,
      -0.08, 0.2, 0.4, 1, 1,

      0.0, 0.0, 1, 1, 0.2, 1, -0.08, -0.08, 1, 1, 0.2, 1, -0.35, 0.0, 1, 1, 0.2,
      1, 0.0, 0.0, 1, 1, 0.2, 1, -0.35, 0.0, 1, 1, 0.2, 1, -0.08, 0.08, 1, 1,
      0.2, 1,
   ]);

   const stickVertices = new Float32Array([
      -0.01, -0.1, 0.6, 0.4, 0.2, 1, -0.01, -0.8, 0.6, 0.4, 0.2, 1, 0.01, -0.1,
      0.6, 0.4, 0.2, 1, -0.01, -0.8, 0.6, 0.4, 0.2, 1, 0.01, -0.8, 0.6, 0.4,
      0.2, 1, 0.01, -0.1, 0.6, 0.4, 0.2, 1,
   ]);

   const pinwheelBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, pinwheelBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, pinwheelVertices, gl.STATIC_DRAW);

   const stickBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, stickBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, stickVertices, gl.STATIC_DRAW);

   const positionLocation = gl.getAttribLocation(program, "a_position");
   const colorLocation = gl.getAttribLocation(program, "a_color");

   gl.viewport(0, 0, canvas.width, canvas.height);
   gl.clearColor(0.7, 0.9, 1.0, 1.0);
   gl.clear(gl.COLOR_BUFFER_BIT);
   gl.useProgram(program);

   const F_SIZE = Float32Array.BYTES_PER_ELEMENT;

   gl.bindBuffer(gl.ARRAY_BUFFER, stickBuffer);
   gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, F_SIZE * 6, 0);
   gl.enableVertexAttribArray(positionLocation);
   gl.vertexAttribPointer(
      colorLocation,
      4,
      gl.FLOAT,
      false,
      F_SIZE * 6,
      F_SIZE * 2
   );
   gl.enableVertexAttribArray(colorLocation);
   gl.drawArrays(gl.TRIANGLES, 0, stickVertices.length / 6);

   gl.bindBuffer(gl.ARRAY_BUFFER, pinwheelBuffer);
   gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, F_SIZE * 6, 0);
   gl.enableVertexAttribArray(positionLocation);
   gl.vertexAttribPointer(
      colorLocation,
      4,
      gl.FLOAT,
      false,
      F_SIZE * 6,
      F_SIZE * 2
   );
   gl.enableVertexAttribArray(colorLocation);
   gl.drawArrays(gl.TRIANGLES, 0, pinwheelVertices.length / 6);
}

window.addEventListener("load", mainPinwhell);
