import { pad, toCRC16 } from '../lib';

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
const makeString = (
    qris: string, 
    { nominal, taxtype = 'p', fee = '0' }: MakeStringOptions = {}
): string => {
    // Input validation
    if (!qris) throw new Error('The parameter "qris" is required.');
    if (!nominal) throw new Error('The parameter "nominal" is required.');

    // Modify QRIS string
    let tax = '';
    let qrisModified = qris.slice(0, -4).replace("010211", "010212");
    let qrisParts = qrisModified.split("5802ID");

    // Prepare amount string
    let amount = "54" + pad(nominal.length) + nominal;

    // Add tax/fee if applicable
    if (taxtype && fee) {
        tax = (taxtype === 'p')
            ? "55020357" + pad(fee.length) + fee
            : "55020256" + pad(fee.length) + fee;
    }

    // Construct final QRIS string
    amount += (tax.length === 0) ? "5802ID" : tax + "5802ID";
    let output = qrisParts[0].trim() + amount + qrisParts[1].trim();
    output += toCRC16(output);

    return output;
};

export default makeString;