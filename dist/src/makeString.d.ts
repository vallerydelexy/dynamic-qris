interface MakeStringOptions {
    nominal?: string;
    taxtype?: 'p' | 'n';
    fee?: string;
}
/**
 * Modifies QRIS string with additional payment information
 * @param qris Original QRIS string
 * @param options Configuration options for modification
 * @returns Modified QRIS string with CRC16 checksum
 */
declare const makeString: (qris: string, { nominal, taxtype, fee }?: MakeStringOptions) => string;
export default makeString;
