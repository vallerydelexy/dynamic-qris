"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jimp_1 = require("jimp");
const qrcode_1 = __importDefault(require("qrcode"));
const fs = __importStar(require("fs"));
const lib_1 = require("../lib");
const makeString_1 = __importDefault(require("./makeString"));
/**
 * Generate a QRIS image file with embedded merchant information
 * @param qris Original QRIS string
 * @param options Configuration options for file generation
 * @returns Path to generated image or base64 image string
 */
const makeFile = async (qris, { nominal, base64 = false, taxtype = "p", fee = "0", path = "", } = {}) => {
    try {
        // Generate modified QRIS string
        const qrisModified = (0, makeString_1.default)(qris, { nominal, taxtype, fee });
        // Generate temporary QR code
        await qrcode_1.default.toFile("tmp.png", qrisModified, { margin: 2, scale: 10 });
        // Extract QRIS data
        const data = (0, lib_1.dataQris)(qris);
        const text = data.merchantName;
        const qr = await jimp_1.Jimp.read("tmp.png");
        const image = await jimp_1.Jimp.read("assets/template.png");
        const w = image.bitmap.width;
        const h = image.bitmap.height;
        // Select appropriate fonts based on text length
        const fontTitle = await (0, jimp_1.loadFont)(text.length > 18
            ? "assets/font/BebasNeueSedang/BebasNeue-Regular.ttf.fnt"
            : "assets/font/BebasNeue/BebasNeue-Regular.ttf.fnt");
        const fontMid = await (0, jimp_1.loadFont)(text.length > 28
            ? "assets/font/RobotoSedang/Roboto-Regular.ttf.fnt"
            : "assets/font/RobotoBesar/Roboto-Regular.ttf.fnt");
        const fontSmall = await (0, jimp_1.loadFont)("assets/font/RobotoKecil/Roboto-Regular.ttf.fnt");
        // Composite image with QR code and text
        image
            .composite(qr, w / 4 - 30, h / 4 + 68)
            .print(fontTitle, w / 5 - 30, h / 5 + 68, {
            text,
            alignmentX: jimp_1.HorizontalAlign.CENTER,
            alignmentY: jimp_1.VerticalAlign.MIDDLE,
        }, w / 1.5, text.length > 28 ? -180 : -210)
            .print(fontMid, w / 5 - 30, h / 5 + 68, {
            text: `NMID : ${data.nmid}`,
            alignmentX: jimp_1.HorizontalAlign.CENTER,
            alignmentY: jimp_1.VerticalAlign.MIDDLE,
        }, w / 1.5, text.length > 28 ? 20 : -45)
            .print(fontMid, w / 5 - 30, h / 5 + 68, {
            text: data.id,
            alignmentX: jimp_1.HorizontalAlign.CENTER,
            alignmentY: jimp_1.VerticalAlign.MIDDLE,
        }, w / 1.5, text.length > 28 ? 110 : 90)
            .print(fontSmall, w / 20, 1205, `Dicetak oleh: ${data.nns}`);
        // Determine output path
        if (!path) {
            path = `output/${text}-${Date.now()}.jpg`;
        }
        // Return base64 or file path
        if (base64) {
            const base64Image = await image.getBase64Async(jimp_1.JimpMime.jpeg);
            fs.unlinkSync('tmp.png');
            return base64Image;
        }
        else {
            await image.writeAsync(path);
            fs.unlinkSync('tmp.png');
            return path;
        }
    }
    catch (error) {
        throw new Error(error instanceof Error ? error.message : String(error));
    }
};
exports.default = makeFile;
