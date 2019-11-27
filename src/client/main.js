import App from "./App.svelte";
import {
  Client,
  encodeHex,
} from "orbs-client-sdk";
import { Identity } from "../identity";
import { Wallet } from "orbs-wallet/src/wallet/wallet";

export default (async () => {
  const wallet = new Wallet(window);
  let accounts;
  try {
    accounts = await wallet.enable(); // should open a separate extension window that asks for the password
  } catch (e) {
    console.log("Could not initialize wallet: " + e.toString());
    throw e;
  }

  const account = accounts[0];
  const client = new Client(
    process.env.ORBS_NODE_ADDRESS,
    process.env.ORBS_VCHAIN,
    "TEST_NET",
    account,
  );

  console.log(account)
  const address = await account.getAddress();
  console.log(address);

  const identityContractName = process.env.ORBS_IDENTITY;
  const identity = new Identity(client, identityContractName);


  const app = new App({
    target: document.body,
    props: {
      client,
      address,
      encodeHex,
      account,
      identity,
      config: {
        prismURL: process.env.ORBS_PRISM_URL,
        vchain: process.env.ORBS_VCHAIN,
      }
    }
  });
  return app;
})();
