window.__ModuleLoader__.load({ id: "codexhost-plugin-scoped-access", factory: (require) => {
var module = { exports: {} }; var exports = module.exports;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// plugins/web-scoped-access/src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(index_exports);
var import_react = require("react");
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");

// node_modules/uqr/dist/index.mjs
var QrCodeDataType = /* @__PURE__ */ ((QrCodeDataType2) => {
  QrCodeDataType2[QrCodeDataType2["Border"] = -1] = "Border";
  QrCodeDataType2[QrCodeDataType2["Data"] = 0] = "Data";
  QrCodeDataType2[QrCodeDataType2["Function"] = 1] = "Function";
  QrCodeDataType2[QrCodeDataType2["Position"] = 2] = "Position";
  QrCodeDataType2[QrCodeDataType2["Timing"] = 3] = "Timing";
  QrCodeDataType2[QrCodeDataType2["Alignment"] = 4] = "Alignment";
  return QrCodeDataType2;
})(QrCodeDataType || {});
var LOW = [0, 1];
var MEDIUM = [1, 0];
var QUARTILE = [2, 3];
var HIGH = [3, 2];
var EccMap = {
  L: LOW,
  M: MEDIUM,
  Q: QUARTILE,
  H: HIGH
};
var NUMERIC_REGEX = /^\d*$/;
var ALPHANUMERIC_REGEX = /^[A-Z0-9 $%*+./:-]*$/;
var ALPHANUMERIC_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
var MIN_VERSION = 1;
var MAX_VERSION = 40;
var PENALTY_N1 = 3;
var PENALTY_N2 = 3;
var PENALTY_N3 = 40;
var PENALTY_N4 = 10;
var ECC_CODEWORDS_PER_BLOCK = [
  // Version: (note that index 0 is for padding, and is set to an illegal value)
  // 0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40    Error correction level
  [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  // Low
  [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  // Medium
  [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  // Quartile
  [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]
  // High
];
var NUM_ERROR_CORRECTION_BLOCKS = [
  // Version: (note that index 0 is for padding, and is set to an illegal value)
  // 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40    Error correction level
  [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  // Low
  [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  // Medium
  [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  // Quartile
  [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81]
  // High
];
var QrCode = class {
  /* -- Constructor (low level) and fields -- */
  // Creates a new QR Code with the given version number,
  // error correction level, data codeword bytes, and mask number.
  // This is a low-level API that most users should not use directly.
  // A mid-level API is the encodeSegments() function.
  constructor(version, ecc, dataCodewords, msk) {
    this.version = version;
    this.ecc = ecc;
    if (version < MIN_VERSION || version > MAX_VERSION)
      throw new RangeError("Version value out of range");
    if (msk < -1 || msk > 7)
      throw new RangeError("Mask value out of range");
    this.size = version * 4 + 17;
    const row = Array.from({ length: this.size }).fill(false);
    for (let i = 0; i < this.size; i++) {
      this.modules.push(row.slice());
      this.types.push(row.map(() => 0));
    }
    this.drawFunctionPatterns();
    const allCodewords = this.addEccAndInterleave(dataCodewords);
    this.drawCodewords(allCodewords);
    if (msk === -1) {
      let minPenalty = 1e9;
      for (let i = 0; i < 8; i++) {
        this.applyMask(i);
        this.drawFormatBits(i);
        const penalty = this.getPenaltyScore();
        if (penalty < minPenalty) {
          msk = i;
          minPenalty = penalty;
        }
        this.applyMask(i);
      }
    }
    this.mask = msk;
    this.applyMask(msk);
    this.drawFormatBits(msk);
  }
  /* -- Fields -- */
  // The width and height of this QR Code, measured in modules, between
  // 21 and 177 (inclusive). This is equal to version * 4 + 17.
  size;
  // The index of the mask pattern used in this QR Code, which is between 0 and 7 (inclusive).
  // Even if a QR Code is created with automatic masking requested (mask = -1),
  // the resulting object still has a mask value between 0 and 7.
  mask;
  // The modules of this QR Code (false = light, true = dark).
  // Immutable after constructor finishes. Accessed through getModule().
  modules = [];
  types = [];
  /* -- Accessor methods -- */
  // Returns the color of the module (pixel) at the given coordinates, which is false
  // for light or true for dark. The top left corner has the coordinates (x=0, y=0).
  // If the given coordinates are out of bounds, then false (light) is returned.
  getModule(x, y) {
    return x >= 0 && x < this.size && y >= 0 && y < this.size && this.modules[y][x];
  }
  /* -- Private helper methods for constructor: Drawing function modules -- */
  // Reads this object's version field, and draws and marks all function modules.
  drawFunctionPatterns() {
    for (let i = 0; i < this.size; i++) {
      this.setFunctionModule(6, i, i % 2 === 0, QrCodeDataType.Timing);
      this.setFunctionModule(i, 6, i % 2 === 0, QrCodeDataType.Timing);
    }
    this.drawFinderPattern(3, 3);
    this.drawFinderPattern(this.size - 4, 3);
    this.drawFinderPattern(3, this.size - 4);
    const alignPatPos = this.getAlignmentPatternPositions();
    const numAlign = alignPatPos.length;
    for (let i = 0; i < numAlign; i++) {
      for (let j = 0; j < numAlign; j++) {
        if (!(i === 0 && j === 0 || i === 0 && j === numAlign - 1 || i === numAlign - 1 && j === 0))
          this.drawAlignmentPattern(alignPatPos[i], alignPatPos[j]);
      }
    }
    this.drawFormatBits(0);
    this.drawVersion();
  }
  // Draws two copies of the format bits (with its own error correction code)
  // based on the given mask and this object's error correction level field.
  drawFormatBits(mask) {
    const data = this.ecc[1] << 3 | mask;
    let rem = data;
    for (let i = 0; i < 10; i++)
      rem = rem << 1 ^ (rem >>> 9) * 1335;
    const bits = (data << 10 | rem) ^ 21522;
    for (let i = 0; i <= 5; i++)
      this.setFunctionModule(8, i, getBit(bits, i));
    this.setFunctionModule(8, 7, getBit(bits, 6));
    this.setFunctionModule(8, 8, getBit(bits, 7));
    this.setFunctionModule(7, 8, getBit(bits, 8));
    for (let i = 9; i < 15; i++)
      this.setFunctionModule(14 - i, 8, getBit(bits, i));
    for (let i = 0; i < 8; i++)
      this.setFunctionModule(this.size - 1 - i, 8, getBit(bits, i));
    for (let i = 8; i < 15; i++)
      this.setFunctionModule(8, this.size - 15 + i, getBit(bits, i));
    this.setFunctionModule(8, this.size - 8, true);
  }
  // Draws two copies of the version bits (with its own error correction code),
  // based on this object's version field, iff 7 <= version <= 40.
  drawVersion() {
    if (this.version < 7)
      return;
    let rem = this.version;
    for (let i = 0; i < 12; i++)
      rem = rem << 1 ^ (rem >>> 11) * 7973;
    const bits = this.version << 12 | rem;
    for (let i = 0; i < 18; i++) {
      const color = getBit(bits, i);
      const a = this.size - 11 + i % 3;
      const b = Math.floor(i / 3);
      this.setFunctionModule(a, b, color);
      this.setFunctionModule(b, a, color);
    }
  }
  // Draws a 9*9 finder pattern including the border separator,
  // with the center module at (x, y). Modules can be out of bounds.
  drawFinderPattern(x, y) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        const xx = x + dx;
        const yy = y + dy;
        if (xx >= 0 && xx < this.size && yy >= 0 && yy < this.size)
          this.setFunctionModule(xx, yy, dist !== 2 && dist !== 4, QrCodeDataType.Position);
      }
    }
  }
  // Draws a 5*5 alignment pattern, with the center module
  // at (x, y). All modules must be in bounds.
  drawAlignmentPattern(x, y) {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        this.setFunctionModule(
          x + dx,
          y + dy,
          Math.max(Math.abs(dx), Math.abs(dy)) !== 1,
          QrCodeDataType.Alignment
        );
      }
    }
  }
  // Sets the color of a module and marks it as a function module.
  // Only used by the constructor. Coordinates must be in bounds.
  setFunctionModule(x, y, isDark, type = QrCodeDataType.Function) {
    this.modules[y][x] = isDark;
    this.types[y][x] = type;
  }
  /* -- Private helper methods for constructor: Codewords and masking -- */
  // Returns a new byte string representing the given data with the appropriate error correction
  // codewords appended to it, based on this object's version and error correction level.
  addEccAndInterleave(data) {
    const ver = this.version;
    const ecl = this.ecc;
    if (data.length !== getNumDataCodewords(ver, ecl))
      throw new RangeError("Invalid argument");
    const numBlocks = NUM_ERROR_CORRECTION_BLOCKS[ecl[0]][ver];
    const blockEccLen = ECC_CODEWORDS_PER_BLOCK[ecl[0]][ver];
    const rawCodewords = Math.floor(getNumRawDataModules(ver) / 8);
    const numShortBlocks = numBlocks - rawCodewords % numBlocks;
    const shortBlockLen = Math.floor(rawCodewords / numBlocks);
    const blocks = [];
    const rsDiv = reedSolomonComputeDivisor(blockEccLen);
    for (let i = 0, k = 0; i < numBlocks; i++) {
      const dat = data.slice(k, k + shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1));
      k += dat.length;
      const ecc = reedSolomonComputeRemainder(dat, rsDiv);
      if (i < numShortBlocks)
        dat.push(0);
      blocks.push(dat.concat(ecc));
    }
    const result = [];
    for (let i = 0; i < blocks[0].length; i++) {
      blocks.forEach((block, j) => {
        if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks)
          result.push(block[i]);
      });
    }
    return result;
  }
  // Draws the given sequence of 8-bit codewords (data and error correction) onto the entire
  // data area of this QR Code. Function modules need to be marked off before this is called.
  drawCodewords(data) {
    if (data.length !== Math.floor(getNumRawDataModules(this.version) / 8))
      throw new RangeError("Invalid argument");
    let i = 0;
    for (let right = this.size - 1; right >= 1; right -= 2) {
      if (right === 6)
        right = 5;
      for (let vert = 0; vert < this.size; vert++) {
        for (let j = 0; j < 2; j++) {
          const x = right - j;
          const upward = (right + 1 & 2) === 0;
          const y = upward ? this.size - 1 - vert : vert;
          if (!this.types[y][x] && i < data.length * 8) {
            this.modules[y][x] = getBit(data[i >>> 3], 7 - (i & 7));
            i++;
          }
        }
      }
    }
  }
  // XORs the codeword modules in this QR Code with the given mask pattern.
  // The function modules must be marked and the codeword bits must be drawn
  // before masking. Due to the arithmetic of XOR, calling applyMask() with
  // the same mask value a second time will undo the mask. A final well-formed
  // QR Code needs exactly one (not zero, two, etc.) mask applied.
  applyMask(mask) {
    if (mask < 0 || mask > 7)
      throw new RangeError("Mask value out of range");
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        let invert;
        switch (mask) {
          case 0:
            invert = (x + y) % 2 === 0;
            break;
          case 1:
            invert = y % 2 === 0;
            break;
          case 2:
            invert = x % 3 === 0;
            break;
          case 3:
            invert = (x + y) % 3 === 0;
            break;
          case 4:
            invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
            break;
          case 5:
            invert = x * y % 2 + x * y % 3 === 0;
            break;
          case 6:
            invert = (x * y % 2 + x * y % 3) % 2 === 0;
            break;
          case 7:
            invert = ((x + y) % 2 + x * y % 3) % 2 === 0;
            break;
          default:
            throw new Error("Unreachable");
        }
        if (!this.types[y][x] && invert)
          this.modules[y][x] = !this.modules[y][x];
      }
    }
  }
  // Calculates and returns the penalty score based on state of this QR Code's current modules.
  // This is used by the automatic mask choice algorithm to find the mask pattern that yields the lowest score.
  getPenaltyScore() {
    let result = 0;
    for (let y = 0; y < this.size; y++) {
      let runColor = false;
      let runX = 0;
      const runHistory = [0, 0, 0, 0, 0, 0, 0];
      for (let x = 0; x < this.size; x++) {
        if (this.modules[y][x] === runColor) {
          runX++;
          if (runX === 5)
            result += PENALTY_N1;
          else if (runX > 5)
            result++;
        } else {
          this.finderPenaltyAddHistory(runX, runHistory);
          if (!runColor)
            result += this.finderPenaltyCountPatterns(runHistory) * PENALTY_N3;
          runColor = this.modules[y][x];
          runX = 1;
        }
      }
      result += this.finderPenaltyTerminateAndCount(runColor, runX, runHistory) * PENALTY_N3;
    }
    for (let x = 0; x < this.size; x++) {
      let runColor = false;
      let runY = 0;
      const runHistory = [0, 0, 0, 0, 0, 0, 0];
      for (let y = 0; y < this.size; y++) {
        if (this.modules[y][x] === runColor) {
          runY++;
          if (runY === 5)
            result += PENALTY_N1;
          else if (runY > 5)
            result++;
        } else {
          this.finderPenaltyAddHistory(runY, runHistory);
          if (!runColor)
            result += this.finderPenaltyCountPatterns(runHistory) * PENALTY_N3;
          runColor = this.modules[y][x];
          runY = 1;
        }
      }
      result += this.finderPenaltyTerminateAndCount(runColor, runY, runHistory) * PENALTY_N3;
    }
    for (let y = 0; y < this.size - 1; y++) {
      for (let x = 0; x < this.size - 1; x++) {
        const color = this.modules[y][x];
        if (color === this.modules[y][x + 1] && color === this.modules[y + 1][x] && color === this.modules[y + 1][x + 1]) {
          result += PENALTY_N2;
        }
      }
    }
    let dark = 0;
    for (const row of this.modules)
      dark = row.reduce((sum, color) => sum + (color ? 1 : 0), dark);
    const total = this.size * this.size;
    const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
    result += k * PENALTY_N4;
    return result;
  }
  /* -- Private helper functions -- */
  // Returns an ascending list of positions of alignment patterns for this version number.
  // Each position is in the range [0,177), and are used on both the x and y axes.
  // This could be implemented as lookup table of 40 variable-length lists of integers.
  getAlignmentPatternPositions() {
    if (this.version === 1) {
      return [];
    } else {
      const numAlign = Math.floor(this.version / 7) + 2;
      const step = this.version === 32 ? 26 : Math.ceil((this.version * 4 + 4) / (numAlign * 2 - 2)) * 2;
      const result = [6];
      for (let pos = this.size - 7; result.length < numAlign; pos -= step)
        result.splice(1, 0, pos);
      return result;
    }
  }
  // Can only be called immediately after a light run is added, and
  // returns either 0, 1, or 2. A helper function for getPenaltyScore().
  finderPenaltyCountPatterns(runHistory) {
    const n = runHistory[1];
    const core = n > 0 && runHistory[2] === n && runHistory[3] === n * 3 && runHistory[4] === n && runHistory[5] === n;
    return (core && runHistory[0] >= n * 4 && runHistory[6] >= n ? 1 : 0) + (core && runHistory[6] >= n * 4 && runHistory[0] >= n ? 1 : 0);
  }
  // Must be called at the end of a line (row or column) of modules. A helper function for getPenaltyScore().
  finderPenaltyTerminateAndCount(currentRunColor, currentRunLength, runHistory) {
    if (currentRunColor) {
      this.finderPenaltyAddHistory(currentRunLength, runHistory);
      currentRunLength = 0;
    }
    currentRunLength += this.size;
    this.finderPenaltyAddHistory(currentRunLength, runHistory);
    return this.finderPenaltyCountPatterns(runHistory);
  }
  // Pushes the given value to the front and drops the last value. A helper function for getPenaltyScore().
  finderPenaltyAddHistory(currentRunLength, runHistory) {
    if (runHistory[0] === 0)
      currentRunLength += this.size;
    runHistory.pop();
    runHistory.unshift(currentRunLength);
  }
};
function appendBits(val, len, bb) {
  if (len < 0 || len > 31 || val >>> len !== 0)
    throw new RangeError("Value out of range");
  for (let i = len - 1; i >= 0; i--)
    bb.push(val >>> i & 1);
}
function getBit(x, i) {
  return (x >>> i & 1) !== 0;
}
var QrSegment = class {
  // Creates a new QR Code segment with the given attributes and data.
  // The character count (numChars) must agree with the mode and the bit buffer length,
  // but the constraint isn't checked. The given bit buffer is cloned and stored.
  constructor(mode, numChars, bitData) {
    this.mode = mode;
    this.numChars = numChars;
    this.bitData = bitData;
    if (numChars < 0)
      throw new RangeError("Invalid argument");
    this.bitData = bitData.slice();
  }
  /* -- Methods -- */
  // Returns a new copy of the data bits of this segment.
  getData() {
    return this.bitData.slice();
  }
};
var MODE_NUMERIC = [1, 10, 12, 14];
var MODE_ALPHANUMERIC = [2, 9, 11, 13];
var MODE_BYTE = [4, 8, 16, 16];
function numCharCountBits(mode, ver) {
  return mode[Math.floor((ver + 7) / 17) + 1];
}
function makeBytes(data) {
  const bb = [];
  for (const b of data)
    appendBits(b, 8, bb);
  return new QrSegment(MODE_BYTE, data.length, bb);
}
function makeNumeric(digits) {
  if (!isNumeric(digits))
    throw new RangeError("String contains non-numeric characters");
  const bb = [];
  for (let i = 0; i < digits.length; ) {
    const n = Math.min(digits.length - i, 3);
    appendBits(Number.parseInt(digits.substring(i, i + n), 10), n * 3 + 1, bb);
    i += n;
  }
  return new QrSegment(MODE_NUMERIC, digits.length, bb);
}
function makeAlphanumeric(text) {
  if (!isAlphanumeric(text))
    throw new RangeError("String contains unencodable characters in alphanumeric mode");
  const bb = [];
  let i;
  for (i = 0; i + 2 <= text.length; i += 2) {
    let temp = ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)) * 45;
    temp += ALPHANUMERIC_CHARSET.indexOf(text.charAt(i + 1));
    appendBits(temp, 11, bb);
  }
  if (i < text.length)
    appendBits(ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)), 6, bb);
  return new QrSegment(MODE_ALPHANUMERIC, text.length, bb);
}
function makeSegments(text) {
  if (text === "")
    return [];
  else if (isNumeric(text))
    return [makeNumeric(text)];
  else if (isAlphanumeric(text))
    return [makeAlphanumeric(text)];
  else
    return [makeBytes(toUtf8ByteArray(text))];
}
function isNumeric(text) {
  return NUMERIC_REGEX.test(text);
}
function isAlphanumeric(text) {
  return ALPHANUMERIC_REGEX.test(text);
}
function getTotalBits(segs, version) {
  let result = 0;
  for (const seg of segs) {
    const ccbits = numCharCountBits(seg.mode, version);
    if (seg.numChars >= 1 << ccbits)
      return Number.POSITIVE_INFINITY;
    result += 4 + ccbits + seg.bitData.length;
  }
  return result;
}
function toUtf8ByteArray(str) {
  str = encodeURI(str);
  const result = [];
  for (let i = 0; i < str.length; i++) {
    if (str.charAt(i) !== "%") {
      result.push(str.charCodeAt(i));
    } else {
      result.push(Number.parseInt(str.substring(i + 1, i + 3), 16));
      i += 2;
    }
  }
  return result;
}
function getNumRawDataModules(ver) {
  if (ver < MIN_VERSION || ver > MAX_VERSION)
    throw new RangeError("Version number out of range");
  let result = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const numAlign = Math.floor(ver / 7) + 2;
    result -= (25 * numAlign - 10) * numAlign - 55;
    if (ver >= 7)
      result -= 36;
  }
  return result;
}
function getNumDataCodewords(ver, ecl) {
  return Math.floor(getNumRawDataModules(ver) / 8) - ECC_CODEWORDS_PER_BLOCK[ecl[0]][ver] * NUM_ERROR_CORRECTION_BLOCKS[ecl[0]][ver];
}
function reedSolomonComputeDivisor(degree) {
  if (degree < 1 || degree > 255)
    throw new RangeError("Degree out of range");
  const result = [];
  for (let i = 0; i < degree - 1; i++)
    result.push(0);
  result.push(1);
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = reedSolomonMultiply(result[j], root);
      if (j + 1 < result.length)
        result[j] ^= result[j + 1];
    }
    root = reedSolomonMultiply(root, 2);
  }
  return result;
}
function reedSolomonComputeRemainder(data, divisor) {
  const result = divisor.map((_) => 0);
  for (const b of data) {
    const factor = b ^ result.shift();
    result.push(0);
    divisor.forEach((coef, i) => result[i] ^= reedSolomonMultiply(coef, factor));
  }
  return result;
}
function reedSolomonMultiply(x, y) {
  if (x >>> 8 !== 0 || y >>> 8 !== 0)
    throw new RangeError("Byte out of range");
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = z << 1 ^ (z >>> 7) * 285;
    z ^= (y >>> i & 1) * x;
  }
  return z;
}
function encodeSegments(segs, ecl, minVersion = 1, maxVersion = 40, mask = -1, boostEcl = true) {
  if (!(MIN_VERSION <= minVersion && minVersion <= maxVersion && maxVersion <= MAX_VERSION) || mask < -1 || mask > 7) {
    throw new RangeError("Invalid value");
  }
  let version;
  let dataUsedBits;
  for (version = minVersion; ; version++) {
    const dataCapacityBits2 = getNumDataCodewords(version, ecl) * 8;
    const usedBits = getTotalBits(segs, version);
    if (usedBits <= dataCapacityBits2) {
      dataUsedBits = usedBits;
      break;
    }
    if (version >= maxVersion)
      throw new RangeError("Data too long");
  }
  for (const newEcl of [MEDIUM, QUARTILE, HIGH]) {
    if (boostEcl && dataUsedBits <= getNumDataCodewords(version, newEcl) * 8)
      ecl = newEcl;
  }
  const bb = [];
  for (const seg of segs) {
    appendBits(seg.mode[0], 4, bb);
    appendBits(seg.numChars, numCharCountBits(seg.mode, version), bb);
    for (const b of seg.getData())
      bb.push(b);
  }
  const dataCapacityBits = getNumDataCodewords(version, ecl) * 8;
  appendBits(0, Math.min(4, dataCapacityBits - bb.length), bb);
  appendBits(0, (8 - bb.length % 8) % 8, bb);
  for (let padByte = 236; bb.length < dataCapacityBits; padByte ^= 236 ^ 17)
    appendBits(padByte, 8, bb);
  const dataCodewords = Array.from({ length: Math.ceil(bb.length / 8) }, () => 0);
  bb.forEach((b, i) => dataCodewords[i >>> 3] |= b << 7 - (i & 7));
  return new QrCode(version, ecl, dataCodewords, mask);
}
function encode(data, options) {
  const {
    ecc = "L",
    boostEcc = false,
    minVersion = 1,
    maxVersion = 40,
    maskPattern = -1,
    border = 1
  } = options || {};
  const segment = typeof data === "string" ? makeSegments(data) : Array.isArray(data) ? [makeBytes(data)] : void 0;
  if (!segment)
    throw new Error(`uqr only supports encoding string and binary data, but got: ${typeof data}`);
  const qr = encodeSegments(
    segment,
    EccMap[ecc],
    minVersion,
    maxVersion,
    maskPattern,
    boostEcc
  );
  const result = addBorder({
    version: qr.version,
    maskPattern: qr.mask,
    size: qr.size,
    data: qr.modules,
    types: qr.types
  }, border);
  if (options?.invert)
    result.data = result.data.map((row) => row.map((mod) => !mod));
  options?.onEncoded?.(result);
  return result;
}
function addBorder(input, border = 1) {
  if (!border)
    return input;
  const { size } = input;
  const newSize = size + border * 2;
  input.size = newSize;
  input.data.forEach((row) => {
    for (let i = 0; i < border; i++) {
      row.unshift(false);
      row.push(false);
    }
  });
  for (let i = 0; i < border; i++) {
    input.data.unshift(Array.from({ length: newSize }, (_) => false));
    input.data.push(Array.from({ length: newSize }, (_) => false));
  }
  const b = QrCodeDataType.Border;
  input.types.forEach((row) => {
    for (let i = 0; i < border; i++) {
      row.unshift(b);
      row.push(b);
    }
  });
  for (let i = 0; i < border; i++) {
    input.types.unshift(Array.from({ length: newSize }, (_) => b));
    input.types.push(Array.from({ length: newSize }, (_) => b));
  }
  return input;
}

// plugins/web-scoped-access/src/client/index.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var name = "codexhost-plugin-scoped-access";
var inject = ["slots", "locale"];
var NS = "codexhostScopedAccess";
var ROUTE_BASE = "/codexhost-scoped-access";
var STYLE_ID = "codexhost-plugin-scoped-access-styles";
var EN = {
  "section.title": "Scoped access",
  "page.title": "Scoped remote access keys",
  "page.subtitle": "Issue secondary remote access keys limited to chosen projects and specific models. Scoped keys cannot access unauthorized projects, models, terminal, extensions, or device management.",
  "page.create": "New scoped key",
  "page.refresh": "Refresh",
  "page.loading": "Loading scoped access keys\u2026",
  "page.authDisabled": "Authentication must be enabled to manage scoped access keys.",
  "page.forbidden": "Only the primary key or local computer can manage scoped access keys.",
  "page.empty": "No scoped access keys yet. Create one to grant limited project and model access.",
  "page.configPath": "Config file: {path}",
  "key.enabled": "Active",
  "key.disabled": "Disabled",
  "key.summary": "{projects} project(s) \xB7 {models} model(s)",
  "key.filesOn": "Files: Allowed",
  "key.filesOff": "Files: Off",
  "key.terminalOn": "Terminal: Allowed",
  "key.terminalOff": "Terminal: Off",
  "key.neverUsed": "Never used",
  "key.lastUsed": "Last used {time}",
  "key.connect": "Connect / QR",
  "key.edit": "Edit",
  "key.rotate": "Rotate",
  "key.delete": "Delete",
  "editor.createTitle": "Create scoped access key",
  "editor.editTitle": "Edit scoped access key",
  "editor.nameLabel": "Key name",
  "editor.namePlaceholder": "e.g. Frontend review phone / Guest",
  "editor.projectsTitle": "Permitted projects",
  "editor.projectsHint": "This key can only list, open, create, and read files inside the selected project directories.",
  "editor.projectsEmpty": "No local projects discovered yet. Add an absolute directory path below.",
  "editor.customPathPlaceholder": "Add absolute project directory path\u2026",
  "editor.addPath": "Add path",
  "editor.modelsTitle": "Permitted models",
  "editor.modelsHint": "This key can only see and run the exact models selected below.",
  "editor.modelsEmpty": "No ready Harnesses or models detected right now.",
  "editor.selectAll": "Select all",
  "editor.clearAll": "Clear",
  "editor.capabilitiesTitle": "Additional capabilities",
  "editor.allowFiles": "Allow browsing and downloading files within permitted projects",
  "editor.allowTerminal": "Allow right-sidebar terminal (caution: host shell can reach paths outside the project)",
  "editor.save": "Save",
  "editor.create": "Create key",
  "editor.cancel": "Cancel",
  "editor.close": "Close",
  "editor.validationName": "Enter a name for this key.",
  "editor.validationProjects": "Select or add at least one project directory.",
  "editor.validationModels": "Select at least one permitted model.",
  "connect.title": "Connect with scoped key",
  "connect.description": "Scan the QR code or open the link on another device. It signs in only with this key's restricted permissions.",
  "connect.address": "Access address",
  "connect.revealQr": "Click to reveal QR code",
  "connect.hideQr": "Hide QR code",
  "connect.qrWarning": "Contains a scoped access key. Share only with intended devices.",
  "connect.copyLink": "Copy login link",
  "connect.copyKey": "Copy key",
  "connect.copied": "Copied",
  "connect.copyFailed": "Copy failed",
  "confirm.rotateTitle": "Regenerate this scoped key?",
  "confirm.rotateBody": "Devices using the old key will be disconnected immediately and must sign in with the new key.",
  "confirm.rotateAction": "Regenerate",
  "confirm.deleteTitle": "Delete this scoped key?",
  "confirm.deleteBody": 'Devices signed in with "{name}" will lose access immediately. Existing conversations are not deleted.',
  "confirm.deleteAction": "Delete"
};
var ZH = {
  "section.title": "\u6B21\u7EA7\u8BBF\u95EE\u6743\u9650",
  "page.title": "\u6B21\u7EA7\u8FDC\u7A0B\u8BBF\u95EE\u5BC6\u94A5",
  "page.subtitle": "\u4E3A\u4E0D\u540C\u8BBE\u5907\u6216\u534F\u4F5C\u8005\u7B7E\u53D1\u53D7\u9650\u5BC6\u94A5\uFF1A\u4EC5\u80FD\u8BBF\u95EE\u6388\u6743\u9879\u76EE\u76EE\u5F55\uFF0C\u4E14\u53EA\u80FD\u4F7F\u7528\u6307\u5B9A\u7684\u6A21\u578B\uFF1B\u81EA\u52A8\u7981\u7528\u672A\u6388\u6743\u9879\u76EE\u3001\u7EC8\u7AEF\u3001\u754C\u9762\u6269\u5C55\u53CA\u5168\u5C40\u8BBE\u5907\u7BA1\u7406\u3002",
  "page.create": "\u65B0\u5EFA\u6B21\u7EA7\u5BC6\u94A5",
  "page.refresh": "\u5237\u65B0",
  "page.loading": "\u6B63\u5728\u52A0\u8F7D\u6B21\u7EA7\u8BBF\u95EE\u5BC6\u94A5\u2026",
  "page.authDisabled": "\u672A\u542F\u7528\u8BBF\u95EE\u8BA4\u8BC1\u65F6\u65E0\u6CD5\u7BA1\u7406\u6B21\u7EA7\u8BBF\u95EE\u5BC6\u94A5\u3002",
  "page.forbidden": "\u4EC5\u672C\u673A\u6216\u4E3B\u8BBF\u95EE\u5BC6\u94A5\u53EF\u4EE5\u7BA1\u7406\u6B21\u7EA7\u8BBF\u95EE\u5BC6\u94A5\u3002",
  "page.empty": "\u8FD8\u6CA1\u6709\u6B21\u7EA7\u8BBF\u95EE\u5BC6\u94A5\u3002\u70B9\u51FB\u53F3\u4E0A\u89D2\u65B0\u5EFA\u4E00\u4E2A\uFF0C\u6309\u9879\u76EE\u548C\u6A21\u578B\u5206\u914D\u72EC\u7ACB\u6743\u9650\u3002",
  "page.configPath": "\u914D\u7F6E\u6587\u4EF6\uFF1A{path}",
  "key.enabled": "\u5DF2\u542F\u7528",
  "key.disabled": "\u5DF2\u505C\u7528",
  "key.summary": "{projects} \u4E2A\u9879\u76EE \xB7 {models} \u4E2A\u6A21\u578B",
  "key.filesOn": "\u9879\u76EE\u6587\u4EF6\uFF1A\u5141\u8BB8",
  "key.filesOff": "\u9879\u76EE\u6587\u4EF6\uFF1A\u7981\u6B62",
  "key.terminalOn": "\u7EC8\u7AEF\uFF1A\u5141\u8BB8",
  "key.terminalOff": "\u7EC8\u7AEF\uFF1A\u7981\u6B62",
  "key.neverUsed": "\u5C1A\u672A\u767B\u5F55\u4F7F\u7528",
  "key.lastUsed": "\u6700\u8FD1\u4F7F\u7528\uFF1A{time}",
  "key.connect": "\u626B\u7801 / \u94FE\u63A5",
  "key.edit": "\u7F16\u8F91\u6743\u9650",
  "key.rotate": "\u91CD\u7F6E\u5BC6\u94A5",
  "key.delete": "\u5220\u9664",
  "editor.createTitle": "\u65B0\u5EFA\u6B21\u7EA7\u8BBF\u95EE\u5BC6\u94A5",
  "editor.editTitle": "\u7F16\u8F91\u6B21\u7EA7\u8BBF\u95EE\u5BC6\u94A5",
  "editor.nameLabel": "\u5BC6\u94A5\u540D\u79F0",
  "editor.namePlaceholder": "\u4F8B\u5982\uFF1A\u6D4B\u8BD5\u624B\u673A / \u4EC5\u524D\u7AEF\u9879\u76EE",
  "editor.projectsTitle": "\u5141\u8BB8\u8BBF\u95EE\u7684\u9879\u76EE",
  "editor.projectsHint": "\u6301\u6709\u8BE5\u5BC6\u94A5\u7684\u8FDC\u7A0B\u8FDE\u63A5\u53EA\u80FD\u770B\u5230\u5E76\u64CD\u4F5C\u4E0B\u65B9\u52FE\u9009\u7684\u9879\u76EE\u53CA\u5176\u4F1A\u8BDD\u4E0E\u6587\u4EF6\u3002",
  "editor.projectsEmpty": "\u6682\u672A\u53D1\u73B0\u672C\u5730\u9879\u76EE\uFF0C\u53EF\u5728\u4E0B\u65B9\u624B\u52A8\u6DFB\u52A0\u9879\u76EE\u7EDD\u5BF9\u8DEF\u5F84\u3002",
  "editor.customPathPlaceholder": "\u8F93\u5165\u9879\u76EE\u76EE\u5F55\u7EDD\u5BF9\u8DEF\u5F84\uFF0C\u4F8B\u5982 D:\\WorkSpace\\my-app \u6216 /Users/me/app",
  "editor.addPath": "\u6DFB\u52A0\u8DEF\u5F84",
  "editor.modelsTitle": "\u5141\u8BB8\u4F7F\u7528\u7684\u6A21\u578B",
  "editor.modelsHint": "\u6301\u6709\u8BE5\u5BC6\u94A5\u7684\u8FDC\u7A0B\u8FDE\u63A5\u53EA\u80FD\u770B\u5230\u5E76\u8C03\u7528\u4E0B\u65B9\u52FE\u9009\u7684\u6A21\u578B\u3002",
  "editor.modelsEmpty": "\u5F53\u524D\u6CA1\u6709\u68C0\u6D4B\u5230\u5C31\u7EEA\u7684 Harness \u6216\u6A21\u578B\u76EE\u5F55\u3002",
  "editor.selectAll": "\u5168\u9009",
  "editor.clearAll": "\u6E05\u7A7A",
  "editor.capabilitiesTitle": "\u9644\u52A0\u6743\u9650",
  "editor.allowFiles": "\u5141\u8BB8\u67E5\u770B\u3001\u9884\u89C8\u548C\u4E0B\u8F7D\u6388\u6743\u9879\u76EE\u5185\u7684\u6587\u4EF6\uFF08\u53F3\u4FA7\u680F\u6587\u4EF6\u6811\u4E0E\u9644\u4EF6\uFF09",
  "editor.allowTerminal": "\u5141\u8BB8\u6253\u5F00\u53F3\u4FA7\u680F\u7EC8\u7AEF\uFF08\u8C28\u614E\uFF1A\u7EC8\u7AEF\u5177\u5907\u5BBF\u4E3B\u673A Shell \u6743\u9650\uFF0C\u53EF\u8D8A\u51FA\u9879\u76EE\u76EE\u5F55\uFF09",
  "editor.save": "\u4FDD\u5B58\u4FEE\u6539",
  "editor.create": "\u521B\u5EFA\u5BC6\u94A5",
  "editor.cancel": "\u53D6\u6D88",
  "editor.close": "\u5173\u95ED",
  "editor.validationName": "\u8BF7\u586B\u5199\u5BC6\u94A5\u540D\u79F0\u3002",
  "editor.validationProjects": "\u8BF7\u81F3\u5C11\u52FE\u9009\u6216\u6DFB\u52A0\u4E00\u4E2A\u5141\u8BB8\u8BBF\u95EE\u7684\u9879\u76EE\u76EE\u5F55\u3002",
  "editor.validationModels": "\u8BF7\u81F3\u5C11\u52FE\u9009\u4E00\u4E2A\u5141\u8BB8\u4F7F\u7528\u7684\u6A21\u578B\u3002",
  "connect.title": "\u4F7F\u7528\u6B21\u7EA7\u5BC6\u94A5\u8FDE\u63A5",
  "connect.description": "\u7528\u624B\u673A\u626B\u7801\u6216\u590D\u5236\u767B\u5F55\u94FE\u63A5\u6253\u5F00\uFF0C\u5C06\u4EC5\u4EE5\u8BE5\u5BC6\u94A5\u7684\u53D7\u9650\u6743\u9650\u767B\u5F55\u3002",
  "connect.address": "\u8BBF\u95EE\u5730\u5740",
  "connect.revealQr": "\u70B9\u51FB\u67E5\u770B\u4E8C\u7EF4\u7801",
  "connect.hideQr": "\u9690\u85CF\u4E8C\u7EF4\u7801",
  "connect.qrWarning": "\u5305\u542B\u6B21\u7EA7\u8BBF\u95EE\u5BC6\u94A5\uFF0C\u8BF7\u4EC5\u5206\u4EAB\u7ED9\u6388\u6743\u8BBE\u5907\u3002",
  "connect.copyLink": "\u590D\u5236\u767B\u5F55\u94FE\u63A5",
  "connect.copyKey": "\u590D\u5236\u5BC6\u94A5",
  "connect.copied": "\u5DF2\u590D\u5236",
  "connect.copyFailed": "\u590D\u5236\u5931\u8D25",
  "confirm.rotateTitle": "\u91CD\u65B0\u751F\u6210\u8BE5\u6B21\u7EA7\u5BC6\u94A5\uFF1F",
  "confirm.rotateBody": "\u6B63\u5728\u4F7F\u7528\u65E7\u5BC6\u94A5\u7684\u8BBE\u5907\u4F1A\u7ACB\u5373\u65AD\u5F00\uFF0C\u9700\u8981\u91CD\u65B0\u626B\u7801\u6216\u8F93\u5165\u65B0\u5BC6\u94A5\u3002",
  "confirm.rotateAction": "\u91CD\u65B0\u751F\u6210",
  "confirm.deleteTitle": "\u5220\u9664\u8BE5\u6B21\u7EA7\u5BC6\u94A5\uFF1F",
  "confirm.deleteBody": "\u4F7F\u7528\u201C{name}\u201D\u767B\u5F55\u7684\u8BBE\u5907\u4F1A\u7ACB\u5373\u5931\u6548\uFF0C\u4E0D\u4F1A\u5220\u9664\u5DF2\u6709\u5BF9\u8BDD\u8BB0\u5F55\u3002",
  "confirm.deleteAction": "\u5220\u9664"
};
var CSS = `
.csa-page { display: flex; flex-direction: column; gap: 20px; min-width: 0; }
.csa-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.csa-title { margin: 0 0 6px; color: var(--dsw-alias-label-primary, inherit); font-size: 20px; line-height: 28px; font-weight: 600; }
.csa-subtitle { margin: 0; color: var(--dsw-alias-label-secondary, #6b7280); font-size: 13px; line-height: 20px; max-width: 640px; }
.csa-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.csa-error { margin: 0; padding: 10px 12px; border-radius: 8px; font-size: 13px; color: #ef4444; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); }
.csa-notice { margin: 0; padding: 12px 14px; border-radius: 10px; font-size: 13px; color: var(--dsw-alias-label-secondary, #6b7280); border: 1px solid var(--dsw-alias-border-l2, rgba(128,128,128,0.22)); background: var(--dsw-alias-bg-layer-2, transparent); }
.csa-list { display: flex; flex-direction: column; gap: 12px; }
.csa-card { display: flex; flex-direction: column; gap: 12px; padding: 16px; border-radius: 12px; border: 1px solid var(--dsw-alias-border-l2, rgba(128,128,128,0.22)); background: var(--dsw-alias-bg-layer-2, transparent); }
.csa-card-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.csa-card-name { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 600; color: var(--dsw-alias-label-primary, inherit); }
.csa-badge { font-size: 11px; padding: 2px 8px; border-radius: 999px; font-weight: 500; border: 1px solid var(--dsw-alias-border-l2, rgba(128,128,128,0.25)); color: var(--dsw-alias-label-secondary, #6b7280); }
.csa-badge[data-active="true"] { color: #16a34a; border-color: rgba(22, 163, 74, 0.35); background: rgba(22, 163, 74, 0.08); }
.csa-pills { display: flex; flex-wrap: wrap; gap: 6px; }
.csa-pill { font-size: 12px; padding: 2px 8px; border-radius: 6px; background: rgba(128, 128, 128, 0.1); color: var(--dsw-alias-label-secondary, #6b7280); }
.csa-path-list { display: flex; flex-direction: column; gap: 4px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; color: var(--dsw-alias-label-secondary, #6b7280); overflow-wrap: anywhere; }
.csa-meta { margin: 0; font-size: 12px; color: var(--dsw-alias-label-tertiary, #9ca3af); overflow-wrap: anywhere; }
.csa-form { display: flex; flex-direction: column; gap: 16px; max-height: 68vh; overflow-y: auto; padding-right: 4px; }
.csa-field { display: flex; flex-direction: column; gap: 6px; }
.csa-label { font-size: 13px; font-weight: 600; color: var(--dsw-alias-label-primary, inherit); }
.csa-input, .csa-select { width: 100%; box-sizing: border-box; padding: 8px 10px; border-radius: 8px; font-size: 13px; color: var(--dsw-alias-label-primary, inherit); background: var(--dsw-alias-bg-layer-1, transparent); border: 1px solid var(--dsw-alias-border-l2, rgba(128,128,128,0.3)); }
.csa-row { display: flex; gap: 8px; align-items: center; }
.csa-checklist { display: flex; flex-direction: column; gap: 6px; max-height: 180px; overflow-y: auto; padding: 8px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l2, rgba(128,128,128,0.22)); }
.csa-check { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; cursor: pointer; color: var(--dsw-alias-label-primary, inherit); }
.csa-check input { margin-top: 3px; flex: none; }
.csa-check-sub { display: block; font-size: 11px; color: var(--dsw-alias-label-tertiary, #9ca3af); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; overflow-wrap: anywhere; }
.csa-group { display: flex; flex-direction: column; gap: 6px; padding: 10px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l2, rgba(128,128,128,0.22)); }
.csa-group-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 13px; font-weight: 600; color: var(--dsw-alias-label-primary, inherit); }
.csa-link-btn { background: none; border: none; padding: 0; font-size: 12px; color: #3b82f6; cursor: pointer; }
.csa-link-btn:hover { text-decoration: underline; }
.csa-chip-row { display: flex; flex-wrap: wrap; gap: 6px; }
.csa-chip { display: inline-flex; align-items: center; gap: 6px; padding: 3px 8px; border-radius: 6px; font-size: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background: rgba(59, 130, 246, 0.1); color: var(--dsw-alias-label-primary, inherit); }
.csa-chip button { border: none; background: transparent; color: inherit; cursor: pointer; padding: 0 2px; font-size: 13px; }
.csa-qr-box { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 16px; border-radius: 12px; border: 1px solid var(--dsw-alias-border-l2, rgba(128,128,128,0.22)); }
.csa-qr-wrap { position: relative; width: 196px; height: 196px; border-radius: 10px; overflow: hidden; cursor: pointer; border: 1px solid var(--dsw-alias-border-l2, rgba(128,128,128,0.25)); }
.csa-qr-svg { width: 100%; height: 100%; display: block; transition: filter 0.15s ease; }
.csa-qr-svg[data-blurred="true"] { filter: blur(8px); }
.csa-qr-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, 0.35); color: #fff; font-size: 13px; font-weight: 600; text-align: center; padding: 12px; }
.csa-code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; padding: 8px 10px; border-radius: 8px; background: rgba(128, 128, 128, 0.1); word-break: break-all; color: var(--dsw-alias-label-primary, inherit); }
`;
var ScopedAccessError = class extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
  code;
};
async function apiRequest(path, init) {
  const response = await fetch(`${ROUTE_BASE}${path}`, {
    credentials: "same-origin",
    cache: "no-store",
    ...init,
    headers: {
      ...init?.body !== void 0 ? { "content-type": "application/json" } : {},
      ...init?.headers
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ScopedAccessError(
      payload.error?.message ?? `HTTP ${String(response.status)}`,
      payload.error?.code ?? `http/${String(response.status)}`
    );
  }
  return payload;
}
async function copyToClipboard(text) {
  if (typeof navigator !== "undefined" && navigator.clipboard !== void 0) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (error) {
      if (typeof window !== "undefined" && window.isSecureContext) throw error;
    }
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  try {
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    if (!document.execCommand("copy")) throw new Error("Copy failed");
  } finally {
    textarea.remove();
  }
}
function modelKey(provider, model) {
  return `${provider}\0${model}`;
}
function flattenGroupModels(group) {
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  const push = (model, label) => {
    if (seen.has(model)) return;
    seen.add(model);
    out.push({ provider: group.id, model, label });
  };
  for (const item of group.models) {
    push(item.id, item.description ? `${item.name} (${item.description})` : item.name);
    if (item.fastModel) push(item.fastModel, `${item.name} \xB7 Fast`);
    if (item.ultrafastModel) push(item.ultrafastModel, `${item.name} \xB7 Ultrafast`);
  }
  return out;
}
function QrSvg({ value, blurred }) {
  const { size, path } = (0, import_react.useMemo)(() => {
    const code = encode(value, { ecc: "M", border: 2 });
    let modules = "";
    code.data.forEach((row, y) => {
      row.forEach((dark, x) => {
        if (dark) modules += `M${String(x)} ${String(y)}h1v1h-1z`;
      });
    });
    return { size: code.size, path: modules };
  }, [value]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "svg",
    {
      role: "img",
      "aria-label": "QR",
      className: "csa-qr-svg",
      "data-blurred": blurred,
      viewBox: `0 0 ${String(size)} ${String(size)}`,
      shapeRendering: "crispEdges",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { width: size, height: size, fill: "#fff" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: path, fill: "#000" })
      ]
    }
  );
}
function ConnectModal({
  item,
  networkUrls,
  onClose,
  t
}) {
  const options = (0, import_react.useMemo)(() => {
    const urls = networkUrls.map((entry) => ({
      label: `${entry.kind.toUpperCase()} \xB7 ${entry.url}`,
      url: entry.url.replace(/\/+$/u, "")
    }));
    const currentOrigin = typeof window !== "undefined" ? window.location.origin.replace(/\/+$/u, "") : "";
    if (currentOrigin && !urls.some((entry) => entry.url === currentOrigin)) {
      urls.push({ label: currentOrigin, url: currentOrigin });
    }
    return urls;
  }, [networkUrls]);
  const [selectedUrl, setSelectedUrl] = (0, import_react.useState)(options[0]?.url ?? "");
  const [revealed, setRevealed] = (0, import_react.useState)(false);
  const [copied, setCopied] = (0, import_react.useState)(null);
  const [copyError, setCopyError] = (0, import_react.useState)(null);
  const loginUrl = `${selectedUrl || window.location.origin}/#token=${encodeURIComponent(item.secret)}`;
  const copy = (kind, value) => {
    setCopyError(null);
    void copyToClipboard(value).then(
      () => {
        setCopied(kind);
        setTimeout(() => setCopied((prev) => prev === kind ? null : prev), 2e3);
      },
      () => setCopyError(t("connect.copyFailed"))
    );
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_dsh_client_ui_primitives.Modal,
    {
      open: true,
      onClose,
      title: `${t("connect.title")} \xB7 ${item.name}`,
      closeLabel: t("editor.close"),
      description: t("connect.description"),
      footer: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { variant: "outline", onClick: onClose, children: t("editor.close") }),
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "csa-form", children: [
        options.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "csa-field", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "csa-label", children: t("connect.address") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "select",
            {
              className: "csa-select",
              value: selectedUrl,
              onChange: (event) => setSelectedUrl(event.target.value),
              children: options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: option.url, children: option.label }, option.url))
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "csa-qr-box", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "div",
            {
              className: "csa-qr-wrap",
              role: "button",
              tabIndex: 0,
              onClick: () => setRevealed((prev) => !prev),
              onKeyDown: (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setRevealed((prev) => !prev);
                }
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrSvg, { value: loginUrl, blurred: !revealed }),
                !revealed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "csa-qr-overlay", children: t("connect.revealQr") })
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "csa-meta", children: t("connect.qrWarning") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "csa-actions", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { variant: "outline", onClick: () => setRevealed((prev) => !prev), children: t(revealed ? "connect.hideQr" : "connect.revealQr") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { variant: "primary", onClick: () => copy("link", loginUrl), children: t(copied === "link" ? "connect.copied" : "connect.copyLink") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { variant: "outline", onClick: () => copy("key", item.secret), children: t(copied === "key" ? "connect.copied" : "connect.copyKey") })
          ] })
        ] }),
        revealed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "csa-code", children: item.secret }),
        copyError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "csa-error", children: copyError })
      ] })
    }
  );
}
function KeyEditorModal({
  initial,
  state,
  busy,
  onClose,
  onSubmit,
  t
}) {
  const [keyName, setKeyName] = (0, import_react.useState)(initial?.name ?? "");
  const [selectedPaths, setSelectedPaths] = (0, import_react.useState)(() => [
    ...initial?.allowedProjectPaths ?? []
  ]);
  const [customPath, setCustomPath] = (0, import_react.useState)("");
  const [selectedModels, setSelectedModels] = (0, import_react.useState)(() => [
    ...initial?.allowedModels ?? []
  ]);
  const [allowWorkspaceFiles, setAllowWorkspaceFiles] = (0, import_react.useState)(
    initial?.allowWorkspaceFiles ?? true
  );
  const [allowTerminal, setAllowTerminal] = (0, import_react.useState)(initial?.allowTerminal ?? false);
  const [validationError, setValidationError] = (0, import_react.useState)(null);
  const knownPathSet = (0, import_react.useMemo)(
    () => new Set(state.projects.map((project) => project.path)),
    [state.projects]
  );
  const customPaths = (0, import_react.useMemo)(
    () => selectedPaths.filter((path) => !knownPathSet.has(path)),
    [knownPathSet, selectedPaths]
  );
  const modelKeySet = (0, import_react.useMemo)(
    () => new Set(selectedModels.map((entry) => modelKey(entry.provider, entry.model))),
    [selectedModels]
  );
  const togglePath = (path) => {
    setSelectedPaths(
      (prev) => prev.includes(path) ? prev.filter((item) => item !== path) : [...prev, path]
    );
  };
  const addCustomPath = () => {
    const trimmed = customPath.trim();
    if (!trimmed) return;
    if (!selectedPaths.includes(trimmed)) setSelectedPaths((prev) => [...prev, trimmed]);
    setCustomPath("");
  };
  const toggleModel = (provider, model) => {
    const key = modelKey(provider, model);
    setSelectedModels(
      (prev) => prev.some((entry) => modelKey(entry.provider, entry.model) === key) ? prev.filter((entry) => modelKey(entry.provider, entry.model) !== key) : [...prev, { provider, model }]
    );
  };
  const setGroupModels = (group, checked) => {
    const entries = flattenGroupModels(group);
    const keys = new Set(entries.map((entry) => modelKey(entry.provider, entry.model)));
    setSelectedModels((prev) => {
      const rest = prev.filter((entry) => !keys.has(modelKey(entry.provider, entry.model)));
      return checked ? [...rest, ...entries.map((entry) => ({ provider: entry.provider, model: entry.model }))] : rest;
    });
  };
  const handleSave = async () => {
    if (!keyName.trim()) {
      setValidationError(t("editor.validationName"));
      return;
    }
    if (selectedPaths.length === 0) {
      setValidationError(t("editor.validationProjects"));
      return;
    }
    if (selectedModels.length === 0) {
      setValidationError(t("editor.validationModels"));
      return;
    }
    setValidationError(null);
    try {
      await onSubmit({
        name: keyName.trim(),
        allowedProjectPaths: selectedPaths,
        allowedModels: selectedModels,
        allowWorkspaceFiles,
        allowTerminal
      });
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : String(error));
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_dsh_client_ui_primitives.Modal,
    {
      open: true,
      onClose: () => {
        if (!busy) onClose();
      },
      title: t(initial ? "editor.editTitle" : "editor.createTitle"),
      closeLabel: t("editor.close"),
      footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { variant: "outline", disabled: busy, onClick: onClose, children: t("editor.cancel") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { variant: "primary", disabled: busy, onClick: () => void handleSave(), children: t(initial ? "editor.save" : "editor.create") })
      ] }),
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "csa-form", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "csa-field", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "csa-label", children: t("editor.nameLabel") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              className: "csa-input",
              type: "text",
              value: keyName,
              maxLength: 80,
              placeholder: t("editor.namePlaceholder"),
              onChange: (event) => setKeyName(event.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "csa-field", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "csa-label", children: t("editor.projectsTitle") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "csa-meta", children: t("editor.projectsHint") }),
          state.projects.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "csa-meta", children: t("editor.projectsEmpty") }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "csa-checklist", children: state.projects.map((project) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "csa-check", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                type: "checkbox",
                checked: selectedPaths.includes(project.path),
                onChange: () => togglePath(project.path)
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
              project.title,
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "csa-check-sub", children: project.path })
            ] })
          ] }, project.path)) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "csa-row", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                className: "csa-input",
                type: "text",
                value: customPath,
                placeholder: t("editor.customPathPlaceholder"),
                onChange: (event) => setCustomPath(event.target.value),
                onKeyDown: (event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addCustomPath();
                  }
                }
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { variant: "outline", disabled: !customPath.trim(), onClick: addCustomPath, children: t("editor.addPath") })
          ] }),
          customPaths.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "csa-chip-row", children: customPaths.map((path) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "csa-chip", children: [
            path,
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "button",
              {
                type: "button",
                "aria-label": "Remove",
                onClick: () => setSelectedPaths((prev) => prev.filter((item) => item !== path)),
                children: "\xD7"
              }
            )
          ] }, path)) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "csa-field", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "csa-label", children: t("editor.modelsTitle") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "csa-meta", children: t("editor.modelsHint") }),
          state.modelGroups.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "csa-meta", children: t("editor.modelsEmpty") }) : state.modelGroups.map((group) => {
            const entries = flattenGroupModels(group);
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "csa-group", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "csa-group-head", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                  group.name,
                  " (",
                  group.id,
                  ")"
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "csa-actions", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "button",
                    {
                      type: "button",
                      className: "csa-link-btn",
                      onClick: () => setGroupModels(group, true),
                      children: t("editor.selectAll")
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "button",
                    {
                      type: "button",
                      className: "csa-link-btn",
                      onClick: () => setGroupModels(group, false),
                      children: t("editor.clearAll")
                    }
                  )
                ] })
              ] }),
              entries.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "csa-check", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "input",
                  {
                    type: "checkbox",
                    checked: modelKeySet.has(modelKey(entry.provider, entry.model)),
                    onChange: () => toggleModel(entry.provider, entry.model)
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                  entry.label,
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "csa-check-sub", children: entry.model })
                ] })
              ] }, modelKey(entry.provider, entry.model)))
            ] }, group.id);
          })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "csa-field", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "csa-label", children: t("editor.capabilitiesTitle") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "csa-check", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                type: "checkbox",
                checked: allowWorkspaceFiles,
                onChange: (event) => setAllowWorkspaceFiles(event.target.checked)
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("editor.allowFiles") })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "csa-check", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                type: "checkbox",
                checked: allowTerminal,
                onChange: (event) => setAllowTerminal(event.target.checked)
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("editor.allowTerminal") })
          ] })
        ] }),
        validationError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "csa-error", role: "alert", children: validationError })
      ] })
    }
  );
}
function ScopedAccessSection({ t }) {
  const [view, setView] = (0, import_react.useState)({ kind: "loading" });
  const [busy, setBusy] = (0, import_react.useState)(false);
  const [error, setError] = (0, import_react.useState)(null);
  const [editing, setEditing] = (0, import_react.useState)(
    null
  );
  const [connecting, setConnecting] = (0, import_react.useState)(null);
  const [confirming, setConfirming] = (0, import_react.useState)(null);
  const load = (0, import_react.useCallback)(async () => {
    setError(null);
    try {
      const data2 = await apiRequest("/state");
      setView({ kind: "ready", data: data2 });
    } catch (cause) {
      if (cause instanceof ScopedAccessError && cause.code === "auth/disabled") {
        setView({ kind: "disabled" });
      } else if (cause instanceof ScopedAccessError && cause.code === "auth/forbidden") {
        setView({ kind: "forbidden" });
      } else {
        setView({
          kind: "error",
          message: cause instanceof Error ? cause.message : String(cause)
        });
      }
    }
  }, []);
  (0, import_react.useEffect)(() => {
    void load();
  }, [load]);
  const runAction = async (work) => {
    setBusy(true);
    setError(null);
    try {
      const next = await work();
      setView({ kind: "ready", data: next });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      throw cause;
    } finally {
      setBusy(false);
    }
  };
  if (view.kind === "loading") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "csa-meta", children: t("page.loading") });
  if (view.kind === "disabled") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "csa-notice", children: t("page.authDisabled") });
  if (view.kind === "forbidden") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "csa-notice", children: t("page.forbidden") });
  if (view.kind === "error") {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "csa-page", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "csa-error", role: "alert", children: view.message }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { variant: "outline", onClick: () => void load(), children: t("page.refresh") }) })
    ] });
  }
  const { data } = view;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "csa-page", "data-codexhost-scoped-access": true, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { className: "csa-header", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: "csa-title", children: t("page.title") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "csa-subtitle", children: t("page.subtitle") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "csa-actions", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { variant: "outline", disabled: busy, onClick: () => void load(), children: t("page.refresh") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_dsh_client_ui_primitives.Button,
          {
            variant: "primary",
            disabled: busy,
            onClick: () => setEditing({ mode: "create" }),
            children: t("page.create")
          }
        )
      ] })
    ] }),
    error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "csa-error", role: "alert", children: error }),
    data.keys.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "csa-notice", children: t("page.empty") }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "csa-list", children: data.keys.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "csa-card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "csa-card-top", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "csa-card-name", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "csa-badge", "data-active": item.enabled, children: t(item.enabled ? "key.enabled" : "key.disabled") })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "csa-actions", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_dsh_client_ui_primitives.Switch,
            {
              checked: item.enabled,
              disabled: busy,
              onCheckedChange: (enabled) => {
                void runAction(async () => {
                  const res = await apiRequest(
                    `/keys/${encodeURIComponent(item.id)}`,
                    { method: "PUT", body: JSON.stringify({ enabled }) }
                  );
                  return res.state;
                }).catch(() => void 0);
              }
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_dsh_client_ui_primitives.Button,
            {
              variant: "primary",
              disabled: busy || !item.enabled,
              onClick: () => setConnecting(item),
              children: t("key.connect")
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_dsh_client_ui_primitives.Button,
            {
              variant: "outline",
              disabled: busy,
              onClick: () => setEditing({ mode: "edit", key: item }),
              children: t("key.edit")
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_dsh_client_ui_primitives.Button,
            {
              variant: "outline",
              disabled: busy,
              onClick: () => setConfirming({ kind: "rotate", key: item }),
              children: t("key.rotate")
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_dsh_client_ui_primitives.Button,
            {
              variant: "outline",
              disabled: busy,
              onClick: () => setConfirming({ kind: "delete", key: item }),
              children: t("key.delete")
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "csa-pills", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "csa-pill", children: t("key.summary", {
          projects: item.allowedProjectPaths.length,
          models: item.allowedModels.length
        }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "csa-pill", children: t(item.allowWorkspaceFiles ? "key.filesOn" : "key.filesOff") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "csa-pill", children: t(item.allowTerminal ? "key.terminalOn" : "key.terminalOff") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "csa-pill", children: item.lastUsedAt === null ? t("key.neverUsed") : t("key.lastUsed", { time: new Date(item.lastUsedAt).toLocaleString() }) })
      ] }),
      item.allowedProjectPaths.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "csa-path-list", children: item.allowedProjectPaths.map((path) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: path }, path)) })
    ] }, item.id)) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "csa-meta", children: t("page.configPath", { path: data.configFile }) }),
    editing !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      KeyEditorModal,
      {
        initial: editing.mode === "edit" ? editing.key : void 0,
        state: data,
        busy,
        onClose: () => setEditing(null),
        t,
        onSubmit: async (input) => {
          await runAction(async () => {
            const res = editing.mode === "create" ? await apiRequest(
              "/keys",
              { method: "POST", body: JSON.stringify(input) }
            ) : await apiRequest(
              `/keys/${encodeURIComponent(editing.key.id)}`,
              { method: "PUT", body: JSON.stringify(input) }
            );
            setEditing(null);
            if (editing.mode === "create") setConnecting(res.key);
            return res.state;
          });
        }
      }
    ),
    connecting !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ConnectModal,
      {
        item: connecting,
        networkUrls: data.networkUrls,
        onClose: () => setConnecting(null),
        t
      }
    ),
    confirming !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_dsh_client_ui_primitives.Modal,
      {
        open: true,
        onClose: () => {
          if (!busy) setConfirming(null);
        },
        title: t(confirming.kind === "rotate" ? "confirm.rotateTitle" : "confirm.deleteTitle"),
        closeLabel: t("editor.close"),
        description: t(
          confirming.kind === "rotate" ? "confirm.rotateBody" : "confirm.deleteBody",
          { name: confirming.key.name }
        ),
        footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { variant: "outline", disabled: busy, onClick: () => setConfirming(null), children: t("editor.cancel") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_dsh_client_ui_primitives.Button,
            {
              variant: "primary",
              disabled: busy,
              onClick: () => {
                const target = confirming;
                void runAction(async () => {
                  const res = target.kind === "rotate" ? await apiRequest(`/keys/${encodeURIComponent(target.key.id)}/rotate`, {
                    method: "POST"
                  }) : await apiRequest(
                    `/keys/${encodeURIComponent(target.key.id)}`,
                    { method: "DELETE" }
                  );
                  setConfirming(null);
                  if (target.kind === "rotate" && "key" in res) setConnecting(res.key);
                  return res.state;
                }).catch(() => void 0);
              },
              children: t(
                confirming.kind === "rotate" ? "confirm.rotateAction" : "confirm.deleteAction"
              )
            }
          )
        ] })
      }
    )
  ] });
}
function apply(ctx) {
  ctx.effect(() => {
    if (typeof document === "undefined") return;
    const existing = document.getElementById(STYLE_ID);
    if (existing) return;
    const tag = document.createElement("style");
    tag.id = STYLE_ID;
    tag.dataset.plugin = name;
    tag.textContent = CSS;
    document.head.appendChild(tag);
    return () => {
      tag.remove();
    };
  }, `${name}: styles`);
  ctx.effect(() => ctx.locale.register(NS, { zh: ZH, en: EN }), `${name}: locale`);
  const t = ctx.locale.bind(NS);
  let sectionDispose;
  ctx.effect(() => {
    const controller = new AbortController();
    void fetch("api/auth/status", {
      credentials: "same-origin",
      cache: "no-store",
      signal: controller.signal
    }).then(async (response) => {
      if (!response.ok) return { scope: "full" };
      return await response.json();
    }).then((status) => {
      if (controller.signal.aborted || status.scope === "scoped") return;
      sectionDispose = ctx.slots.inject(
        "settings.section",
        () => ctx.slots.register(
          {
            name: "settings.section",
            id: "codexhost-scoped-access",
            order: 1.5,
            label: () => t("section.title"),
            locale: NS
          },
          ScopedAccessSection
        )
      );
    }).catch(() => void 0);
    return () => {
      controller.abort();
      sectionDispose?.();
      sectionDispose = void 0;
    };
  }, `${name}: settings section`);
}
return module.exports; } });
