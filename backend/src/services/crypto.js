const CryptoJS = require('crypto-js');

class CryptoService {
  /**
   * Generates a voter credential hash
   * @param {string} voterId - Unique voter identifier
   * @param {string} electionId - Election ID
   * @returns {string} Credential hash
   */
  generateCredentialHash(voterId, electionId) {
    const data = `${voterId}-${electionId}-${Date.now()}`;
    return CryptoJS.SHA256(data).toString();
  }

  /**
   * Generates a vote hash (simulated encryption)
   * @param {number} candidateId - Selected candidate ID
   * @param {string} credential - Voter credential
   * @returns {string} Vote hash
   */
  generateVoteHash(candidateId, credential) {
    const data = `${candidateId}-${credential}-${Date.now()}`;
    return CryptoJS.SHA256(data).toString();
  }

  /**
   * Generates a ZK proof hash (simplified simulation)
   * @param {string} voteHash - Hash of the vote
   * @param {string} credential - Voter credential
   * @returns {string} Proof hash
   */
  generateProofHash(voteHash, credential) {
    const data = `proof-${voteHash}-${credential}-${Date.now()}`;
    return CryptoJS.SHA256(data).toString();
  }

  /**
   * Generates a receipt hash
   * @param {string} voteHash - Hash of the vote
   * @param {string} proofHash - Hash of the proof
   * @param {string} timestamp - Timestamp
   * @returns {string} Receipt hash
   */
  generateReceiptHash(voteHash, proofHash, timestamp) {
    const data = `${voteHash}-${proofHash}-${timestamp}`;
    return CryptoJS.SHA256(data).toString();
  }

  /**
   * Converts string to bytes32 format
   * @param {string} str - String to convert
   * @returns {string} Bytes32 hex string
   */
  stringToBytes32(str) {
    const hash = CryptoJS.SHA256(str).toString();
    return '0x' + hash;
  }

  /**
   * Verifies a proof (simplified simulation)
   * @param {string} proofHash - Hash of the proof
   * @returns {boolean} Verification result
   */
  verifyProof(proofHash) {
    // In a real implementation, this would verify the ZK-SNARK proof
    // For this demo, we simulate verification
    return proofHash && proofHash.length === 64;
  }

  /**
   * Encrypts data (simplified)
   * @param {any} data - Data to encrypt
   * @param {string} key - Encryption key
   * @returns {string} Encrypted data
   */
  encrypt(data, key) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
  }

  /**
   * Decrypts data (simplified)
   * @param {string} encryptedData - Encrypted data
   * @param {string} key - Decryption key
   * @returns {any} Decrypted data
   */
  decrypt(encryptedData, key) {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }
}

module.exports = new CryptoService();
