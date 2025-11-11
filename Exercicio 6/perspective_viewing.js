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
      console.error("Error compiling shader:", gl.getShaderInfoLog(shader));
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
      console.error("Error linking program:", gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
   }
   return program;
}

function setCubeVertices(side) {
   let v = side / 2;
   return new Float32Array([
      // Front
      v,
      v,
      v,
      v,
      -v,
      v,
      -v,
      v,
      v,
      -v,
      v,
      v,
      v,
      -v,
      v,
      -v,
      -v,
      v,
      // Left
      -v,
      v,
      v,
      -v,
      -v,
      v,
      -v,
      v,
      -v,
      -v,
      v,
      -v,
      -v,
      -v,
      v,
      -v,
      -v,
      -v,
      // Back
      -v,
      v,
      -v,
      -v,
      -v,
      -v,
      v,
      v,
      -v,
      v,
      v,
      -v,
      -v,
      -v,
      -v,
      v,
      -v,
      -v,
      // Right
      v,
      v,
      -v,
      v,
      -v,
      -v,
      v,
      v,
      v,
      v,
      v,
      v,
      v,
      -v,
      v,
      v,
      -v,
      -v,
      // Top
      v,
      v,
      v,
      v,
      v,
      -v,
      -v,
      v,
      v,
      -v,
      v,
      v,
      v,
      v,
      -v,
      -v,
      v,
      -v,
      // Bottom
      v,
      -v,
      v,
      v,
      -v,
      -v,
      -v,
      -v,
      v,
      -v,
      -v,
      v,
      v,
      -v,
      -v,
      -v,
      -v,
      -v,
   ]);
}

function setCubeColors() {
   let colors = [];
   let color = [];
   for (let i = 0; i < 6; i++) {
      color = [Math.random(), Math.random(), Math.random()];
      for (let j = 0; j < 6; j++) colors.push(...color);
   }
   return new Float32Array(colors);
}

function defineCoordinateAxes() {
   return new Float32Array([
      // X axis
      -100.0, 0.0, 0.0, 100.0, 0.0, 0.0,
      // Y axis
      0.0, -100.0, 0.0, 0.0, 100.0, 0.0,
      // Z axis
      0.0, 0.0, -100.0, 0.0, 0.0, 100.0,
   ]);
}

function defineCoordinateAxesColors() {
   return new Float32Array([
      1.0, 0.0, 0.0, 1.0, 0.0, 0.0,

      0.0, 1.0, 0.0, 0.0, 1.0, 0.0,

      0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
   ]);
}

function setGroundPlaneVertices(size) {
   let s = size / 2;
   return new Float32Array([
      s,
      0.0,
      s,
      s,
      0.0,
      -s,
      -s,
      0.0,
      s,
      -s,
      0.0,
      s,
      s,
      0.0,
      -s,
      -s,
      0.0,
      -s,
   ]);
}

function setGroundPlaneColors() {
   let c = 0.5; // Cor cinza
   return new Float32Array([
      c,
      c,
      c,
      c,
      c,
      c,
      c,
      c,
      c,
      c,
      c,
      c,
      c,
      c,
      c,
      c,
      c,
      c,
   ]);
}

function drawCube(gl, program, buffers, locations, vertices) {
   gl.enableVertexAttribArray(locations.positionLocation);
   gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
   gl.vertexAttribPointer(locations.positionLocation, 3, gl.FLOAT, false, 0, 0);

   gl.enableVertexAttribArray(locations.colorLocation);
   gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colorBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, buffers.cubeColors, gl.STATIC_DRAW);
   gl.vertexAttribPointer(locations.colorLocation, 3, gl.FLOAT, false, 0, 0);

   let modelViewMatrix = m4.identity();
   gl.uniformMatrix4fv(
      locations.modelViewMatrixUniformLocation,
      false,
      modelViewMatrix
   );

   gl.drawArrays(gl.TRIANGLES, 0, 6 * 6);
}

function drawCoordinateAxes(gl, program, buffers, locations, vertices) {
   gl.enableVertexAttribArray(locations.positionLocation);
   gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
   gl.vertexAttribPointer(locations.positionLocation, 3, gl.FLOAT, false, 0, 0);

   gl.enableVertexAttribArray(locations.colorLocation);
   gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colorBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, buffers.coordinateAxesColors, gl.STATIC_DRAW);
   gl.vertexAttribPointer(locations.colorLocation, 3, gl.FLOAT, false, 0, 0);

   let modelViewMatrix = m4.identity();
   gl.uniformMatrix4fv(
      locations.modelViewMatrixUniformLocation,
      false,
      modelViewMatrix
   );

   gl.drawArrays(gl.LINES, 0, 6);
}

function drawGroundPlane(gl, program, buffers, locations, vertices) {
   gl.enableVertexAttribArray(locations.positionLocation);
   gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
   gl.vertexAttribPointer(locations.positionLocation, 3, gl.FLOAT, false, 0, 0);

   gl.enableVertexAttribArray(locations.colorLocation);
   gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colorBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, buffers.groundColors, gl.STATIC_DRAW);
   gl.vertexAttribPointer(locations.colorLocation, 3, gl.FLOAT, false, 0, 0);

   let modelViewMatrix = m4.identity();
   gl.uniformMatrix4fv(
      locations.modelViewMatrixUniformLocation,
      false,
      modelViewMatrix
   );

   gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function main() {
   const canvas = document.getElementById("glCanvas");
   const gl = canvas.getContext("webgl");
   if (!gl) {
      console.error("WebGL not supported");
      return;
   }

   const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
   const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
   );
   const program = createProgram(gl, vertexShader, fragmentShader);
   gl.useProgram(program);

   const locations = {
      positionLocation: gl.getAttribLocation(program, "a_position"),
      colorLocation: gl.getAttribLocation(program, "a_color"),
      modelViewMatrixUniformLocation: gl.getUniformLocation(
         program,
         "u_modelViewMatrix"
      ),
      viewingMatrixUniformLocation: gl.getUniformLocation(
         program,
         "u_viewingMatrix"
      ),
      projectionMatrixUniformLocation: gl.getUniformLocation(
         program,
         "u_projectionMatrix"
      ),
   };

   // Guarda os buffers
   const buffers = {
      vertexBuffer: gl.createBuffer(),
      colorBuffer: gl.createBuffer(),
      cubeColors: setCubeColors(),
      coordinateAxesColors: defineCoordinateAxesColors(),
      groundColors: setGroundPlaneColors(),
   };

   const geometry = {
      cube: setCubeVertices(0.5),
      axes: defineCoordinateAxes(),
      ground: setGroundPlaneVertices(10.0),
   };

   gl.enable(gl.DEPTH_TEST);
   gl.clearColor(0.0, 0.0, 0.0, 1.0);

   let P0 = [0.0, 1.0, 5.0];
   let Pref = [0.0, 0.0, 0.0];

   let V = [0.0, 1.0, 0.0];

   let xw_min = -1.0;
   let xw_max = 1.0;
   let yw_min = -1.0;
   let yw_max = 1.0;

   let z_near = -0.5;
   let z_far = -100.0;

   let viewingMatrix;
   let projectionMatrix;

   function drawScene() {
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      viewingMatrix = m4.setViewingMatrix(P0, Pref, V);

      projectionMatrix = m4.setPerspectiveProjectionMatrix(
         xw_min,
         xw_max,
         yw_min,
         yw_max,
         z_near,
         z_far
      );

      gl.uniformMatrix4fv(
         locations.viewingMatrixUniformLocation,
         false,
         viewingMatrix
      );
      gl.uniformMatrix4fv(
         locations.projectionMatrixUniformLocation,
         false,
         projectionMatrix
      );

      // 4. Desenha cada objeto
      drawCube(gl, program, buffers, locations, geometry.cube);
      drawCoordinateAxes(gl, program, buffers, locations, geometry.axes);
      drawGroundPlane(gl, program, buffers, locations, geometry.ground);
   }

   function handleKeyDown(event) {
      const step = 0.1;

      switch (event.key) {
         // Mover a Câmera (P0)
         case "w":
            P0[2] -= step;
            break; // Frente (mundo Z)
         case "s":
            P0[2] += step;
            break; // Trás (mundo Z)
         case "a":
            P0[0] -= step;
            break; // Esquerda (mundo X)
         case "d":
            P0[0] += step;
            break; // Direita (mundo X)
         case "q":
            P0[1] += step;
            break; // Cima (mundo Y)
         case "e":
            P0[1] -= step;
            break; // Baixo (mundo Y)

         // Rotacionar a Câmera
         case "ArrowUp":
            Pref[1] += step;
            break;
         case "ArrowDown":
            Pref[1] -= step;
            break;
         case "ArrowLeft":
            Pref[0] -= step;
            break;
         case "ArrowRight":
            Pref[0] += step;
            break;
         default:
            return;
      }

      event.preventDefault();
      drawScene();
   }

   window.addEventListener("keydown", handleKeyDown);

   drawScene();
}

function unitVector(v) {
   let vModulus = vectorModulus(v);
   return v.map(function (x) {
      return x / vModulus;
   });
}

function vectorModulus(v) {
   return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2) + Math.pow(v[2], 2));
}

function radToDeg(r) {
   return (r * 180) / Math.PI;
}

function degToRad(d) {
   return (d * Math.PI) / 180;
}

window.addEventListener("load", main);
