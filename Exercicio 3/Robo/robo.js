// robo.js - Lógica para desenhar e animar o robô

// Inicia o programa principal quando a página carrega
main();

function main() {
   const canvas = document.querySelector("#glcanvas_robo");
   const gl = canvas.getContext("webgl");

   if (!gl) {
      alert("Não foi possível inicializar o WebGL.");
      return;
   }

   // --- SHADERS ---
   const vsSource = `attribute vec2 a_position; uniform mat3 u_matrix; void main() { gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1); }`;
   const fsSource = `precision mediump float; uniform vec4 u_color; void main() { gl_FragColor = u_color; }`;
   const program = createProgram(
      gl,
      createShader(gl, gl.VERTEX_SHADER, vsSource),
      createShader(gl, gl.FRAGMENT_SHADER, fsSource)
   );

   // --- OBTENDO LOCALIZAÇÕES ---
   const positionAttributeLocation = gl.getAttribLocation(
      program,
      "a_position"
   );
   const colorUniformLocation = gl.getUniformLocation(program, "u_color");
   const matrixUniformLocation = gl.getUniformLocation(program, "u_matrix");

   // --- GEOMETRIAS ---
   const geometries = defineGeometries(gl);

   // --- ESTADO DA ANIMAÇÃO ---
   let tempo = 0;

   // --- CORES ---
   const cores = {
      corpo: [0.2, 0.4, 1.0, 1.0], // Azul
      cabeca: [0.8, 0.8, 0.8, 1.0], // Cinza claro
      membros: [0.1, 0.3, 0.8, 1.0], // Azul escuro
   };

   // --- LOOP DE RENDERIZAÇÃO ---
   function drawScene() {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clearColor(0.9, 0.9, 0.9, 1.0); // Fundo cinza claro
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);

      // --- LÓGICA DE ANIMAÇÃO ---
      tempo += 0.05;
      const anguloMax = Math.PI / 6; // Ângulo máximo de balanço (30 graus)
      const anguloBalanço = Math.sin(tempo) * anguloMax;

      const aspectRatio = gl.canvas.clientHeight / gl.canvas.clientWidth;
      const aspectMatrix = m3.scaling(aspectRatio, 1);

      const matrizRobo = m3.identity();
      const matrizRoboFinal = m3.multiply(aspectMatrix, matrizRobo);

      // --- DESENHANDO AS PARTES ---
      // 1. Corpo
      drawPart(
         geometries.corpo,
         cores.corpo,
         matrizRoboFinal,
         gl.TRIANGLE_STRIP
      );

      // 2. Cabeça
      const matrizCabeca = m3.multiply(
         matrizRoboFinal,
         m3.translation(0, 0.22)
      );
      drawPart(
         geometries.cabeca,
         cores.cabeca,
         matrizCabeca,
         gl.TRIANGLE_STRIP
      );

      // 3. Braço Direito
      const rotacaoBracoDir = m3.rotation(anguloBalanço);
      const translacaoBracoDir = m3.translation(0.13, 0.15); // Posição do ombro
      let matrizBracoDir = m3.multiply(translacaoBracoDir, rotacaoBracoDir);
      matrizBracoDir = m3.multiply(matrizRoboFinal, matrizBracoDir);
      drawPart(
         geometries.braco,
         cores.membros,
         matrizBracoDir,
         gl.TRIANGLE_STRIP
      );

      // 4. Braço Esquerdo (gira na direção oposta)
      const rotacaoBracoEsq = m3.rotation(-anguloBalanço);
      const translacaoBracoEsq = m3.translation(-0.13, 0.15);
      let matrizBracoEsq = m3.multiply(translacaoBracoEsq, rotacaoBracoEsq);
      matrizBracoEsq = m3.multiply(matrizRoboFinal, matrizBracoEsq);
      drawPart(
         geometries.braco,
         cores.membros,
         matrizBracoEsq,
         gl.TRIANGLE_STRIP
      );

      // 5. Perna Direita (gira oposto ao braço direito)
      const rotacaoPernaDir = m3.rotation(-anguloBalanço);
      const translacaoPernaDir = m3.translation(0.06, -0.15); // Posição do quadril
      let matrizPernaDir = m3.multiply(translacaoPernaDir, rotacaoPernaDir);
      matrizPernaDir = m3.multiply(matrizRoboFinal, matrizPernaDir);
      drawPart(
         geometries.perna,
         cores.membros,
         matrizPernaDir,
         gl.TRIANGLE_STRIP
      );

      // 6. Perna Esquerda (gira oposto ao braço esquerdo)
      const rotacaoPernaEsq = m3.rotation(anguloBalanço);
      const translacaoPernaEsq = m3.translation(-0.06, -0.15);
      let matrizPernaEsq = m3.multiply(translacaoPernaEsq, rotacaoPernaEsq);
      matrizPernaEsq = m3.multiply(matrizRoboFinal, matrizPernaEsq);
      drawPart(
         geometries.perna,
         cores.membros,
         matrizPernaEsq,
         gl.TRIANGLE_STRIP
      );

      requestAnimationFrame(drawScene);
   }

   // Função auxiliar para desenhar uma parte
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
   return null;
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
   return null;
}

function defineGeometries(gl) {
   // Corpo (Torso)
   const corpoBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, corpoBuffer);
   gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-0.1, -0.15, 0.1, -0.15, -0.1, 0.15, 0.1, 0.15]),
      gl.STATIC_DRAW
   );

   // Cabeça
   const cabecaBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, cabecaBuffer);
   gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-0.07, -0.07, 0.07, -0.07, -0.07, 0.07, 0.07, 0.07]),
      gl.STATIC_DRAW
   );

   // Braço - PIVÔ AJUSTADO PARA (0,0) NO TOPO
   const bracoBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, bracoBuffer);
   gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-0.03, -0.24, 0.03, -0.24, -0.03, 0, 0.03, 0]),
      gl.STATIC_DRAW
   );

   // Perna - PIVÔ AJUSTADO PARA (0,0) NO TOPO
   const pernaBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, pernaBuffer);
   gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-0.04, -0.3, 0.04, -0.3, -0.04, 0, 0.04, 0]),
      gl.STATIC_DRAW
   );

   return {
      corpo: { buffer: corpoBuffer, vertexCount: 4 },
      cabeca: { buffer: cabecaBuffer, vertexCount: 4 },
      braco: { buffer: bracoBuffer, vertexCount: 4 },
      perna: { buffer: pernaBuffer, vertexCount: 4 },
   };
}
