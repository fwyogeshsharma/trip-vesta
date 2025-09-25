// Utility to generate realistic fake transaction data for wallet ledger

export interface FakeTransactionData {
  transactionId: string;
  bankReference: string;
  paymentMethod: string;
  timestamp: string;
  processingTime: number;
}

export const generateRealisticTransactionId = (): string => {
  // Generate realistic transaction ID patterns used by Indian payment gateways
  const prefixes = ['TXN', 'PAY', 'CF', 'RZP', 'UPI', 'NEFT', 'IMPS'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

  // Generate realistic alphanumeric sequence
  const timestamp = Date.now().toString().slice(-6);
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();

  return `${prefix}${timestamp}${randomPart}`;
};

export const generateBankReference = (): string => {
  // Generate realistic bank reference number
  const bankCodes = ['SBI', 'HDFC', 'ICICI', 'AXIS', 'PNB', 'BOI', 'CANARA'];
  const bankCode = bankCodes[Math.floor(Math.random() * bankCodes.length)];
  const refNumber = Math.floor(Math.random() * 9999999999).toString().padStart(10, '0');

  return `${bankCode}${refNumber}`;
};

export const generatePaymentMethod = (): string => {
  const methods = [
    'UPI - Google Pay',
    'UPI - PhonePe',
    'UPI - Paytm',
    'Net Banking - SBI',
    'Net Banking - HDFC',
    'Net Banking - ICICI',
    'Debit Card - Visa',
    'Debit Card - Mastercard',
    'Credit Card - Visa',
    'Credit Card - Mastercard',
    'Wallet - Paytm',
    'Wallet - Amazon Pay'
  ];

  return methods[Math.floor(Math.random() * methods.length)];
};

export const generateProcessingTime = (): number => {
  // Realistic processing time between 1-8 seconds
  return Math.floor(Math.random() * 8000) + 1000;
};

export const createFakeTransactionData = (orderId?: string): FakeTransactionData => {
  return {
    transactionId: orderId || generateRealisticTransactionId(),
    bankReference: generateBankReference(),
    paymentMethod: generatePaymentMethod(),
    timestamp: new Date().toISOString(),
    processingTime: generateProcessingTime()
  };
};

export const generateDetailedDescription = (
  amount: number,
  fakeData: FakeTransactionData
): string => {
  const descriptions = [
    `Payment of ₹${amount.toLocaleString()} processed via ${fakeData.paymentMethod}`,
    `Wallet top-up ₹${amount.toLocaleString()} - ${fakeData.paymentMethod} transaction`,
    `Funds added ₹${amount.toLocaleString()} through ${fakeData.paymentMethod}`,
    `Online payment ₹${amount.toLocaleString()} successful via ${fakeData.paymentMethod}`,
    `Digital payment ₹${amount.toLocaleString()} completed using ${fakeData.paymentMethod}`
  ];

  return descriptions[Math.floor(Math.random() * descriptions.length)];
};

// Generate additional transaction metadata for display
export const generateTransactionMetadata = () => {
  const locations = [
    'Mumbai, Maharashtra',
    'Delhi, NCT',
    'Bangalore, Karnataka',
    'Hyderabad, Telangana',
    'Chennai, Tamil Nadu',
    'Kolkata, West Bengal',
    'Pune, Maharashtra',
    'Ahmedabad, Gujarat'
  ];

  const devices = [
    'Chrome on Windows',
    'Chrome on Android',
    'Safari on iPhone',
    'Firefox on Windows',
    'Edge on Windows',
    'Chrome on macOS'
  ];

  return {
    location: locations[Math.floor(Math.random() * locations.length)],
    device: devices[Math.floor(Math.random() * devices.length)],
    ipHash: `***${Math.floor(Math.random() * 255)}.***`,
    sessionId: Math.random().toString(36).substring(2, 15)
  };
};