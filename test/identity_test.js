const expect = require("expect.js");
const { createAccount, LocalSigner, addressToBytes } = require("orbs-client-sdk");
const { Identity } = require("../src/identity");
const { deployIdentity, getClient } = require("../src/deploy_identity");

describe("Identity", () => {
    it("updates contract state", async () => {
		const contractOwner = createAccount();
		const contractName = "Identity" + new Date().getTime();

		const randomAddress = createAccount();
		const randomAddressAsBytes = addressToBytes(randomAddress.address);

		const signer = new LocalSigner(contractOwner);
		await deployIdentity(getClient(signer), contractName);
		const identity = new Identity(getClient(signer), contractName);

		const defaultValue = await identity.getIdByAddress(randomAddressAsBytes);
		expect(defaultValue).to.be.eql("");

		await identity.registerAddress(randomAddressAsBytes, "Nicolas Cage");
        const updatedValue = await identity.getIdByAddress(randomAddressAsBytes);
        expect(updatedValue).to.be.eql("Nicolas Cage");
    });
});
