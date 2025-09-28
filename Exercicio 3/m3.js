// m3.js - Uma biblioteca simples para matrizes 3x3 (usadas para 2D).

const m3 = {
   /**
    * Retorna uma matriz identidade 3x3.
    * @returns {number[]} A matriz identidade.
    */
   identity: () => [1, 0, 0, 0, 1, 0, 0, 0, 1],

   /**
    * Cria uma matriz de translação.
    * @param {number} tx - Translação em X.
    * @param {number} ty - Translação em Y.
    * @returns {number[]} A matriz de translação.
    */
   translation: (tx, ty) => [1, 0, 0, 0, 1, 0, tx, ty, 1],

   /**
    * Cria uma matriz de rotação.
    * @param {number} angleInRadians - O ângulo para rotacionar, em radianos.
    * @returns {number[]} A matriz de rotação.
    */
   rotation: (angleInRadians) => {
      const c = Math.cos(angleInRadians);
      const s = Math.sin(angleInRadians);
      return [c, -s, 0, s, c, 0, 0, 0, 1];
   },

   /**
    * Cria uma matriz de escala.
    * @param {number} sx - Fator de escala em X.
    * @param {number} sy - Fator de escala em Y.
    * @returns {number[]} A matriz de escala.
    */
   scaling: (sx, sy) => [sx, 0, 0, 0, sy, 0, 0, 0, 1],

   /**
    * Multiplica duas matrizes 3x3.
    * @param {number[]} a - A primeira matriz.
    * @param {number[]} b - A segunda matriz.
    * @returns {number[]} A matriz resultante.
    */
   multiply: (a, b) => {
      const a00 = a[0 * 3 + 0];
      const a01 = a[0 * 3 + 1];
      const a02 = a[0 * 3 + 2];
      const a10 = a[1 * 3 + 0];
      const a11 = a[1 * 3 + 1];
      const a12 = a[1 * 3 + 2];
      const a20 = a[2 * 3 + 0];
      const a21 = a[2 * 3 + 1];
      const a22 = a[2 * 3 + 2];
      const b00 = b[0 * 3 + 0];
      const b01 = b[0 * 3 + 1];
      const b02 = b[0 * 3 + 2];
      const b10 = b[1 * 3 + 0];
      const b11 = b[1 * 3 + 1];
      const b12 = b[1 * 3 + 2];
      const b20 = b[2 * 3 + 0];
      const b21 = b[2 * 3 + 1];
      const b22 = b[2 * 3 + 2];
      return [
         b00 * a00 + b01 * a10 + b02 * a20,
         b00 * a01 + b01 * a11 + b02 * a21,
         b00 * a02 + b01 * a12 + b02 * a22,
         b10 * a00 + b11 * a10 + b12 * a20,
         b10 * a01 + b11 * a11 + b12 * a21,
         b10 * a02 + b11 * a12 + b12 * a22,
         b20 * a00 + b21 * a10 + b22 * a20,
         b20 * a01 + b21 * a11 + b22 * a21,
         b20 * a02 + b21 * a12 + b22 * a22,
      ];
   },
};
