// flower.js (CÓDIGO ATUALIZADO)

const vertexShaderSourceFlower = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    varying vec4 v_color;

    void main() {
        gl_Position = a_position;
        v_color = a_color;
    }
`;

const fragmentShaderSourceFlower = `
    precision mediump float;
    varying vec4 v_color;

    void main() {
        gl_FragColor = v_color;
    }
`;

function createShaderFlower(gl, type, source) {
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

function createProgramFlower(gl, vertexShader, fragmentShader) {
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

function mainFlower() {
   const canvas = document.getElementById("glCanvasFlower");
   const gl = canvas.getContext("webgl");

   if (!gl) {
      console.error("WebGL not supported");
      return;
   }

   const vertexShader = createShaderFlower(
      gl,
      gl.VERTEX_SHADER,
      vertexShaderSourceFlower
   );
   const fragmentShader = createShaderFlower(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSourceFlower
   );
   const program = createProgramFlower(gl, vertexShader, fragmentShader);

   let verticesColors = [];

   function addTriangle(x1, y1, x2, y2, x3, y3, r, g, b, a) {
      verticesColors.push(
         x1,
         y1,
         r,
         g,
         b,
         a,
         x2,
         y2,
         r,
         g,
         b,
         a,
         x3,
         y3,
         r,
         g,
         b,
         a
      );
   }

   function addCircle(cx, cy, radius, r, g, b, a, segments = 30) {
      for (let i = 0; i < segments; i++) {
         let angle1 = (i / segments) * 2 * Math.PI;
         let angle2 = ((i + 1) / segments) * 2 * Math.PI;
         addTriangle(
            cx,
            cy,
            cx + radius * Math.cos(angle1),
            cy + radius * Math.sin(angle1),
            cx + radius * Math.cos(angle2),
            cy + radius * Math.sin(angle2),
            r,
            g,
            b,
            a
         );
      }
   }


   addTriangle(-0.03, -0.8, -0.03, 0.1, 0.03, -0.8, 0.2, 0.7, 0.2, 1);
   addTriangle(-0.03, 0.1, 0.03, 0.1, 0.03, -0.8, 0.2, 0.7, 0.2, 1);

   addTriangle(-0.03, -0.3, -0.25, -0.4, -0.05, -0.15, 0.1, 0.6, 0.1, 1);
   addTriangle(0.03, -0.4, 0.25, -0.5, 0.05, -0.25, 0.1, 0.6, 0.1, 1);


   addCircle(0.0, 0.4, 0.1, 1.0, 1.0, 0.2, 1, 40);

 
   const petalRadius = 0.15; 
   const flowerRadius = 0.25; 
   const numPetals = 5;

   for (let i = 0; i < numPetals; i++) {
      let angle = (i / numPetals) * 2 * Math.PI;
      let petalX = 0.0 + Math.cos(angle) * flowerRadius;
      let petalY = 0.4 + Math.sin(angle) * flowerRadius;

      addCircle(petalX, petalY, petalRadius, 1.0, 0.4, 0.7, 1, 20);
   }

   const verticesArray = new Float32Array(verticesColors);

   const vertexColorBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, verticesArray, gl.STATIC_DRAW);

   const positionLocation = gl.getAttribLocation(program, "a_position");
   const colorLocation = gl.getAttribLocation(program, "a_color");

   gl.viewport(0, 0, canvas.width, canvas.height);
   gl.clearColor(0.6, 0.85, 1.0, 1.0);
   gl.clear(gl.COLOR_BUFFER_BIT);
   gl.useProgram(program);

   const F_SIZE = verticesArray.BYTES_PER_ELEMENT;
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

   gl.drawArrays(gl.TRIANGLES, 0, verticesArray.length / 6);
}

window.addEventListener("load", mainFlower);
