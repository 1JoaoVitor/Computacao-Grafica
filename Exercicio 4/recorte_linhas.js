const JANELA_PADRAO = {
   xMin: 100,
   yMin: 100,
   xMax: 400,
   yMax: 300,
};

const OUTCODE_BITS = {
   TOP: 0b1000,
   BOTTOM: 0b0100,
   RIGHT: 0b0010,
   LEFT: 0b0001,
};

class Ponto {
   constructor(x, y) {
      this.x = x;
      this.y = y;
   }
   toString() {
      return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
   }
}

function calcularOutcode(ponto, janela) {
   let outcode = 0;

   // Bit 1 & 2: LEFT / RIGHT
   if (ponto.x < janela.xMin) {
      outcode |= OUTCODE_BITS.LEFT;
   } else if (ponto.x > janela.xMax) {
      outcode |= OUTCODE_BITS.RIGHT;
   }

   // Bit 3 & 4: BOTTOM / TOP
   if (ponto.y < janela.yMin) {
      outcode |= OUTCODE_BITS.BOTTOM;
   } else if (ponto.y > janela.yMax) {
      outcode |= OUTCODE_BITS.TOP;
   }

   return outcode;
}

function calcularInterseccao(p1, p2, outcode, janela) {
   let x = p1.x;
   let y = p1.y;

   const dx = p2.x - p1.x;
   const dy = p2.y - p1.y;

   if (outcode & OUTCODE_BITS.TOP) {
      y = janela.yMax;
      x = p1.x + (dx / dy) * (janela.yMax - p1.y);
   } else if (outcode & OUTCODE_BITS.BOTTOM) {
      y = janela.yMin;

      x = p1.x + (dx / dy) * (janela.yMin - p1.y);
   } else if (outcode & OUTCODE_BITS.RIGHT) {
      x = janela.xMax;
      y = p1.y + (dy / dx) * (janela.xMax - p1.x);
   } else if (outcode & OUTCODE_BITS.LEFT) {
      x = janela.xMin;

      y = p1.y + (dy / dx) * (janela.xMin - p1.x);
   }

   return new Ponto(x, y);
}

function CohenSutherland(p1, p2, janela) {
   let clippedP1 = new Ponto(p1.x, p1.y);
   let clippedP2 = new Ponto(p2.x, p2.y);

   let outcode1 = calcularOutcode(clippedP1, janela);
   let outcode2 = calcularOutcode(clippedP2, janela);
   let aceitar = false;

   console.log(
      `\n--- Recortando Linha: ${p1.toString()} a ${p2.toString()} ---`
   );

   while (true) {
      console.log(
         `Status: P1(${outcode1.toString(2).padStart(4, "0")}) - P2(${outcode2
            .toString(2)
            .padStart(4, "0")})`
      );

      if ((outcode1 | outcode2) === 0) {
         aceitar = true;
         console.log("-> Teste de Aceitação Trivial: Linha aceita.");
         break;
      } else if ((outcode1 & outcode2) !== 0) {
         console.log("-> Teste de Rejeição Trivial: Linha rejeitada.");
         break;
      } else {
         let outcodeFora;
         let pFora;
         let pDentro;

         if (outcode1 !== 0) {
            outcodeFora = outcode1;
            pFora = clippedP1;
            pDentro = clippedP2;
         } else {
            outcodeFora = outcode2;
            pFora = clippedP2;
            pDentro = clippedP1;
         }

         console.log(
            `-> Recorte necessário. Ponto externo: ${pFora.toString()}. Outcode: ${outcodeFora
               .toString(2)
               .padStart(4, "0")}`
         );

         let pInterseccao = calcularInterseccao(
            pFora,
            pDentro,
            outcodeFora,
            janela
         );

         console.log(
            `-> Ponto de Intersecção calculado: ${pInterseccao.toString()}`
         );

         if (pFora === clippedP1) {
            clippedP1 = pInterseccao;
            outcode1 = calcularOutcode(clippedP1, janela);
         } else {
            clippedP2 = pInterseccao;
            outcode2 = calcularOutcode(clippedP2, janela);
         }
      }
   }

   if (aceitar) {
      return [clippedP1, clippedP2];
   } else {
      return null;
   }
}

//testes
const W = JANELA_PADRAO;

let l1_p1 = new Ponto(150, 150);
let l1_p2 = new Ponto(350, 250);
console.log("\n*** LINHA 1: Completa (Aceitação Trivial) ***");
console.log("Resultado L1:", CohenSutherland(l1_p1, l1_p2, W));

let l2_p1 = new Ponto(50, 50);
let l2_p2 = new Ponto(90, 90);
console.log("\n*** LINHA 2: Completa (Rejeição Trivial) ***");
console.log("Resultado L2:", CohenSutherland(l2_p1, l2_p2, W));

let l3_p1 = new Ponto(50, 150);
let l3_p2 = new Ponto(150, 200);
console.log("\n*** LINHA 3: Recorte na Borda Esquerda ***");
console.log("Resultado L3:", CohenSutherland(l3_p1, l3_p2, W));

let l4_p1 = new Ponto(300, 350);
let l4_p2 = new Ponto(450, 200);
console.log("\n*** LINHA 4: Recorte Duplo (TOP e depois RIGHT) ***");
console.log("Resultado L4:", CohenSutherland(l4_p1, l4_p2, W));
