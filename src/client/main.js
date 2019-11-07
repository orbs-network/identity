import App from "./App.svelte";
import {
  createAccount,
  Client,
  encodeHex,
  decodeHex,
  LocalSigner,
  addressToBytes,
} from "orbs-client-sdk";
import { Identity } from "../identity";

const SENDER_PUBLIC_KEY = "sender_public_key";
const SENDER_PRIVATE_KEY = "sender_private_key";
const SENDER_ADDRESS = "sender_address";

if (!localStorage.getItem(SENDER_PUBLIC_KEY)) {
  const sender = createAccount();
  localStorage.setItem(SENDER_PUBLIC_KEY, encodeHex(sender.publicKey));
  localStorage.setItem(SENDER_PRIVATE_KEY, encodeHex(sender.privateKey));
  localStorage.setItem(SENDER_ADDRESS, sender.address);
}

const publicKey = decodeHex(localStorage.getItem(SENDER_PUBLIC_KEY));
const privateKey = decodeHex(localStorage.getItem(SENDER_PRIVATE_KEY));
const address = localStorage.getItem(SENDER_ADDRESS);

const signer = new LocalSigner({
    publicKey, privateKey
});
const client = new Client(
  process.env.ORBS_NODE_ADDRESS,
  process.env.ORBS_VCHAIN,
  "TEST_NET",
  signer,
);

const identityContractName = process.env.ORBS_IDENTITY;
const identity = new Identity(client, identityContractName);

const app = new App({
  target: document.body,
  props: {
    client,
    address,
    addressToBytes,
    encodeHex,
    signer,
    identity,
    config: {
      prismURL: process.env.ORBS_PRISM_URL,
      vchain: process.env.ORBS_VCHAIN,
    }
  }
});

export default app;
