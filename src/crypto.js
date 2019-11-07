const elliptic = require("elliptic");
const crypto = require("crypto");
const { encodeHex } = require("orbs-client-sdk");

function verifyEd25519(publicKey, data, signature) {
    const ec = new elliptic.eddsa("ed25519");
    const publicKeyString = uint8ArrayToHexString(publicKey);
    const key = ec.keyFromPublic(publicKeyString);
    // console.log(key.getPublic("hex"));
    // console.log(key.getSecret("hex"));
    const signatureBytes = [].slice.call(signature);
    return key.verify(data, signatureBytes);
}

function uint8ArrayToHexString(arr) {
    return Array.prototype.map.call(arr, (x) => ("00" + x.toString(16)).slice(-2)).join("");
}

const stringToBytes = (val) => new TextEncoder().encode(val);

const SHA256_HASH_SIZE_BYTES = 32;
const CLIENT_ADDRESS_SIZE_BYTES = 20;
const CLIENT_ADDRESS_SHA256_OFFSET = SHA256_HASH_SIZE_BYTES - CLIENT_ADDRESS_SIZE_BYTES;

function calcClientAddressOfEd25519PublicKey(publicKey) {
    return calcSha256(publicKey).slice(CLIENT_ADDRESS_SHA256_OFFSET);
}

function calcSha256(data) {
    return crypto.createHash("sha256").update(data).digest();
}

function verifyIdOwnership(id, address, publicKey, signature) {
    const addressFromPublicKey = encodeHex(calcClientAddressOfEd25519PublicKey(publicKey));
    if (address === addressFromPublicKey) {
        return verifyEd25519(publicKey, stringToBytes(id), signature);
    } else {
        throw new Error("Address does not match the public key!")
    }
}

module.exports = {
    stringToBytes,
    verifyIdOwnership
}