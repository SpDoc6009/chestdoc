type Matrix = boolean[][];

const DATA_CODEWORDS_L = [19, 34, 55, 80, 108] as const;
const EC_CODEWORDS_L = [7, 10, 15, 20, 26] as const;
const ALIGNMENT_CENTERS: Record<number, number[]> = {
  1: [],
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30]
};

let expTable: number[] | undefined;
let logTable: number[] | undefined;

function getGaloisTables() {
  if (expTable && logTable) return { expTable, logTable };

  expTable = new Array<number>(512);
  logTable = new Array<number>(256).fill(0);
  let value = 1;

  for (let i = 0; i < 255; i += 1) {
    expTable[i] = value;
    logTable[value] = i;
    value <<= 1;
    if (value & 0x100) value ^= 0x11d;
  }

  for (let i = 255; i < 512; i += 1) {
    expTable[i] = expTable[i - 255];
  }

  return { expTable, logTable };
}

function multiply(a: number, b: number) {
  if (a === 0 || b === 0) return 0;
  const tables = getGaloisTables();
  return tables.expTable[tables.logTable[a] + tables.logTable[b]];
}

function generatorPolynomial(degree: number) {
  const tables = getGaloisTables();
  let result = [1];

  for (let i = 0; i < degree; i += 1) {
    const next = new Array<number>(result.length + 1).fill(0);
    result.forEach((coefficient, index) => {
      next[index] ^= multiply(coefficient, 1);
      next[index + 1] ^= multiply(coefficient, tables.expTable[i]);
    });
    result = next;
  }

  return result;
}

function reedSolomonRemainder(data: number[], degree: number) {
  const generator = generatorPolynomial(degree);
  const result = new Array<number>(degree).fill(0);

  data.forEach((codeword) => {
    const factor = codeword ^ result.shift()!;
    result.push(0);

    for (let i = 0; i < degree; i += 1) {
      result[i] ^= multiply(generator[i + 1], factor);
    }
  });

  return result;
}

function appendBits(bits: boolean[], value: number, length: number) {
  for (let i = length - 1; i >= 0; i -= 1) {
    bits.push(((value >>> i) & 1) !== 0);
  }
}

function encodeData(text: string, version: number) {
  const bytes = Array.from(new TextEncoder().encode(text));
  const dataCodewords = DATA_CODEWORDS_L[version - 1];
  const capacityBits = dataCodewords * 8;
  const bits: boolean[] = [];

  appendBits(bits, 0b0100, 4);
  appendBits(bits, bytes.length, 8);
  bytes.forEach((byte) => appendBits(bits, byte, 8));

  const terminatorLength = Math.min(4, capacityBits - bits.length);
  appendBits(bits, 0, terminatorLength);

  while (bits.length % 8 !== 0) bits.push(false);

  const codewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let codeword = 0;
    for (let j = 0; j < 8; j += 1) {
      codeword = (codeword << 1) | (bits[i + j] ? 1 : 0);
    }
    codewords.push(codeword);
  }

  for (let pad = 0xec; codewords.length < dataCodewords; pad ^= 0xfd) {
    codewords.push(pad);
  }

  return codewords;
}

function findVersion(text: string) {
  const byteLength = new TextEncoder().encode(text).length;
  for (let version = 1; version <= DATA_CODEWORDS_L.length; version += 1) {
    const overheadBits = 4 + 8 + 4;
    if (byteLength * 8 + overheadBits <= DATA_CODEWORDS_L[version - 1] * 8) return version;
  }
  throw new Error("QR code content is too long for this generator.");
}

function createMatrix(size: number) {
  return {
    matrix: Array.from({ length: size }, () => new Array<boolean>(size).fill(false)),
    reserved: Array.from({ length: size }, () => new Array<boolean>(size).fill(false))
  };
}

function setFunctionModule(matrix: Matrix, reserved: Matrix, row: number, col: number, dark: boolean) {
  if (row < 0 || col < 0 || row >= matrix.length || col >= matrix.length) return;
  matrix[row][col] = dark;
  reserved[row][col] = true;
}

function drawFinder(matrix: Matrix, reserved: Matrix, row: number, col: number) {
  for (let dy = -1; dy <= 7; dy += 1) {
    for (let dx = -1; dx <= 7; dx += 1) {
      const currentRow = row + dy;
      const currentCol = col + dx;
      const inFinder = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6;
      const dark =
        inFinder &&
        (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4));
      setFunctionModule(matrix, reserved, currentRow, currentCol, dark);
    }
  }
}

function drawAlignment(matrix: Matrix, reserved: Matrix, centerRow: number, centerCol: number) {
  if (reserved[centerRow][centerCol]) return;

  for (let dy = -2; dy <= 2; dy += 1) {
    for (let dx = -2; dx <= 2; dx += 1) {
      const distance = Math.max(Math.abs(dx), Math.abs(dy));
      setFunctionModule(matrix, reserved, centerRow + dy, centerCol + dx, distance !== 1);
    }
  }
}

function drawFunctionPatterns(matrix: Matrix, reserved: Matrix, version: number) {
  const size = matrix.length;
  drawFinder(matrix, reserved, 0, 0);
  drawFinder(matrix, reserved, 0, size - 7);
  drawFinder(matrix, reserved, size - 7, 0);

  for (let i = 8; i < size - 8; i += 1) {
    setFunctionModule(matrix, reserved, 6, i, i % 2 === 0);
    setFunctionModule(matrix, reserved, i, 6, i % 2 === 0);
  }

  const centers = ALIGNMENT_CENTERS[version];
  centers.forEach((row) => {
    centers.forEach((col) => drawAlignment(matrix, reserved, row, col));
  });

  setFunctionModule(matrix, reserved, 4 * version + 9, 8, true);
  drawFormatBits(matrix, reserved);
}

function getFormatBits() {
  const data = 0b01 << 3; // Error correction L, mask 0.
  let remainder = data << 10;

  for (let i = 14; i >= 10; i -= 1) {
    if (((remainder >>> i) & 1) !== 0) {
      remainder ^= 0x537 << (i - 10);
    }
  }

  return ((data << 10) | remainder) ^ 0x5412;
}

function drawFormatBits(matrix: Matrix, reserved: Matrix) {
  const size = matrix.length;
  const bits = getFormatBits();
  const bit = (index: number) => ((bits >>> index) & 1) !== 0;

  for (let i = 0; i <= 5; i += 1) setFunctionModule(matrix, reserved, 8, i, bit(i));
  setFunctionModule(matrix, reserved, 8, 7, bit(6));
  setFunctionModule(matrix, reserved, 8, 8, bit(7));
  setFunctionModule(matrix, reserved, 7, 8, bit(8));
  for (let i = 9; i < 15; i += 1) setFunctionModule(matrix, reserved, 14 - i, 8, bit(i));

  for (let i = 0; i < 8; i += 1) setFunctionModule(matrix, reserved, size - 1 - i, 8, bit(i));
  for (let i = 8; i < 15; i += 1) setFunctionModule(matrix, reserved, 8, size - 15 + i, bit(i));
}

function placeData(matrix: Matrix, reserved: Matrix, dataBits: boolean[]) {
  const size = matrix.length;
  let bitIndex = 0;
  let upward = true;

  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right -= 1;

    for (let vertical = 0; vertical < size; vertical += 1) {
      const row = upward ? size - 1 - vertical : vertical;

      for (let offset = 0; offset < 2; offset += 1) {
        const col = right - offset;
        if (reserved[row][col]) continue;

        let dark = bitIndex < dataBits.length ? dataBits[bitIndex] : false;
        bitIndex += 1;

        if ((row + col) % 2 === 0) dark = !dark;
        matrix[row][col] = dark;
      }
    }

    upward = !upward;
  }
}

function toBits(codewords: number[]) {
  const bits: boolean[] = [];
  codewords.forEach((codeword) => appendBits(bits, codeword, 8));
  return bits;
}

function buildMatrix(text: string) {
  const version = findVersion(text);
  const size = version * 4 + 17;
  const { matrix, reserved } = createMatrix(size);
  const dataCodewords = encodeData(text, version);
  const ecCodewords = reedSolomonRemainder(dataCodewords, EC_CODEWORDS_L[version - 1]);

  drawFunctionPatterns(matrix, reserved, version);
  placeData(matrix, reserved, toBits([...dataCodewords, ...ecCodewords]));

  return matrix;
}

export function createQrSvg(text: string, options: { quietZone?: number; cellSize?: number } = {}) {
  const matrix = buildMatrix(text);
  const quietZone = options.quietZone ?? 4;
  const cellSize = options.cellSize ?? 1;
  const size = matrix.length;
  const dimension = (size + quietZone * 2) * cellSize;
  const modules: string[] = [];

  matrix.forEach((row, rowIndex) => {
    row.forEach((dark, colIndex) => {
      if (dark) {
        modules.push(
          `M${(colIndex + quietZone) * cellSize} ${(rowIndex + quietZone) * cellSize}h${cellSize}v${cellSize}h-${cellSize}z`
        );
      }
    });
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dimension} ${dimension}" role="img" aria-label="QR code" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="${modules.join(" ")}" fill="#0f172a"/></svg>`;
}
