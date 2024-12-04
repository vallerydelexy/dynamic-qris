"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pad = pad;
exports.toCRC16 = toCRC16;
exports.getBetween = getBetween;
exports.dataQris = dataQris;
/**
 * Pads a number with a leading zero if it's less than 10
 * @param number The number to pad
 * @returns Padded number as a string
 */
function pad(number) {
    return number < 10 ? '0' + number : number.toString();
}
/**
 * Computes CRC16 checksum for the input string
 * @param input The input string to compute CRC16 for
 * @returns Uppercase hex representation of CRC16
 */
function toCRC16(input) {
    let crc = 0xFFFF;
    for (let i = 0; i < input.length; i++) {
        crc ^= input.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
        }
    }
    let hex = (crc & 0xFFFF).toString(16).toUpperCase();
    return hex.length === 3 ? "0" + hex : hex;
}
/**
 * Extracts a substring between start and end markers
 * @param str The input string to search in
 * @param start The start marker
 * @param end The end marker
 * @returns Extracted substring or empty string if not found
 */
function getBetween(str, start, end) {
    let startIdx = str.indexOf(start);
    if (startIdx === -1)
        return "";
    startIdx += start.length;
    let endIdx = str.indexOf(end, startIdx);
    return str.slice(startIdx, endIdx);
}
/**
 * Extracts data from a QRIS (Quick Response Indonesian Standard) string
 * @param qris The QRIS string to parse
 * @returns Object containing extracted QRIS information
 */
function dataQris(qris) {
    const nmid = "ID" + getBetween(qris, "15ID", "0303");
    const id = qris.includes("A01") ? "A01" : "01";
    const merchantName = getBetween(qris, "ID59", "60").substring(2).trim().toUpperCase();
    const printData = qris.match(/(?<=ID|COM).+?(?=0118)/g);
    if (!printData) {
        throw new Error("No print data found in QRIS string");
    }
    const printCount = printData.length;
    const printerName = printData[printCount - 1].split('.');
    const printer = printerName.length === 3 ? printerName[1] : printerName[2];
    const nnsData = qris.match(/(?<=0118).+?(?=ID)/g);
    if (!nnsData) {
        throw new Error("No NNS data found in QRIS string");
    }
    const nns = nnsData[nnsData.length - 1].substring(0, 8);
    const crcInput = qris.slice(0, -4);
    const crcFromQris = qris.slice(-3);
    const crcComputed = toCRC16(crcInput);
    return {
        nmid,
        id,
        merchantName,
        printer,
        nns,
        crcIsValid: crcFromQris === crcComputed
    };
}
