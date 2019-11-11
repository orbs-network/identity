const stringToBytes = (val) => new TextEncoder().encode(val);

module.exports = {
    stringToBytes,
}