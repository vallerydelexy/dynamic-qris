import {Jimp, loadFont, HorizontalAlign, VerticalAlign, JimpMime, } from "jimp";
import QRCode from "qrcode";
import * as fs from "fs";
import { dataQris } from "../lib";
import makeString from "./makeString";

interface MakeFileOptions {
  nominal?: string;
  base64?: boolean;
  taxtype?: "p" | "n";
  fee?: string;
  path?: string;
}

/**
 * Generate a QRIS image file with embedded merchant information
 * @param qris Original QRIS string
 * @param options Configuration options for file generation
 * @returns Path to generated image or base64 image string
 */
const makeFile = async (
  qris: string,
  {
    nominal,
    base64 = false,
    taxtype = "p",
    fee = "0",
    path = "",
  }: MakeFileOptions = {}
): Promise<string> => {
  try {
    // Generate modified QRIS string
    const qrisModified = makeString(qris, { nominal, taxtype, fee });

    // Generate temporary QR code
    await QRCode.toFile("tmp.png", qrisModified, { margin: 2, scale: 10 });

    // Extract QRIS data
    const data = dataQris(qris);
    const text = data.merchantName;

    const qr = await Jimp.read("tmp.png");
    const image = await Jimp.read("assets/template.png");

    const w = image.bitmap.width;
    const h = image.bitmap.height;

    // Select appropriate fonts based on text length
    const fontTitle = await loadFont(
      text.length > 18
        ? "assets/font/BebasNeueSedang/BebasNeue-Regular.ttf.fnt"
        : "assets/font/BebasNeue/BebasNeue-Regular.ttf.fnt"
    );
    const fontMid = await loadFont(
      text.length > 28
        ? "assets/font/RobotoSedang/Roboto-Regular.ttf.fnt"
        : "assets/font/RobotoBesar/Roboto-Regular.ttf.fnt"
    );
    const fontSmall = await loadFont(
      "assets/font/RobotoKecil/Roboto-Regular.ttf.fnt"
    );

    // Composite image with QR code and text
    image
      .composite(qr, w / 4 - 30, h / 4 + 68)
      .print(
        fontTitle,
        w / 5 - 30,
        h / 5 + 68,
        {
          text,
          alignmentX: HorizontalAlign.CENTER,
          alignmentY: VerticalAlign.MIDDLE,
        },
        w / 1.5,
        text.length > 28 ? -180 : -210
      )
      .print(
        fontMid,
        w / 5 - 30,
        h / 5 + 68,
        {
          text: `NMID : ${data.nmid}`,
          alignmentX: HorizontalAlign.CENTER,
          alignmentY: VerticalAlign.MIDDLE,
        },
        w / 1.5,
        text.length > 28 ? 20 : -45
      )
      .print(
        fontMid,
        w / 5 - 30,
        h / 5 + 68,
        {
          text: data.id,
          alignmentX: HorizontalAlign.CENTER,
          alignmentY: VerticalAlign.MIDDLE,
        },
        w / 1.5,
        text.length > 28 ? 110 : 90
      )
      .print(fontSmall, w / 20, 1205, `Dicetak oleh: ${data.nns}`);

    // Determine output path
    if (!path) {
      path = `output/${text}-${Date.now()}.jpg`;
    }

    // Return base64 or file path
    if (base64) {
        const base64Image = await (image as any).getBase64Async(JimpMime.jpeg);
        fs.unlinkSync('tmp.png');
        return base64Image;
      } else {
        await (image as any).writeAsync(path);
        fs.unlinkSync('tmp.png');
        return path;
      }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
};

export default makeFile;
