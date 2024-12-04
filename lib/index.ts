/**
 * Pads a number with a leading zero if it's less than 10
 * @param number The number to pad
 * @returns Padded number as a string
 */
export function pad(number: number): string {
    return number < 10 ? '0' + number : number.toString();
}

/**
 * Computes CRC16 checksum for the input string
 * @param input The input string to compute CRC16 for
 * @returns Uppercase hex representation of CRC16
 */
export function toCRC16(input: string): string {
    let crc: number = 0xFFFF;
    for (let i = 0; i < input.length; i++) {
        crc ^= input.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
        }
    }

    let hex: string = (crc & 0xFFFF).toString(16).toUpperCase();
    return hex.length === 3 ? "0" + hex : hex;
}

/**
 * Extracts a substring between start and end markers
 * @param str The input string to search in
 * @param start The start marker
 * @param end The end marker
 * @returns Extracted substring or empty string if not found
 */
export function getBetween(str: string, start: string, end: string): string {
    let startIdx: number = str.indexOf(start);
    if (startIdx === -1) return "";
    startIdx += start.length;
    let endIdx: number = str.indexOf(end, startIdx);
    return str.slice(startIdx, endIdx);
}

/**
 * Extracts data from a QRIS (Quick Response Indonesian Standard) string
 * @param qris The QRIS string to parse
 * @returns Object containing extracted QRIS information
 */
export function dataQris(qris: string): {
    nmid: string;
    id: string;
    merchantName: string;
    printer: string;
    nns: string;
    crcIsValid: boolean;
} {
    const nmid: string = "ID" + getBetween(qris, "15ID", "0303");
    const id: string = qris.includes("A01") ? "A01" : "01";
    const merchantName: string = getBetween(qris, "ID59", "60").substring(2).trim().toUpperCase();

    const printData: string[] | null = qris.match(/(?<=ID|COM).+?(?=0118)/g);
    if (!printData) {
        throw new Error("No print data found in QRIS string");
    }

    const printCount: number = printData.length;
    const printerName: string[] = printData[printCount - 1].split('.');
    const printer: string = printerName.length === 3 ? printerName[1] : printerName[2];

    const nnsData: string[] | null = qris.match(/(?<=0118).+?(?=ID)/g);
    if (!nnsData) {
        throw new Error("No NNS data found in QRIS string");
    }

    const nns: string = nnsData[nnsData.length - 1].substring(0, 8);

    const crcInput: string = qris.slice(0, -4);
    const crcFromQris: string = qris.slice(-3);
    const crcComputed: string = toCRC16(crcInput);

    return {
        nmid,
        id,
        merchantName,
        printer,
        nns,
        crcIsValid: crcFromQris === crcComputed
    };
}