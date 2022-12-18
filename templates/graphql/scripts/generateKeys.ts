import { generateKeyPairSync } from 'crypto';
import * as jose from 'jose';

const generateSecretKey = async () => {
  const { privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 4096, // the length of your key in bits
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  const ecPrivateKey = await jose.importPKCS8(
    privateKey,
    process.env.ALGO as string,
  );

  console.log(ecPrivateKey);
};

generateSecretKey();
