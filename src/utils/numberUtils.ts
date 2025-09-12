
// Utility functions for handling Indonesian number formatting

export const parseIndonesianCurrency = (currencyString: string): number => {
  console.log('Parsing currency string:', currencyString);
  
  if (!currencyString || typeof currencyString !== 'string') {
    console.warn('Invalid currency string provided:', currencyString);
    return 0;
  }

  // Remove "Rp " prefix and any whitespace
  const cleanString = currencyString.replace(/Rp\s*/g, '').trim();
  console.log('Cleaned string:', cleanString);
  
  // Handle Indonesian number format where dots are thousand separators
  // and commas are decimal separators (if any)
  // Example: "1.532.500" should become 1532500
  // Example: "1.532.500,50" should become 1532500.50
  
  // Check if there's a comma (decimal separator)
  const hasDecimal = cleanString.includes(',');
  
  let result: number;
  
  if (hasDecimal) {
    // Split by comma to separate integer and decimal parts
    const parts = cleanString.split(',');
    if (parts.length !== 2) {
      console.warn('Invalid decimal format:', cleanString);
      return 0;
    }
    
    const [integerPart, decimalPart] = parts;
    // Remove dots from integer part (thousand separators)
    const cleanInteger = integerPart.replace(/\./g, '');
    // Validate decimal part (should only contain digits)
    if (!/^\d+$/.test(decimalPart)) {
      console.warn('Invalid decimal part:', decimalPart);
      return 0;
    }
    
    // Combine with decimal part
    const numberString = `${cleanInteger}.${decimalPart}`;
    result = parseFloat(numberString);
    console.log('Parsed with decimal:', numberString, '->', result);
  } else {
    // No decimal part, just remove dots (thousand separators)
    const cleanNumber = cleanString.replace(/\./g, '');
    // Validate that we only have digits left
    if (!/^\d+$/.test(cleanNumber)) {
      console.warn('Invalid number format after cleaning:', cleanNumber);
      return 0;
    }
    
    result = parseFloat(cleanNumber);
    console.log('Parsed without decimal:', cleanNumber, '->', result);
  }
  
  return isNaN(result) ? 0 : result;
};

export const formatIndonesianCurrency = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    console.warn('Invalid amount for formatting:', amount);
    return 'Rp 0';
  }
  
  // Use Indonesian locale for proper formatting
  const formatted = `Rp ${amount.toLocaleString('id-ID')}`;
  console.log('Formatted currency:', amount, '->', formatted);
  return formatted;
};

export const validateCurrencyAmount = (amount: any): boolean => {
  console.log('Validating currency amount:', amount, 'type:', typeof amount);
  
  if (typeof amount === 'number') {
    const isValid = !isNaN(amount) && isFinite(amount) && amount >= 0;
    console.log('Number validation result:', isValid);
    return isValid;
  }
  
  if (typeof amount === 'string') {
    // Check if string is not empty and not just whitespace
    if (!amount || !amount.trim()) {
      console.log('Empty string validation: false');
      return false;
    }
    
    const parsed = parseIndonesianCurrency(amount);
    const isValid = !isNaN(parsed) && isFinite(parsed) && parsed >= 0;
    console.log('String validation result:', isValid, 'parsed value:', parsed);
    return isValid;
  }
  
  console.log('Invalid type validation: false');
  return false;
};

// Testing utility function to validate number parsing
export const testNumberParsing = () => {
  const testCases = [
    { input: "Rp 1.532.500", expected: 1532500 },
    { input: "Rp 1.532.500,50", expected: 1532500.50 },
    { input: "Rp 1.500", expected: 1500 },
    { input: "Rp 1.500,25", expected: 1500.25 },
    { input: "1.532.500", expected: 1532500 },
    { input: "1.532.500,75", expected: 1532500.75 },
    { input: "Rp 0", expected: 0 },
    { input: "", expected: 0 },
    { input: "invalid", expected: 0 }
  ];
  
  console.log('=== Number Parsing Test Results ===');
  testCases.forEach(({ input, expected }) => {
    const result = parseIndonesianCurrency(input);
    const passed = result === expected;
    console.log(`${passed ? '✓' : '✗'} Input: "${input}" | Expected: ${expected} | Got: ${result}`);
  });
  console.log('=== End Test Results ===');
};

// Call test function in development mode
if (process.env.NODE_ENV === 'development') {
  // Uncomment the line below to run tests on module load
  // testNumberParsing();
}
