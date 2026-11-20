// NeighbourShare Blockchain Engine
// Lightweight, transparent, tamper-evident cryptographic ledger for community equipment sharing
// Records Escrow Locks, QR Handovers, Returns, Deposit Refunds, and Equipment Minting.

// Pure JS Synchronous SHA-256 implementation
function sha256(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let lengthProperty = 'length';
  let i, j;
  let result = '';

  const words = [];
  const asciiBitLength = ascii[lengthProperty] * 8;

  let hash = (sha256.h = sha256.h || []);
  const k = (sha256.k = sha256.k || []);
  let primeCounter = k[lengthProperty];

  const isComposite = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 300; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  ascii += '\x80';
  while ((ascii[lengthProperty] % 64) - 56) ascii += '\x00';
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return; // UTF-8 only
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength;

  for (j = 0; j < words[lengthProperty]; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      const i2 = i + j;
      const w15 = w[i - 15],
        w2 = w[i - 2];

      const a = hash[0],
        e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0);

      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? 0 : '') + b.toString(16);
    }
  }
  return result;
}

export function generateCryptoAddress(id, name) {
  const raw = `${id}:${name}:neighbourshare-salt`;
  const fullHash = sha256(raw);
  return `0x${fullHash.substring(0, 4).toUpperCase()}...${fullHash.substring(fullHash.length - 4).toUpperCase()}`;
}

export function generateTxHash(payload) {
  return '0x' + sha256(JSON.stringify(payload) + Date.now().toString());
}

// Block calculation
export function calculateBlockHash(index, previousHash, timestamp, transactions, nonce) {
  return sha256(index + previousHash + timestamp + JSON.stringify(transactions) + nonce);
}

// Proof of Work mining (find hash starting with "00")
export function mineBlock(index, previousHash, timestamp, transactions, difficulty = '00') {
  let nonce = 0;
  let hash = '';
  while (true) {
    hash = calculateBlockHash(index, previousHash, timestamp, transactions, nonce);
    if (hash.startsWith(difficulty)) {
      break;
    }
    nonce++;
    if (nonce > 100000) break; // safety guard
  }
  return { hash, nonce };
}

const STORAGE_KEY_BLOCKCHAIN = 'neighbourshare_blockchain_v1';

// Seed Blockchain Genesis & Historical Blocks
const INITIAL_CHAIN = [
  {
    index: 0,
    timestamp: '2026-11-01T00:00:00.000Z',
    transactions: [
      {
        txHash: '0x0000GENESIS0000NEIGHBOURSHARE0000000000000000000000000000000000000001',
        type: 'GENESIS_PROTOCOL',
        equipmentName: 'NeighbourShare Community Protocol Initialization',
        lenderName: 'Neighbourhood Consensus Network',
        borrowerName: 'All Verified Community Members',
        rentalFee: 0,
        securityDeposit: 0,
        proof: 'GENESIS_ROOT_BANGALORE_CENTRAL',
        status: 'CONFIRMED'
      }
    ],
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    nonce: 104,
    hash: '008a9f24b1c83401828f0927c3905c08271ea00941829e0138592cb918342129'
  },
  {
    index: 1,
    timestamp: '2026-11-02T10:30:00.000Z',
    transactions: [
      {
        txHash: '0x9b4f2c018a38de4918e9c20a48b109e482019a3b82c19e0481b9e02948c1092a',
        type: 'EQUIPMENT_REGISTRATION',
        requestId: 'eq_mint_1',
        equipmentId: 'eq_1',
        equipmentName: 'Bosch GSB 550 Freedom Impact Drill Kit (13mm, 550W)',
        lenderAddress: '0x7B12...4D8A',
        lenderName: 'Ramesh Kumar (Indiranagar)',
        borrowerAddress: '0x0000...COMMUNITY',
        borrowerName: 'Neighbourhood Registry',
        rentalFee: 35,
        securityDeposit: 500,
        proof: 'EQUIPMENT_SPEC_VERIFIED_550W',
        status: 'CONFIRMED'
      },
      {
        txHash: '0x81ca092b48d1e02839a048e9102c48b9102a948e10284b1092e0481b948c1093',
        type: 'EQUIPMENT_REGISTRATION',
        requestId: 'eq_mint_2',
        equipmentId: 'eq_2',
        equipmentName: 'Kärcher K2 Compact High Pressure Washer (110 Bar)',
        lenderAddress: '0x948E...021C',
        lenderName: 'Priya Patel (Koramangala)',
        borrowerAddress: '0x0000...COMMUNITY',
        borrowerName: 'Neighbourhood Registry',
        rentalFee: 60,
        securityDeposit: 1200,
        proof: 'BAR_PRESSURE_SEAL_VERIFIED',
        status: 'CONFIRMED'
      }
    ],
    previousHash: '008a9f24b1c83401828f0927c3905c08271ea00941829e0138592cb918342129',
    nonce: 72,
    hash: '0032b49e81c04981a029384b10294e8102948e019284b019284e019284b10924'
  },
  {
    index: 2,
    timestamp: '2026-11-04T12:05:00.000Z',
    transactions: [
      {
        txHash: '0x481b9e02948c1092a9b4f2c018a38de4918e9c20a48b109e482019a3b82c19e0',
        type: 'ESCROW_LOCK',
        requestId: 'req_103',
        equipmentId: 'eq_2',
        equipmentName: 'Kärcher K2 Compact High Pressure Washer',
        lenderAddress: '0x948E...021C',
        lenderName: 'Priya Patel',
        borrowerAddress: '0x7B12...4D8A',
        borrowerName: 'Ramesh Kumar',
        rentalFee: 420,
        securityDeposit: 1200,
        proof: 'ESCROW_CONTRACT_LOCKED_INR_1620',
        status: 'CONFIRMED'
      }
    ],
    previousHash: '0032b49e81c04981a029384b10294e8102948e019284b019284e019284b10924',
    nonce: 148,
    hash: '0049e019284b109249b4f2c018a38de4918e9c20a48b109e482019a3b82c19e0'
  },
  {
    index: 3,
    timestamp: '2026-11-05T09:12:00.000Z',
    transactions: [
      {
        txHash: '0x19a3b82c19e0481b9e02948c1092a9b4f2c018a38de4918e9c20a48b109e4820',
        type: 'HANDOVER_VERIFIED',
        requestId: 'req_103',
        equipmentId: 'eq_2',
        equipmentName: 'Kärcher K2 Compact High Pressure Washer',
        lenderAddress: '0x948E...021C',
        lenderName: 'Priya Patel',
        borrowerAddress: '0x7B12...4D8A',
        borrowerName: 'Ramesh Kumar',
        rentalFee: 420,
        securityDeposit: 1200,
        proof: 'OTP_HASH_VERIFIED_NS-3190',
        status: 'CONFIRMED'
      }
    ],
    previousHash: '0049e019284b109249b4f2c018a38de4918e9c20a48b109e482019a3b82c19e0',
    nonce: 312,
    hash: '007a8291e0481b948c1093481b9e02948c1092a9b4f2c018a38de4918e9c20a4'
  },
  {
    index: 4,
    timestamp: '2026-11-05T17:48:00.000Z',
    transactions: [
      {
        txHash: '0x20a48b109e482019a3b82c19e0481b9e02948c1092a9b4f2c018a38de4918e9c',
        type: 'DEPOSIT_REFUND',
        requestId: 'req_103',
        equipmentId: 'eq_2',
        equipmentName: 'Kärcher K2 Compact High Pressure Washer',
        lenderAddress: '0x948E...021C',
        lenderName: 'Priya Patel',
        borrowerAddress: '0x7B12...4D8A',
        borrowerName: 'Ramesh Kumar',
        rentalFee: 420,
        securityDeposit: 1200,
        proof: 'CONDITION_PST_VERIFIED_DEPOSIT_REFUNDED_₹1200',
        status: 'CONFIRMED'
      }
    ],
    previousHash: '007a8291e0481b948c1093481b9e02948c1092a9b4f2c018a38de4918e9c20a4',
    nonce: 89,
    hash: '0019e0481b9e02948c1092a9b4f2c018a38de4918e9c20a48b109e482019a3b8'
  },
  {
    index: 5,
    timestamp: '2026-11-09T10:32:00.000Z',
    transactions: [
      {
        txHash: '0x58f19e0481b9e02948c1092a9b4f2c018a38de4918e9c20a48b109e482019a3b',
        type: 'HANDOVER_VERIFIED',
        requestId: 'req_101',
        equipmentId: 'eq_7',
        equipmentName: 'Bosch GWS 600 Professional 4-Inch Angle Grinder',
        lenderAddress: '0x1029...8899',
        lenderName: 'Vikram Singh',
        borrowerAddress: '0x948E...021C',
        borrowerName: 'Priya Patel',
        rentalFee: 520,
        securityDeposit: 600,
        proof: 'OTP_HASH_VERIFIED_NS-4921',
        status: 'CONFIRMED'
      }
    ],
    previousHash: '0019e0481b9e02948c1092a9b4f2c018a38de4918e9c20a48b109e482019a3b8',
    nonce: 204,
    hash: '0092c48b9102a948e10284b1092e0481b948c1093481b9e02948c1092a9b4f2c'
  }
];

export function getBlockchain() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BLOCKCHAIN);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_BLOCKCHAIN, JSON.stringify(INITIAL_CHAIN));
      return INITIAL_CHAIN;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading blockchain from storage:', err);
    return INITIAL_CHAIN;
  }
}

export function saveBlockchain(chain) {
  try {
    localStorage.setItem(STORAGE_KEY_BLOCKCHAIN, JSON.stringify(chain));
  } catch (err) {
    console.error('Error saving blockchain:', err);
  }
}

// Record a new transaction and immediately mine a block
export function recordOnChainTransaction(txData) {
  const chain = getBlockchain();
  const lastBlock = chain[chain.length - 1];

  const txHash = generateTxHash(txData);
  const transaction = {
    txHash,
    timestamp: new Date().toISOString(),
    status: 'CONFIRMED',
    ...txData
  };

  const newIndex = lastBlock.index + 1;
  const newTimestamp = new Date().toISOString();
  const previousHash = lastBlock.hash;

  // Mine the block
  const { hash, nonce } = mineBlock(
    newIndex,
    previousHash,
    newTimestamp,
    [transaction],
    '00'
  );

  const newBlock = {
    index: newIndex,
    timestamp: newTimestamp,
    transactions: [transaction],
    previousHash,
    nonce,
    hash
  };

  chain.push(newBlock);
  saveBlockchain(chain);

  return { transaction, block: newBlock };
}

// Get flattened transactions
export function getAllBlockchainTransactions() {
  const chain = getBlockchain();
  const list = [];
  chain.forEach(block => {
    (block.transactions || []).forEach(tx => {
      list.push({
        ...tx,
        blockIndex: block.index,
        blockHash: block.hash,
        blockTimestamp: block.timestamp
      });
    });
  });
  return list.reverse(); // newest first
}

// Look up a specific transaction
export function getTransactionByHash(txHash) {
  const txs = getAllBlockchainTransactions();
  return txs.find(t => t.txHash === txHash) || null;
}

// Verify Blockchain cryptographic integrity
export function verifyChainIntegrity() {
  const chain = getBlockchain();
  for (let i = 1; i < chain.length; i++) {
    const current = chain[i];
    const prev = chain[i - 1];

    // Check link pointer
    if (current.previousHash !== prev.hash) {
      return {
        isValid: false,
        error: `Link broken at Block #${current.index}: Previous hash mismatch!`,
        failedIndex: current.index
      };
    }

    // Recompute hash
    const recomputed = calculateBlockHash(
      current.index,
      current.previousHash,
      current.timestamp,
      current.transactions,
      current.nonce
    );

    if (recomputed !== current.hash) {
      return {
        isValid: false,
        error: `Hash integrity failed at Block #${current.index}: Data tampering detected!`,
        failedIndex: current.index
      };
    }
  }

  return {
    isValid: true,
    verifiedBlocks: chain.length,
    algorithm: 'SHA-256 (Proof of Trust Consensus)',
    timestamp: new Date().toISOString()
  };
}

// Reset blockchain back to seed state
export function resetBlockchain() {
  localStorage.setItem(STORAGE_KEY_BLOCKCHAIN, JSON.stringify(INITIAL_CHAIN));
}
