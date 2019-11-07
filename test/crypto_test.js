const expect = require("expect.js");
const { verifyIdOwnership, stringToBytes } = require("../src/crypto");
const { LocalSigner, createAccount, decodeHex } = require("orbs-client-sdk");
const uuid = require("uuid").v4;

describe("Crypto", () => {
    it("#verifyIdOwnership", async () => {
        const account = createAccount();

        const signer = new LocalSigner(account);
        const id = uuid();
        const signature = await signer.signEd25519(stringToBytes(id));
        const publicKey = await signer.getPublicKey();

        expect(verifyIdOwnership(id, account.address, publicKey, signature)).to.be.eql(true);
    });
});
