package main

import (
	"bytes"
	"encoding/hex"

	"github.com/orbs-network/orbs-contract-sdk/go/sdk/v1"
	"github.com/orbs-network/orbs-contract-sdk/go/sdk/v1/address"
	"github.com/orbs-network/orbs-contract-sdk/go/sdk/v1/state"
)

var PUBLIC = sdk.Export(registerAddress, getIdByAddress)
var SYSTEM = sdk.Export(_init)

var OWNER_KEY = []byte("owner")

func _init() {
	state.WriteBytes(OWNER_KEY, address.GetSignerAddress())
}

func registerAddress(address []byte, id string) {
	ownerOnly()
	if id == "" {
		panic("can't set address for default id")
	}

	if oldAddress := getAddressById(id); oldAddress != nil {
		state.Clear(addressKey(oldAddress))
	}

	state.WriteString(addressKey(address), id)
	state.WriteBytes(identityKey(id), address)
}

func getIdByAddress(address []byte) string {
	return state.ReadString(addressKey(address))
}

func getAddressById(id string) []byte {
	return state.ReadBytes(identityKey(id))
}

func addressKey(address []byte) []byte {
	return []byte("address." + hex.EncodeToString(address))
}

func identityKey(id string) []byte {
	return []byte("id." + id)
}

func ownerOnly() {
	if !bytes.Equal(state.ReadBytes(OWNER_KEY), address.GetSignerAddress()) {
		panic("only the owner of the contract can register addresses")
	}
}
