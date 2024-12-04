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
declare const makeFile: (qris: string, { nominal, base64, taxtype, fee, path, }?: MakeFileOptions) => Promise<string>;
export default makeFile;
