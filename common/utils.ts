/**
 * removeEmpty gets a dictionary and removes empty values
 * @param obj
 * @returns {*}
 */
export function removeEmptyFields(obj: { [index: string]: any }): any {
  Object.keys(obj).forEach((key: string) => {
    if (obj.hasOwnProperty(key)) {
      if (obj[key] === null || obj[key] === undefined || obj[key].length === 0) delete obj[key];
    }
  });
  return obj;
}

/**
 * Converts full addresses into a shorter format:
 * AAAAAAAAAA.....AAAAAAAAAA
 * @param address 
 * @returns string
 */
export function obfuscateAddress(address: string, range: number = 10): string {
  return `${address.slice(0, range)}.....${address.slice(-range)}`;
}

/**
 * Compares to buffers to make sure it's contents match
 * Useful for validating groups or other msgpack encoded data
 * @param b1 first buffer to compare
 * @param b2 second buffer to compare
 * @returns boolean
 */
export function areBuffersEqual(b1: Uint8Array, b2: Uint8Array): boolean {
  return b1.every((value, index) => b2[index] === value);
}