function initCanvas3() {
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

   function bresenhamCircle(centerX, centerY, radius) {
      const points = [];
      let x = 0;
      let y = radius;
      let p = 3 - 2 * radius;

      function plotCirclePoints(cx, cy, x_offset, y_offset) {
         points.push(cx + x_offset, cy + y_offset);
         points.push(cx - x_offset, cy + y_offset);
         points.push(cx + x_offset, cy - y_offset);
         points.push(cx - x_offset, cy - y_offset);
         points.push(cx + y_offset, cy + x_offset);
         points.push(cx - y_offset, cy + x_offset);
         points.push(cx + y_offset, cy - x_offset);
         points.push(cx - y_offset, cy - x_offset);
      }

      plotCirclePoints(centerX, centerY, x, y);

      while (x < y) {
         x++;
         if (p < 0) {
            p = p + 4 * x + 6;
         } else {
            y--;
            p = p + 4 * (x - y) + 10;
         }
         plotCirclePoints(centerX, centerY, x, y);
      }

      return points;
   }

   function main() {
      const canvas = document.getElementById("glBresenham3");
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

      let clickPoints = [];
      canvas.addEventListener("mousedown", mouseClick);

      function mouseClick(event) {
         const rect = canvas.getBoundingClientRect();
         const x_pixel = Math.round(event.clientX - rect.left);
         const y_pixel = Math.round(event.clientY - rect.top);

         clickPoints.push(x_pixel, y_pixel);

         if (clickPoints.length === 4) {
            const [centerX, centerY, radiusX, radiusY] = clickPoints;

            const dx = radiusX - centerX;
            const dy = radiusY - centerY;
            const radius = Math.round(Math.sqrt(dx * dx + dy * dy));

            const circlePixels = bresenhamCircle(centerX, centerY, radius);

            const webglPoints = [];
            for (let i = 0; i < circlePixels.length; i += 2) {
               const x = circlePixels[i];
               const y = circlePixels[i + 1];
               const webglX = (x / canvas.width) * 2 - 1;
               const webglY = ((canvas.height - y) / canvas.height) * 2 - 1;
               webglPoints.push(webglX, webglY);
            }

            drawShape(webglPoints);
            clickPoints = [];
         }
      }

      function drawShape(pointsData) {
         gl.clear(gl.COLOR_BUFFER_BIT);
         gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
         gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(pointsData),
            gl.STATIC_DRAW
         );
         gl.uniform3f(colorUniformLocation, 0.0, 0.0, 1.0);

         const count = pointsData.length / 2;
         gl.drawArrays(gl.POINTS, 0, count);
      }
   }

   main();
}
