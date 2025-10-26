/**
 * Convert numbers to words for invoices
 * Supports up to billions (for UGX amounts)
 */

const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

/**
 * Convert a number less than 1000 to words
 */
function convertHundreds(num) {
  let result = '';
  
  if (num >= 100) {
    result += ones[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }
  
  if (num >= 20) {
    result += tens[Math.floor(num / 10)] + ' ';
    num %= 10;
  } else if (num >= 10) {
    result += teens[num - 10] + ' ';
    return result.trim();
  }
  
  if (num > 0) {
    result += ones[num] + ' ';
  }
  
  return result.trim();
}

/**
 * Convert a number to words
 * @param {number} num - The number to convert
 * @returns {string} - The number in words
 */
export function numberToWords(num) {
  if (num === 0) return 'Zero';
  
  // Handle negative numbers
  if (num < 0) return 'Negative ' + numberToWords(Math.abs(num));
  
  // Remove decimals (we're dealing with whole shillings)
  num = Math.floor(num);
  
  let result = '';
  
  // Billions
  if (num >= 1000000000) {
    result += convertHundreds(Math.floor(num / 1000000000)) + ' Billion ';
    num %= 1000000000;
  }
  
  // Millions
  if (num >= 1000000) {
    result += convertHundreds(Math.floor(num / 1000000)) + ' Million ';
    num %= 1000000;
  }
  
  // Thousands
  if (num >= 1000) {
    result += convertHundreds(Math.floor(num / 1000)) + ' Thousand ';
    num %= 1000;
  }
  
  // Hundreds, tens, and ones
  if (num > 0) {
    result += convertHundreds(num);
  }
  
  return result.trim();
}

/**
 * Convert currency amount to words with currency name
 * @param {number} amount - The amount to convert
 * @param {string} currency - Currency name (default: 'Uganda Shillings')
 * @returns {string} - The amount in words with currency
 */
export function amountToWords(amount, currency = 'Uganda Shillings') {
  if (!amount || amount === 0) {
    return `Zero ${currency} Only`;
  }
  
  const words = numberToWords(amount);
  return `${words} ${currency} Only`;
}

/**
 * Format amount in words for display (with proper capitalization)
 * @param {number} amount - The amount to convert
 * @returns {string} - Formatted amount in words
 */
export function formatAmountInWords(amount) {
  return amountToWords(amount).toUpperCase();
}

// Export default
export default {
  numberToWords,
  amountToWords,
  formatAmountInWords,
};

