function initCanvas2() {
   const vertexShaderSource = `
   attribute vec2 a_position;
   void main() {
      gl_Position = vec4(a_position, 0, 1);
      gl_PointSize = 2.0;
   }
   `;
   const fragmentShaderSource = `
   precision mediump float;
   uniform vec3 u_color;
   void main() {
      gl_FragColor = vec4(u_color, 1.0);
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

   function bresenham(x0, y0, x1, y1) {
      const points = [];
      const dx = Math.abs(x1 - x0);
      const dy = Math.abs(y1 - y0);

      if (dy === 0) {
         let startX = Math.min(x0, x1);
         let endX = Math.max(x0, x1);
         for (let x = startX; x <= endX; x++) {
            points.push(x, y0);
         }
         return points;
      }

      if (dx === 0) {
         let startY = Math.min(y0, y1);
         let endY = Math.max(y0, y1);
         for (let y = startY; y <= endY; y++) {
            points.push(x0, y);
         }
         return points;
      }

      if (dx === dy) {
         const sx = x0 < x1 ? 1 : -1;
         const sy = y0 < y1 ? 1 : -1;
         let x = x0;
         let y = y0;
         for (let i = 0; i <= dx; i++) {
            points.push(x, y);
            x += sx;
            y += sy;
         }
         return points;
      }

      const sx = x0 < x1 ? 1 : -1;
      const sy = y0 < y1 ? 1 : -1;
      let x = x0;
      let y = y0;

      if (dx > dy) {
         let p = 2 * dy - dx;
         for (let i = 0; i <= dx; i++) {
            points.push(x, y);
            if (p < 0) {
               p = p + 2 * dy;
            } else {
               y += sy;
               p = p + 2 * dy - 2 * dx;
            }
            x += sx;
         }
      } else {
         let p = 2 * dx - dy;
         for (let i = 0; i <= dy; i++) {
            points.push(x, y);
            if (p < 0) {
               p = p + 2 * dx;
            } else {
               x += sx;
               p = p + 2 * dx - 2 * dy;
            }
            y += sy;
         }
      }

      return points;
   }

   function main() {
      const canvas = document.getElementById("glBresenham2");
      const gl = canvas.getContext("webgl");

      if (!gl) {
         console.error("WebGL not supported");
         return;
      }

      const vertexShader = createShader(
         gl,
         gl.VERTEX_SHADER,
         vertexShaderSource
      );
      const fragmentShader = createShader(
         gl,
         gl.FRAGMENT_SHADER,
         fragmentShaderSource
      );
      const program = createProgram(gl, vertexShader, fragmentShader);

      const positionAttributeLocation = gl.getAttribLocation(
         program,
         "a_position"
      );
      const colorUniformLocation = gl.getUniformLocation(program, "u_color");
      const positionBuffer = gl.createBuffer();

      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clearColor(0.95, 0.95, 0.95, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(
         positionAttributeLocation,
         2,
         gl.FLOAT,
         false,
         0,
         0
      );

      let drawChoice = "r";
      let clickPoints = [];
      let lastDrawnPoints = [];
      let currentColor = [1.0, 0.0, 0.0];
      canvas.addEventListener("mousedown", mouseClick);
      window.addEventListener("keydown", keyDown, false);

      function mouseClick(event) {
         const rect = canvas.getBoundingClientRect();
         const x_pixel = Math.round(event.clientX - rect.left);
         const y_pixel = Math.round(event.clientY - rect.top);

         clickPoints.push(x_pixel, y_pixel);

         if (drawChoice === "r" && clickPoints.length === 4) {
            const [p1x, p1y, p2x, p2y] = clickPoints;

            const linePixels = bresenham(p1x, p1y, p2x, p2y);
            const webglPoints = normalizePoints(linePixels);
            lastDrawnPoints = webglPoints;
            drawLine(lastDrawnPoints);
            clickPoints = [];
         } else if (drawChoice === "t" && clickPoints.length === 6) {
            const [p1x, p1y, p2x, p2y, p3x, p3y] = clickPoints;

            const trianglePixels = [
               ...bresenham(p1x, p1y, p2x, p2y),
               ...bresenham(p1x, p1y, p3x, p3y),
               ...bresenham(p2x, p2y, p3x, p3y),
            ];

            const webglPoints = normalizePoints(trianglePixels);

            lastDrawnPoints = webglPoints;
            drawLine(lastDrawnPoints);
            clickPoints = [];
         }
      }

      function keyDown(event) {
         const key = event.key.toLowerCase();
         if (key === "t" || key === "r") {
            if (drawChoice !== key) {
               drawChoice = key;
               clickPoints = [];
               lastDrawnPoints = [];
               gl.clear(gl.COLOR_BUFFER_BIT);
            }
         } else {
            changeColor(event.key);
         }
      }

      function changeColor(key) {
         switch (key) {
            case "0":
               currentColor = [1.0, 0.5, 1.0];
               break;
            case "1":
               currentColor = [1.0, 0.0, 0.0];
               break;
            case "2":
               currentColor = [0.0, 1.0, 0.0];
               break;
            case "3":
               currentColor = [0.0, 0.0, 1.0];
               break;
            case "4":
               currentColor = [1.0, 1.0, 0.0];
               break;
            case "5":
               currentColor = [1.0, 0.0, 1.0];
               break;
            case "6":
               currentColor = [0.0, 1.0, 1.0];
               break;
            case "7":
               currentColor = [1.0, 0.5, 0.0];
               break;
            case "8":
               currentColor = [0.5, 0.0, 1.0];
               break;
            case "9":
               currentColor = [0.0, 0.0, 0.0];
               break;
         }
         if (lastDrawnPoints.length > 0) {
            drawLine(lastDrawnPoints);
         }
      }

      function drawLine(pointsData) {
         gl.clear(gl.COLOR_BUFFER_BIT);
         gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
         gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(pointsData),
            gl.STATIC_DRAW
         );

         gl.uniform3fv(colorUniformLocation, currentColor);

         const primitiveType = gl.POINTS;
         const offset = 0;
         const count = pointsData.length / 2;
         gl.drawArrays(primitiveType, offset, count);
      }

      function normalizePoints(linePixels) {
         const webglPoints = [];
         for (let i = 0; i < linePixels.length; i += 2) {
            const x = linePixels[i];
            const y = linePixels[i + 1];
            const webglX = (x / gl.canvas.width) * 2 - 1;
            const webglY = ((gl.canvas.height - y) / gl.canvas.height) * 2 - 1;
            webglPoints.push(webglX, webglY);
         }
         return webglPoints;
      }
   }

   main();
}
