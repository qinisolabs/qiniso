// Verhoeff checksum (used by India's Aadhaar). Standard d / p / inv tables.
const D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];
const P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 9, 1, 4, 2, 6, 7, 3],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];
const INV = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

/** True if the digit string (including its trailing check digit) is Verhoeff-valid. */
export function verhoeffValid(num: string): boolean {
  let c = 0;
  const rev = num.split("").reverse();
  for (let i = 0; i < rev.length; i++) {
    c = D[c][P[i % 8][Number(rev[i])]];
  }
  return c === 0;
}

/** Compute the Verhoeff check digit for a digit string (without check digit). */
export function verhoeffGenerate(num: string): number {
  let c = 0;
  const rev = num.split("").reverse();
  for (let i = 0; i < rev.length; i++) {
    c = D[c][P[(i + 1) % 8][Number(rev[i])]];
  }
  return INV[c];
}
