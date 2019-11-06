const { readFileSync, readdirSync } = require("fs");
const { join } = require("path");
const {
	Client, LocalSigner, createAccount,
	PROCESSOR_TYPE_NATIVE, NetworkType
} = require("orbs-client-sdk");

function getClient(signer) {
    const endpoint = process.env.ORBS_NODE_ADDRESS || "http://localhost:8080";
    const chain = Number(process.env.ORBS_VCHAIN) || 42;
    return new Client(endpoint, chain, NetworkType.NETWORK_TYPE_TEST_NET, signer);
}

// Read all go files except tests
function getIdentityContractCode() {
	const dir = join(__dirname, "contract", "identity");
	return readdirSync(dir).filter(f => f.match(/\.go$/) && !f.match(/\_test.go$/)).map(f => {
		return readFileSync(join(dir, f));
	});
}

async function deployIdentity(client, contractName) {
    const [tx, txid] = await client.createDeployTransaction(contractName, PROCESSOR_TYPE_NATIVE, ...getIdentityContractCode());
    const receipt = await client.sendTransaction(tx);
	if (receipt.executionResult !== 'SUCCESS') {
		throw new Error(receipt.outputArguments[0].value);
	}
}

module.exports = {
	getClient,
	getIdentityContractCode,
	deployIdentity
}

if (!module.parent) {
	(async () => {
		try {
			const signer = new LocalSigner(createAccount());
			await deployIdentity(getClient(signer), "Identity")
			console.log("Deployed Identity smart contract successfully");
		} catch (e) {
			console.error(e);
		}
	})();
}
