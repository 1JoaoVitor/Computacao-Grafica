const vertexShaderSourceCar = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    varying vec4 v_color;

    void main() {
        gl_Position = a_position;
        v_color = a_color;
    }
`;

const fragmentShaderSourceCar = `
    precision mediump float;
    varying vec4 v_color;

    void main() {
        gl_FragColor = v_color;
    }
`;

function createShaderCar(gl, type, source) {
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

function createProgramCar(gl, vertexShader, fragmentShader) {
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

function mainCar() {
   const canvas = document.getElementById("glCanvasCar");
   const gl = canvas.getContext("webgl");

   if (!gl) {
      console.error("WebGL not supported");
      return;
   }

   const vertexShader = createShaderCar(
      gl,
      gl.VERTEX_SHADER,
      vertexShaderSourceCar
   );
   const fragmentShader = createShaderCar(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSourceCar
   );
   const program = createProgramCar(gl, vertexShader, fragmentShader);

   const verticesColors = new Float32Array([
      -0.4, -0.1, 0.8, 0.2, 0.2, 1, -0.4, 0.1, 0.8, 0.2, 0.2, 1, 0.4, -0.1, 0.8,
      0.2, 0.2, 1, -0.4, 0.1, 0.8, 0.2, 0.2, 1, 0.4, 0.1, 0.8, 0.2, 0.2, 1, 0.4,
      -0.1, 0.8, 0.2, 0.2, 1,

      -0.2, 0.1, 0.6, 0.4, 0.8, 1, -0.15, 0.25, 0.6, 0.4, 0.8, 1, 0.2, 0.1, 0.6,
      0.4, 0.8, 1, -0.15, 0.25, 0.6, 0.4, 0.8, 1, 0.15, 0.25, 0.6, 0.4, 0.8, 1,
      0.2, 0.1, 0.6, 0.4, 0.8, 1,

      -0.25, -0.25, 0.2, 0.2, 0.2, 1, -0.25, -0.15, 0.2, 0.2, 0.2, 1, -0.15,
      -0.25, 0.2, 0.2, 0.2, 1, -0.25, -0.15, 0.2, 0.2, 0.2, 1, -0.15, -0.15,
      0.2, 0.2, 0.2, 1, -0.15, -0.25, 0.2, 0.2, 0.2, 1,

      0.15, -0.25, 0.2, 0.2, 0.2, 1, 0.15, -0.15, 0.2, 0.2, 0.2, 1, 0.25, -0.25,
      0.2, 0.2, 0.2, 1, 0.15, -0.15, 0.2, 0.2, 0.2, 1, 0.25, -0.15, 0.2, 0.2,
      0.2, 1, 0.25, -0.25, 0.2, 0.2, 0.2, 1,

      -0.15, 0.1, 0.3, 0.6, 0.9, 0.8, -0.1, 0.2, 0.3, 0.6, 0.9, 0.8, 0.15, 0.1,
      0.3, 0.6, 0.9, 0.8, -0.1, 0.2, 0.3, 0.6, 0.9, 0.8, 0.1, 0.2, 0.3, 0.6,
      0.9, 0.8, 0.15, 0.1, 0.3, 0.6, 0.9, 0.8,
   ]);

   const vertexColorBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

   const positionLocation = gl.getAttribLocation(program, "a_position");
   const colorLocation = gl.getAttribLocation(program, "a_color");

   gl.viewport(0, 0, canvas.width, canvas.height);
   gl.clearColor(0.9, 0.9, 1.0, 1.0);
   gl.clear(gl.COLOR_BUFFER_BIT);
   gl.useProgram(program);

   const F_SIZE = verticesColors.BYTES_PER_ELEMENT;
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

   gl.drawArrays(gl.TRIANGLES, 0, verticesColors.length / 6);
}

window.addEventListener("load", mainCar);
