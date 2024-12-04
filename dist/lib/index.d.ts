/**
 * Pads a number with a leading zero if it's less than 10
 * @param number The number to pad
 * @returns Padded number as a string
 */
export declare function pad(number: number): string;
/**
 * Computes CRC16 checksum for the input string
 * @param input The input string to compute CRC16 for
 * @returns Uppercase hex representation of CRC16
 */
export declare function toCRC16(input: string): string;
/**
 * Extracts a substring between start and end markers
 * @param str The input string to search in
 * @param start The start marker
 * @param end The end marker
 * @returns Extracted substring or empty string if not found
 */
export declare function getBetween(str: string, start: string, end: string): string;
/**
 * Extracts data from a QRIS (Quick Response Indonesian Standard) string
 * @param qris The QRIS string to parse
 * @returns Object containing extracted QRIS information
 */
export declare function dataQris(qris: string): {
    nmid: string;
    id: string;
    merchantName: string;
    printer: string;
    nns: string;
    crcIsValid: boolean;
};
