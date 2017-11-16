export function validateEthAddress(address) {
  // currently validating only if address starts with 0x
  // TODO: do proper validation
  return address.indexOf('0x') === 0
}
