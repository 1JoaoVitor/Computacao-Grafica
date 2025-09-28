// carro.js - Lógica principal para desenhar e animar o carro em WebGL.

// Inicia o programa principal quando a página carrega
main();

function main() {
   const canvas = document.querySelector("#glcanvas_catavento");
   const gl = canvas.getContext("webgl");

   if (!gl) {
      alert(
         "Não foi possível inicializar o WebGL. Seu navegador pode não suportá-lo."
      );
      return;
   }

   // --- SHADERS ---
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

   // --- OBTENDO LOCALIZAÇÕES ---
   const positionAttributeLocation = gl.getAttribLocation(
      program,
      "a_position"
   );
   const colorUniformLocation = gl.getUniformLocation(program, "u_color");
   const matrixUniformLocation = gl.getUniformLocation(program, "u_matrix");

   let matrix = m3.identity();
   gl.uniformMatrix3fv(matrixUniformLocation, false, matrix);

   // --- GEOMETRIAS ---
   const geometries = defineGeometries(gl);

   let tempo = 0;

   // --- DEFININDO AS CORES ---
   // Um array com as 4 cores que queremos para as pás
   const coresDasPas = [
      [1.0, 0.2, 0.2, 1.0], // Vermelho
      [1.0, 1.0, 0.2, 1.0], // Amarelo
      [0.2, 0.8, 0.2, 1.0], // Verde
      [0.2, 0.2, 1.0, 1.0], // Azul
   ];

   // --- LOOP DE RENDERIZAÇÃO ---
   function drawScene() {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      gl.clearColor(0.8, 0.9, 1.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);

      tempo += 0.02;
      const anguloRotacaoGeral = tempo;

      identidade = m3.identity();

      drawPart(
         geometries.base,
         [0.3, 0.3, 0.3, 1],
         identidade,
         gl.TRIANGLE_STRIP
      );

      const NUM_PA = 4;
      for (let i = 0; i < NUM_PA; i++) {
         const anguloPA = (i / NUM_PA) * 2 * Math.PI;
         const anguloFinal = anguloPA + anguloRotacaoGeral;
         let matrizPa = m3.rotation(anguloFinal);
         const corDaPa = coresDasPas[i];

         drawPart(geometries.pa, corDaPa, matrizPa, gl.TRIANGLE_STRIP);
      }

      drawPart(
         geometries.centro,
         [0.3, 0.3, 0.3, 1],
         identidade,
         gl.TRIANGLE_FAN
      );
      requestAnimationFrame(drawScene);
   }

   // Função auxiliar para desenhar uma parte do carro
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

   // Inicia a animação
   drawScene();
   requestAnimationFrame(drawScene);
}

// --- FUNÇÕES AUXILIARES ---

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
   const paBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, paBuffer);
   gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
         // Vértices para um TRIANGLE_STRIP que forma um trapézio
         0.05,
         0.05, // Ponto 1: Canto interno superior
         0.05,
         -0.05, // Ponto 2: Canto interno inferior
         0.4,
         0.2, // Ponto 3: Canto externo superior
         0.4,
         -0.2, // Ponto 4: Canto externo inferior
      ]),
      gl.STATIC_DRAW
   );

   const baseBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, baseBuffer);
   gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-0.04, -0.6, 0.04, -0.6, -0.04, -0.0, 0.04, -0.0]),
      gl.STATIC_DRAW
   );

   const centroBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, centroBuffer);
   const CENTRO_RAIO = 0.07;
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
      pa: { buffer: paBuffer, vertexCount: 4 },
      base: { buffer: baseBuffer, vertexCount: 4 },
      centro: { buffer: centroBuffer, vertexCount: CENTRO_SEGMENTOS + 2 },
   };
}
