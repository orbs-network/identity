# Identity service

The purpose of the identity service is to help both end users and dApp developers to manage keys.

The problem that bothers many users is that when they eventually lose their keys, they will forever lose access to any resources available through the dApp.

The solution is to identify users by some kind of identifier (in this case, UUIDv4) instead of the key. It consists of 2 parts:

* identity server that associates user email with certain uuid
* smart contract that associates the uuid with an address

The flow:

* user signs into identity server via Google/Facebook/whatever identity provider
* identity server issues UUID (unless it was already issued), establishing an association between the user and the UUID
* identity server updates the smart contract with association between the UUID and the user address
* if the dApp developer tracks users by UUIDs instead of the address, the user continues to work with the dApp as if nothing has changed

Validation process (current implementation):

* after signing in via the identity server, user receives their UUID
* UUID is then signed by the user
* identity server passes the user address, public key, uuid and signature to the smart contract
* smart contract validates that the address was derived from the public key
* smart contract validates that the signature was signed by the owner of the public key
* smart contract updates the association between the address and the uuid

## Development

```bash
npm run gamma:start
npm run identity:local
npm run dev
```

## Testing

```bash
npm run gamma:start
npm run identity:local
npm test
```
