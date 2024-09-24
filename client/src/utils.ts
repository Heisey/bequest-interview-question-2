
import * as jsRsa from 'jsrsasign'
import * as Types from './types'

export const hashData = async (data: any) => {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  const encodedKey = encoder.encode('puppies');
  const key = await crypto.subtle.importKey('raw', encodedKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])

  const hashBuffer = await crypto.subtle.sign("HMAC", key, encodedData);

  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join(''); 
}

export const compareWithCache = (args: { cur: Types.Record, stale?: Types.Record }) => {

  if (!args.stale) return false

  const isDataIdentical = args.cur.data === args.stale.data
  const isSignatureIdentical = args.cur.hash === args.stale.hash;
  
  return isDataIdentical && isSignatureIdentical
};

export const generateKeyPair = () => {
  const keypair = jsRsa.KEYUTIL.generateKeypair("RSA", 2048);
  const publicKeyPem = jsRsa.KEYUTIL.getPEM(keypair.pubKeyObj); 
  const privateKeyPem = jsRsa.KEYUTIL.getPEM(keypair.prvKeyObj, "PKCS1PRV");
  return { publicKey: publicKeyPem, privateKey: privateKeyPem };
};

export const signData = (privateKey: string, data: any) => {
  const rsa = new jsRsa.KJUR.crypto.Signature({ alg: "SHA256withRSA" });
  rsa.init(privateKey);
  rsa.updateString(data);
  const signature = rsa.sign();
  return signature;
};

export const verifySignature = async (publicKey: string, data: any, signature: string) => {
  const rsa = new jsRsa.KJUR.crypto.Signature({ alg: "SHA256withRSA" });
  await rsa.init(publicKey);
  rsa.updateString(data);
  return rsa.verify(signature);
};

export const base64EncodePublicKey = (pem: string): string => btoa(pem)

export const base64ToPem = (base64Key: string) => {
  const decodedKey = atob(base64Key);  // Decode Base64 key once
  const pemHeader = "-----BEGIN PUBLIC KEY-----\n";
  const pemFooter = "\n-----END PUBLIC KEY-----";
  const base64Formatted = decodedKey.match(/.{1,64}/g)?.join("\n"); // Split into 64-char lines for PEM
  return pemHeader + base64Formatted + pemFooter;
};

// export const generateKeyPair = async () => {
//   const keyPair = await (window.crypto.subtle as any).generateKeyPair(
//     {
//       name: "RSASSA-PKCS1-v1_5", 
//       modulusLength: 2048, 
//       publicExponent: new Uint8Array([1, 0, 1]), 
//       hash: "SHA-256", 
//     },
//     true, 
//     ["sign", "verify"] 
//   );

//   return keyPair;
// };

// const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
//   const binary = String.fromCharCode(...new Uint8Array(buffer));
//   return btoa(binary);
// }


// export const exportPublicKey = async (key: CryptoKey) => {
//   const exported = await crypto.subtle.exportKey("spki", key);
//   return arrayBufferToBase64(exported);
// };


// export const exportPrivateKey = async (key: CryptoKey) => {
//   const exported = await crypto.subtle.exportKey("pkcs8", key);
//   return arrayBufferToBase64(exported);
// };