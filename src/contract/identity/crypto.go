package main

import (
	"bytes"
	"golang.org/x/crypto/ed25519"
	"crypto/sha256"
)

const (
	CLIENT_ADDRESS_SIZE_BYTES    = 20
	SHA256_HASH_SIZE_BYTES = 32
	CLIENT_ADDRESS_SHA256_OFFSET = SHA256_HASH_SIZE_BYTES - CLIENT_ADDRESS_SIZE_BYTES
)

func verifySignature(publicKey []byte, data []byte, signature []byte) bool {
	return ed25519.Verify(publicKey, data, signature)
}

func verifyAddress(address []byte, publicKey []byte) bool {
	return bytes.Equal(address, publicKeyToAddress(publicKey))
}

func publicKeyToAddress(publicKey []byte) []byte {
	return hash(publicKey)[CLIENT_ADDRESS_SHA256_OFFSET:]
}

func hash(data []byte) []byte {
	s := sha256.New()
	s.Write(data)
	return s.Sum(nil)
}