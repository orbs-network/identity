const expect = require("expect.js");
const { stringToBytes } = require("../src/crypto");
const { LocalSigner, createAccount, encodeHex, addressToBytes } = require("orbs-client-sdk");
const MockStrategy = require("passport-mock-strategy");
const uuid = require("uuid").v4;
const express = require("express");
const supertest = require("supertest");
const { Identity } = require("../src/identity");
const { getClient, getLocalSigner, getContractName } = require("../src/deploy_identity");

const userIdentity = uuid();

const strategy = new MockStrategy({
    name: "mock-strategy",
    user: {
        identity: userIdentity,
    }
}, (user, done) => {
    done(null, user);
});

const app = require("../src/app")(express(), strategy);

const identity = new Identity(getClient(getLocalSigner()), getContractName());

describe("App", () => {
    it("successfully establishes identity", async () => {
        const account = createAccount();
        const signer = new LocalSigner(account);
        const signature = await signer.signEd25519(stringToBytes(userIdentity));
        const publicKey = await signer.getPublicKey();

        const request = supertest(app);
        const { headers } = await request.get("/auth/google");
        const { body, status } = await request
            .post("/identity/create")
            .set("Cookie", headers["set-cookie"])
            .send({
                address: account.address,
                signature: encodeHex(signature),
                publicKey: encodeHex(publicKey),
            }).expect(200);

        expect(body.status).to.be.eql("ok");

        expect(await identity.getIdByAddress(addressToBytes(account.address))).to.be.eql(userIdentity);
    });

    it("successfully updates identity", async () => {
        const account = createAccount();
        const signer = new LocalSigner(account);
        const signature = await signer.signEd25519(stringToBytes(userIdentity));
        const publicKey = await signer.getPublicKey();

        const anotherAccount = createAccount()
        const anotherSigner = new LocalSigner(anotherAccount);
        const anotherSignature = await anotherSigner.signEd25519(stringToBytes(userIdentity));
        const anotherPublicKey = await anotherSigner.getPublicKey();

        const request = supertest(app);
        const { headers } = await request.get("/auth/google");
        await request
            .post("/identity/create")
            .set("Cookie", headers["set-cookie"])
            .send({
                address: account.address,
                signature: encodeHex(signature),
                publicKey: encodeHex(publicKey),
            }).expect(200);

        expect(await identity.getIdByAddress(addressToBytes(account.address))).to.be.eql(userIdentity);

        await request
            .post("/identity/create")
            .set("Cookie", headers["set-cookie"])
            .send({
                address: anotherAccount.address,
                signature: encodeHex(anotherSignature),
                publicKey: encodeHex(anotherPublicKey),
            }).expect(200);

        expect(await identity.getIdByAddress(addressToBytes(anotherAccount.address))).to.be.eql(userIdentity);
        expect(await identity.getIdByAddress(addressToBytes(account.address))).to.be.eql("");
    });

    it("with bad address", async () => {
        const account = createAccount();
        const signer = new LocalSigner(account);
        const signature = await signer.signEd25519(stringToBytes(userIdentity));
        const publicKey = await signer.getPublicKey();

        const request = supertest(app);
        const { headers } = await request.get("/auth/google");            
        const { body } = await request
            .post("/identity/create")
            .set("Cookie", headers["set-cookie"])
            .send({
                address: "fakeaddress",
                signature: encodeHex(signature),
                publicKey: encodeHex(publicKey),
            })
            .expect(500);

        expect(body.status).to.be.eql("address does not match the public key");
        expect(await identity.getIdByAddress(stringToBytes("fakeadress"))).to.be.eql("");
    });
});
