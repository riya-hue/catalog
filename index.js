const fs = require('fs');

// Function to convert a string from any base to decimal (BigInt)
function convertToDecimal(valueStr, baseStr) {
    const base = BigInt(baseStr);
    let result = 0n;
    const digits = valueStr.toLowerCase();
    
    for (let i = 0; i < digits.length; i++) {
        const char = digits[i];
        let digitValue;
        
        if (char >= '0' && char <= '9') {
            digitValue = BigInt(parseInt(char, 10));
        } else if (char >= 'a' && char <= 'z') {
            digitValue = BigInt(10 + char.charCodeAt(0) - 'a'.charCodeAt(0));
        } else {
            throw new Error(`Invalid character in base ${base}: ${char}`);
        }
        
        if (digitValue >= base) {
            throw new Error(`Digit ${char} is invalid for base ${base}`);
        }
        
        result = result * base + digitValue;
    }
    
    return result;
}

// Function to parse the JSON input and extract roots
function parseInput(jsonData) {
    const n = jsonData.keys.n;
    const k = jsonData.keys.k;
    const roots = [];
    
    for (let i = 1; i <= n; i++) {
        const rootData = jsonData[i.toString()];
        if (rootData) {
            const x = BigInt(i);
            const y = convertToDecimal(rootData.value, rootData.base);
            roots.push({ x, y });
        }
    }
    
    return { n, k, roots };
}

// Function to calculate the secret using Lagrange interpolation
function calculateSecret(roots, k) {
    const points = roots.slice(0, k); // Use first k roots
    
    let secret = 0n;
    const mod = 1000000007n; // Large prime modulus
    
    for (let i = 0; i < points.length; i++) {
        let numerator = 1n;
        let denominator = 1n;
        
        for (let j = 0; j < points.length; j++) {
            if (i !== j) {
                numerator = (numerator * (-points[j].x)) % mod;
                denominator = (denominator * (points[i].x - points[j].x)) % mod;
            }
        }
        
        // Modular inverse of denominator
        let invDenominator = modInverse(denominator, mod);
        if (invDenominator < 0n) invDenominator += mod;
        
        const term = (points[i].y * numerator % mod) * invDenominator % mod;
        secret = (secret + term) % mod;
    }
    
    return secret < 0n ? secret + mod : secret;
}

// Extended Euclidean algorithm for modular inverse
function modInverse(a, mod) {
    let [old_r, r] = [a, mod];
    let [old_s, s] = [1n, 0n];
    let [old_t, t] = [0n, 1n];
    
    while (r !== 0n) {
        const quotient = old_r / r;
        [old_r, r] = [r, old_r - quotient * r];
        [old_s, s] = [s, old_s - quotient * s];
        [old_t, t] = [t, old_t - quotient * t];
    }
    
    return old_s % mod;
}

// Main function
function main() {
    try {
        // Read JSON file
        const rawData = fs.readFileSync('input.json', 'utf8');
        const jsonData = JSON.parse(rawData);
        
        // Parse input and decode values
        const { n, k, roots } = parseInput(jsonData);
        
        console.log(`Number of roots (n): ${n}`);
        console.log(`Minimum roots required (k): ${k}`);
        console.log('\nDecoded roots:');
        
        roots.forEach((root, index) => {
            console.log(`Root ${index + 1}: x = ${root.x}, y = ${root.y}`);
        });
        
        // Calculate secret
        const secret = calculateSecret(roots, k);
        console.log(`\nSecret (c): ${secret}`);
        
        return secret;
        
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

// Run the program
if (require.main === module) {
    main();
}

module.exports = { convertToDecimal, parseInput, calculateSecret };
