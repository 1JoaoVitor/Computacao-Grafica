// carro.js - Lógica principal para desenhar e animar o carro em WebGL.

// Inicia o programa principal quando a página carrega
main();

function main() {
   const canvas = document.querySelector("#glcanvas_carro");
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

   // Compila e linka os shaders em um programa
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

   // --- ESTADO DA ANIMAÇÃO ---
   let carX = -1.2; // Posição inicial fora da tela à esquerda
   let carY = -0.3; // Posição Y do carro
   let wheelAngle = 0; // Ângulo de rotação das rodas

   // --- LOOP DE RENDERIZAÇÃO ---
   function drawScene() {
      // Redimensiona o canvas para preencher a tela inteira
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      // Limpa o canvas com uma cor de fundo
      gl.clearColor(0.8, 0.9, 1.0, 1.0); // Azul claro (céu)
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Diz ao WebGL para usar nosso programa (shaders)
      gl.useProgram(program);

      // --- LÓGICA DE ANIMAÇÃO ---
      carX += 0.005;
      if (carX > 1.2) {
         // Reinicia a posição quando o carro sai da tela
         carX = -1.2;
      }
      wheelAngle -= 0.1; // Rotaciona as rodas

      // --- MATRIZES DE TRANSFORMAÇÃO ---
      const carMatrix = m3.translation(carX, carY);

      // --- DESENHANDO AS PARTES ---
      // 1. Chassi (vermelho)
      drawPart(
         geometries.chassi,
         [1, 0.2, 0.2, 1],
         carMatrix,
         gl.TRIANGLE_STRIP
      );

      // 2. Teto (vermelho) - Já está na posição correta em relação ao chassi
      drawPart(geometries.teto, [1, 0.2, 0.2, 1], carMatrix, gl.TRIANGLE_STRIP);

      // 3. Roda Traseira (preta)
      // A ordem da multiplicação é importante: primeiro rotaciona, depois translada para a posição relativa, e depois move com o carro.
      let wheelMatrix1 = m3.multiply(
         m3.translation(-0.12, -0.1),
         m3.rotation(wheelAngle)
      );
      wheelMatrix1 = m3.multiply(carMatrix, wheelMatrix1);
      drawPart(
         geometries.roda,
         [0.2, 0.2, 0.2, 1],
         wheelMatrix1,
         gl.TRIANGLE_FAN
      );

      // 4. Roda Dianteira (preta)
      let wheelMatrix2 = m3.multiply(
         m3.translation(0.12, -0.1),
         m3.rotation(wheelAngle)
      );
      wheelMatrix2 = m3.multiply(carMatrix, wheelMatrix2);
      drawPart(
         geometries.roda,
         [0.2, 0.2, 0.2, 1],
         wheelMatrix2,
         gl.TRIANGLE_FAN
      );

      // Chama a si mesma para o próximo frame, criando o loop de animação
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
   // Chassi do carro
   const chassiBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, chassiBuffer);
   gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-0.2, -0.1, 0.2, -0.1, -0.2, 0.0, 0.2, 0.0]),
      gl.STATIC_DRAW
   );

   // Teto do carro
   const tetoBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, tetoBuffer);
   gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-0.15, 0.0, 0.1, 0.0, -0.15, 0.1, 0.1, 0.1]),
      gl.STATIC_DRAW
   );

   // Roda
   const rodaBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, rodaBuffer);
   const RODA_RAIO = 0.05;
   const RODA_SEGMENTOS = 16;
   const rodaVertices = [0, 0]; // Centro do fã de triângulos
   for (let i = 0; i <= RODA_SEGMENTOS; i++) {
      const angulo = (i / RODA_SEGMENTOS) * 2 * Math.PI;
      rodaVertices.push(
         Math.cos(angulo) * RODA_RAIO,
         Math.sin(angulo) * RODA_RAIO
      );
   }
   gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(rodaVertices),
      gl.STATIC_DRAW
   );

   return {
      chassi: { buffer: chassiBuffer, vertexCount: 4 },
      teto: { buffer: tetoBuffer, vertexCount: 4 },
      roda: { buffer: rodaBuffer, vertexCount: RODA_SEGMENTOS + 2 },
   };
}
