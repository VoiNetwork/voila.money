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

function serializeWithTypeInfo(object: object) {
  return JSON.stringify({
    type: object.constructor.name,
    data: object,
  });
}

// Deserialize with type information
function deserializeWithTypeInfo(json: string) {
  const wrapper = JSON.parse(json);
  switch (wrapper.type) {
    case 'Transaction':
    // return recreateTransactionInstance(wrapper.data);
    // Handle other types...
    default:
      throw new Error('Unknown type');
  }
}