const { argString, argBytes, argUint64, argUint32, addressToBytes } = require("orbs-client-sdk");

function getErrorFromReceipt(receipt) {
    const value = receipt.outputArguments.length == 0 ? receipt.executionResult : receipt.outputArguments[0].value;
    return new Error(value);
}

class Identity {
	constructor(orbsClient, contractName) {
		this.client = orbsClient;
		this.contractName = contractName;
	}

	async registerAddress(addr, id, publicKey, signature) {
		const [ tx, txId ] = await this.client.createTransaction(
			this.contractName,
			"registerAddress",
			[
				argBytes(addr),
				argString(id),
				argBytes(publicKey),
				argBytes(signature)
			]
		);

		const receipt = await this.client.sendTransaction(tx);
		if (receipt.executionResult !== 'SUCCESS') {
			throw getErrorFromReceipt(receipt);
		}
	}

	async getIdByAddress(addr) {
		const query = await this.client.createQuery(
			this.contractName,
			"getIdByAddress",
			[
				argBytes(addressToBytes(addr))
			]
		);

		const receipt = await this.client.sendQuery(query);
		if (receipt.executionResult !== 'SUCCESS') {
			throw getErrorFromReceipt(receipt);
		}

		return receipt.outputArguments[0].value;
	}
}

module.exports = {
	Identity
};
