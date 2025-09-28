main();

function main() {
   const canvas = document.querySelector("#glcanvas_flor");
   const gl = canvas.getContext("webgl");

   if (!gl) {
      alert(
         "Não foi possível inicializar o WebGL. Seu navegador pode não suportá-lo."
      );
      return;
   }

   const vsSource = `
        attribute vec2 a_position;
        uniform mat3 u_matrix;

        void main() {
            gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
        }
    `;

   const fsSource = `
        precision mediump float;
        uniform vec4 u_color;

        void main() {
            gl_FragColor = u_color;
        }
    `;

   const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
   const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
   const program = createProgram(gl, vertexShader, fragmentShader);

   const positionAttributeLocation = gl.getAttribLocation(
      program,
      "a_position"
   );
   const colorUniformLocation = gl.getUniformLocation(program, "u_color");
   const matrixUniformLocation = gl.getUniformLocation(program, "u_matrix");

   let matrix = m3.identity();
   gl.uniformMatrix3fv(matrixUniformLocation, false, matrix);

   const geometries = defineGeometries(gl);

   let tempo = 0;

   function drawScene() {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      gl.clearColor(0.8, 0.9, 1.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);

      identidade = m3.identity();

      tempo += 0.05;

      const oscilacao = Math.sin(tempo);

      const escalaBase = 1.0;
      const amplitude = 0.03;
      const escalaDinamica = escalaBase + oscilacao * amplitude;

      drawPart(
         geometries.base,
         [0.2, 1, 0.2, 1],
         identidade,
         gl.TRIANGLE_STRIP
      );

      const NUM_PETALAS = 6;
      for (let i = 0; i < NUM_PETALAS; i++) {
         const anguloPetala = (i / NUM_PETALAS) * 2 * Math.PI;

         const matrizEscala = m3.scaling(escalaDinamica, escalaDinamica);

         let matrix = matrizEscala;

         matrix = m3.multiply(m3.translation(0, 0.15), matrix);

         matrix = m3.multiply(m3.rotation(anguloPetala), matrix);

         drawPart(geometries.petala, [1, 0.3, 0.3, 1], matrix, gl.TRIANGLE_FAN);
      }

      drawPart(geometries.centro, [1, 1, 0, 1], identidade, gl.TRIANGLE_FAN);
      requestAnimationFrame(drawScene);
   }

   const drawPart = (geometry, color, transformationMatrix, primitiveType) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, geometry.buffer);

      gl.vertexAttribPointer(
         positionAttributeLocation,
         2,
         gl.FLOAT,
         false,
         0,
         0
      );
      gl.enableVertexAttribArray(positionAttributeLocation);

      gl.uniform4fv(colorUniformLocation, color);
      gl.uniformMatrix3fv(matrixUniformLocation, false, transformationMatrix);

      gl.drawArrays(primitiveType, 0, geometry.vertexCount);
   };

   requestAnimationFrame(drawScene);
}

function createShader(gl, type, source) {
   const shader = gl.createShader(type);
   gl.shaderSource(shader, source);
   gl.compileShader(shader);
   if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      return shader;
   }
   console.error("Erro ao compilar shader:", gl.getShaderInfoLog(shader));
   gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
   const program = gl.createProgram();
   gl.attachShader(program, vertexShader);
   gl.attachShader(program, fragmentShader);
   gl.linkProgram(program);
   if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return program;
   }
   console.error("Erro ao linkar programa:", gl.getProgramInfoLog(program));
   gl.deleteProgram(program);
}

function defineGeometries(gl) {
   const petalaBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, petalaBuffer);
   const PETALA_RAIO_X = 0.08;
   const PETALA_RAIO_Y = 0.15;
   const PETALA_SEGMENTOS = 16;
   const petalaVertices = [0, 0];
   for (let i = 0; i <= PETALA_SEGMENTOS; i++) {
      const angulo = (i / PETALA_SEGMENTOS) * 2 * Math.PI;
      petalaVertices.push(
         Math.cos(angulo) * PETALA_RAIO_X,
         Math.sin(angulo) * PETALA_RAIO_Y
      );
   }
   gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(petalaVertices),
      gl.STATIC_DRAW
   );

   const baseBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, baseBuffer);
   gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-0.04, -0.6, 0.04, -0.6, -0.04, -0.1, 0.04, -0.1]),
      gl.STATIC_DRAW
   );

   const centroBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, centroBuffer);
   const CENTRO_RAIO = 0.1;
   const CENTRO_SEGMENTOS = 16;
   const centroVertices = [0, 0];
   for (let i = 0; i <= CENTRO_SEGMENTOS; i++) {
      const angulo = (i / CENTRO_SEGMENTOS) * 2 * Math.PI;
      centroVertices.push(
         Math.cos(angulo) * CENTRO_RAIO,
         Math.sin(angulo) * CENTRO_RAIO
      );
   }
   gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(centroVertices),
      gl.STATIC_DRAW
   );

   return {
      petala: { buffer: petalaBuffer, vertexCount: PETALA_SEGMENTOS + 2 },
      base: { buffer: baseBuffer, vertexCount: 4 },
      centro: { buffer: centroBuffer, vertexCount: CENTRO_SEGMENTOS + 2 },
   };
}
