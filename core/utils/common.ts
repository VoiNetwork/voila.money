export function classNames(...classes: unknown[]): string {
  return classes.filter(Boolean).join(' ');
}

export const IS_DEVELOPMENT =
  !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

export function base64ToByteArray(blob: string): Uint8Array {
  return stringToByteArray(atob(blob));
}

export function byteArrayToBase64(array: any): string {
  return btoa(byteArrayToString(array));
}

export function stringToByteArray(str: string): Uint8Array {
  return new Uint8Array(str.split('').map((x) => x.charCodeAt(0)));
}

export function byteArrayToString(array: any): string {
  return String.fromCharCode.apply(null, array);
}