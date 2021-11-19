const NodeRSA = require('node-rsa');
const fs = require('fs')
require('dotenv').config();

// This key will function as a public key but is called private key because it is more computational expensive to encrypt with
// This key is intentionally published!
const PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----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-----END RSA PRIVATE KEY-----`

module.exports = () => {
    const key = new NodeRSA();
    key.importKey(PRIVATE_KEY, 'private');
    console.log("Encrypting output.json...")
    const content = fs.readFileSync('./output.json', 'utf8')
    const en = key.encryptPrivate(content, 'base64')
    // console.log(en)
    fs.writeFileSync('outputEncoded.txt', en)
}

// key.importKey(process.env.PUBLIC_KEY, 'private');
// const content = fs.readFileSync('./outputEncoded.txt', 'utf8')
// const en = key.decryptPublic(content, 'utf8')
// fs.writeFileSync('outputDecoded.txt', en)-