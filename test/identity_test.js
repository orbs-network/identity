const expect = require("expect.js");
const { createAccount, LocalSigner, addressToBytes } = require("orbs-client-sdk");
const { Identity } = require("../src/identity");
const { deployIdentity, getClient } = require("../src/deploy_identity");
const { stringToBytes } = require("../src/crypto");

describe("Identity", () => {
    it("updates contract state", async () => {
		const contractOwner = createAccount();
		const contractName = "Identity" + new Date().getTime();

		const randomAddress = createAccount();
		const randomAddressAsBytes = addressToBytes(randomAddress.address);

		const signer = new LocalSigner(contractOwner);
		await deployIdentity(getClient(signer), contractName);

		const randomSigner = new LocalSigner(randomAddress);
		const signature = await randomSigner.signEd25519(stringToBytes("Nicolas Cage"));
		const publicKey = await randomSigner.getPublicKey();
        const identity = new Identity(getClient(signer), contractName);

		const defaultValue = await identity.getIdByAddress(randomAddress.address);
		expect(defaultValue).to.be.eql("");

		await identity.registerAddress(randomAddressAsBytes, "Nicolas Cage", publicKey, signature);
        const updatedValue = await identity.getIdByAddress(randomAddress.address);
        expect(updatedValue).to.be.eql("Nicolas Cage");
	});

	it("fails with wrong signature", async () => {
		const contractOwner = createAccount();
		const contractName = "Identity" + new Date().getTime();

		const randomAddress = createAccount();
		const randomAddressAsBytes = addressToBytes(randomAddress.address);

		const signer = new LocalSigner(contractOwner);
		await deployIdentity(getClient(signer), contractName);

		const randomSigner = new LocalSigner(randomAddress);
		const signature = await signer.signEd25519(stringToBytes("Nicolas Cage"));
		const publicKey = await randomSigner.getPublicKey();
        const identity = new Identity(getClient(signer), contractName);

		const defaultValue = await identity.getIdByAddress(randomAddress.address);
		expect(defaultValue).to.be.eql("");

		let err;
		try {
			await identity.registerAddress(randomAddressAsBytes, "Nicolas Cage", publicKey, signature);
		} catch (e) {
			err = e;
		}
		expect(err.message).to.be.eql("could not establish id ownership by the address");

        const updatedValue = await identity.getIdByAddress(randomAddress.address);
        expect(updatedValue).to.be.eql("");
	});

	it("fails with wrong address", async () => {
		const contractOwner = createAccount();
		const contractName = "Identity" + new Date().getTime();

		const randomAddress = createAccount();
		const randomAddressAsBytes = addressToBytes(randomAddress.address);

		const signer = new LocalSigner(contractOwner);
		await deployIdentity(getClient(signer), contractName);

		const randomSigner = new LocalSigner(randomAddress);
		const signature = await randomSigner.signEd25519(stringToBytes("Nicolas Cage"));
		const publicKey = await randomSigner.getPublicKey();
        const identity = new Identity(getClient(signer), contractName);

		const defaultValue = await identity.getIdByAddress(randomAddress.address);
		expect(defaultValue).to.be.eql("");

		let err;
		try {
			await identity.registerAddress(addressToBytes(contractOwner.address), "Nicolas Cage", publicKey, signature);
		} catch (e) {
			err = e;
		}
		expect(err.message).to.be.eql("address does not match the public key");

        const updatedValue = await identity.getIdByAddress(randomAddress.address);
        expect(updatedValue).to.be.eql("");
    });
});
