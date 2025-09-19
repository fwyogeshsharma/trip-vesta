// Excel Reader Utility
import * as XLSX from 'xlsx';

// Random Indian locations for fallback data
const INDIAN_LOCATIONS = [
  'Mumbai, Maharashtra', 'Delhi, NCR', 'Bangalore, Karnataka', 'Chennai, Tamil Nadu',
  'Kolkata, West Bengal', 'Pune, Maharashtra', 'Hyderabad, Telangana', 'Ahmedabad, Gujarat',
  'Jaipur, Rajasthan', 'Kochi, Kerala', 'Goa', 'Lucknow, Uttar Pradesh',
  'Chandigarh', 'Coimbatore, Tamil Nadu', 'Indore, Madhya Pradesh', 'Surat, Gujarat',
  'Bhopal, Madhya Pradesh', 'Vadodara, Gujarat', 'Agra, Uttar Pradesh', 'Nashik, Maharashtra',
  'Patna, Bihar', 'Kanpur, Uttar Pradesh', 'Guwahati, Assam', 'Thiruvananthapuram, Kerala'
];

// Client companies with their corresponding logo files
interface CompanyLogo {
  name: string;
  logo: string;
}

const CLIENT_COMPANIES: CompanyLogo[] = [
  { name: 'Alisha Torrent', logo: '/clients/AlishaTorrent.svg' },
  { name: 'Balaji', logo: '/clients/balaji.png' },
  { name: 'Berger Paints', logo: '/clients/berger.png' },
  { name: 'Bhandari Plastic', logo: '/clients/bhandari-plastic.png' },
  { name: 'Dynamic Cables', logo: '/clients/dynamic-cables.png' },
  { name: 'Emami', logo: '/clients/emami.png' },
  { name: 'Greenply', logo: '/clients/greenply.png' },
  { name: 'INA Energy', logo: '/clients/ina-energy.png' },
  { name: 'Mangal Electricals', logo: '/clients/mangal-electricals.png' },
  { name: 'Manishankar Oils', logo: '/clients/Manishankar-Oils.png' },
  { name: 'Man Structures', logo: '/clients/man-structures.png' },
  { name: 'Mohit Polytech Pvt Ltd', logo: '/clients/Mohit-Polytech-Pvt-Ltd.png' },
  { name: 'Oswal Cables', logo: '/clients/oswal-cables.png' },
  { name: 'Raydean', logo: '/clients/raydean.png' },
  { name: 'RCC', logo: '/clients/rcc.png' },
  { name: 'Rex Pipes', logo: '/clients/rex-pipes.png' },
  { name: 'RL Industries', logo: '/clients/rl-industries.png' },
  { name: 'Sagar', logo: '/clients/sagar.png' },
  { name: 'Source One', logo: '/clients/source-one.png' },
  { name: 'Star Rising', logo: '/clients/star-rising.png' },
  { name: 'True Power', logo: '/clients/true-power.png' },
  { name: 'Varun Beverages', logo: '/clients/Varun-Beverages.png' }
];

// Extract just the company names for backward compatibility
const INDIAN_COMPANIES = CLIENT_COMPANIES.map(company => company.name);

// Trip routes for truck transportation
const TRIP_ROUTES = [
  'Delhi to Mumbai', 'Mumbai to Bangalore', 'Chennai to Kolkata', 'Pune to Hyderabad',
  'Delhi to Chennai', 'Mumbai to Pune', 'Bangalore to Chennai', 'Kolkata to Guwahati',
  'Ahmedabad to Surat', 'Jaipur to Delhi', 'Kochi to Bangalore', 'Indore to Bhopal'
];

// Project durations
const PROJECT_DURATIONS = [
  '3 months', '6 months', '9 months', '12 months', '18 months', '24 months'
];

// Management teams
const PROJECT_LEADERS = [
  'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy',
  'Vikram Singh', 'Anita Gupta', 'Rohit Mehta', 'Kavya Nair',
  'Arjun Agarwal', 'Deepika Joshi', 'Suresh Iyer', 'Meera Bansal'
];

// Utility functions for random data generation
const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomPercentage = (): string => {
  return `${getRandomNumber(8, 25)}%`;
};

const generateRandomAmount = (min: number = 5000, max: number = 200000): number => {
  return getRandomNumber(min, max);
};

// Safe data parsing functions
const safeParseNumber = (value: any, fallback: number): number => {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : Number(value);
  return isNaN(parsed) ? fallback : parsed;
};

const safeParseString = (value: any, fallback: string): string => {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value).trim();
};

const safeParseArray = (value: any, fallback: string[] = []): string[] => {
  if (value === null || value === undefined || value === '') return fallback;
  const str = String(value).trim();
  return str ? str.split(',').map(item => item.trim()).filter(Boolean) : fallback;
};

const safeParseBool = (value: any, fallback: boolean): boolean => {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  const str = String(value).toLowerCase().trim();
  if (str === 'true' || str === '1' || str === 'yes') return true;
  if (str === 'false' || str === '0' || str === 'no') return false;
  return fallback;
};

// Generate comprehensive fallback data
const generateFallbackTripData = (index: number): Partial<TripData> => {
  const baseAmount = generateRandomAmount(5000, 200000);
  const currentAmount = Math.floor(baseAmount * (getRandomNumber(30, 95) / 100));
  const selectedCompany = getRandomItem(CLIENT_COMPANIES);

  return {
    name: `${selectedCompany.name} Transportation`,
    location: getRandomItem(TRIP_ROUTES),
    duration: getRandomItem(PROJECT_DURATIONS),
    targetAmount: baseAmount,
    currentAmount: currentAmount,
    expectedReturn: getRandomPercentage(),
    investorCount: getRandomNumber(15, 100),
    status: getRandomItem(['active', 'active', 'active', 'completed']), // 75% active, 25% completed
    insured: getRandomItem([true, true, false]), // 67% insured, 33% not insured
    endDate: new Date(Date.now() + getRandomNumber(30, 365) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    minInvestment: Math.floor(baseAmount * 0.01), // 1% of target amount
    description: `Truck transportation services for ${selectedCompany.name} with reliable logistics and delivery services across India.`,
    highlights: [
      'Reliable transportation',
      'On-time delivery',
      'Professional drivers',
      'GPS tracking'
    ],
    category: getRandomItem(['Full Load', 'Part Load', 'Express Delivery', 'Heavy Transport', 'Multi-city']),
    managementFee: `${getRandomNumber(1, 3)}%`,
    projectLeader: getRandomItem(PROJECT_LEADERS),
    startDate: new Date(Date.now() - getRandomNumber(1, 180) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    exitStrategy: 'Trip completion and delivery confirmation',
    pastPerformance: `${getRandomNumber(95, 99)}% on-time delivery rate`,
    tags: ['india', 'transport', getRandomItem(['logistics', 'delivery', 'freight', 'cargo'])],
    companyLogo: selectedCompany.logo
  };
};

export interface TripData {
  id: number;
  name: string;
  location: string;
  duration: string;
  targetAmount: number;
  currentAmount: number;
  expectedReturn: string;
  investorCount: number;
  status: string;
  endDate: string;
  minInvestment: number;
  description: string;
  highlights: string[];
  insured: boolean;
  // Additional fields from Excel
  startDate?: string;
  category?: string;
  managementFee?: string;
  exitStrategy?: string;
  pastPerformance?: string;
  region?: string;
  projectLeader?: string;
  documents?: string[];
  tags?: string[];
  // Company logo information
  companyLogo?: string;
}

export const readTripExcelFile = async (filePath: string): Promise<TripData[]> => {
  try {
    // For browser environment, we'll create a function to read from public folder
    const response = await fetch('/trip-summary-report.xlsx');
    const arrayBuffer = await response.arrayBuffer();

    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Skip header row and process data
    const headers = jsonData[0] as string[];
    const dataRows = jsonData.slice(1) as any[][];

    const trips: TripData[] = dataRows.map((row, index) => {
      const rowData: any = {};
      headers.forEach((header, colIndex) => {
        rowData[header] = row[colIndex];
      });

      // Generate fallback data for this row
      const fallbackData = generateFallbackTripData(index);

      // Map Excel columns to our TripData interface with comprehensive fallbacks
      const tripData: TripData = {
        id: index + 1,
        name: safeParseString(
          rowData['Trip Name'] || rowData['Name'] || rowData['Project Name'],
          fallbackData.name!
        ),
        companyLogo: safeParseString(
          rowData['Company Logo'] || rowData['Logo'],
          fallbackData.companyLogo!
        ),
        location: safeParseString(
          rowData['Location'] || rowData['Region'],
          fallbackData.location!
        ),
        duration: safeParseString(
          rowData['Duration'] || rowData['Project Duration'],
          fallbackData.duration!
        ),
        targetAmount: safeParseNumber(
          rowData['Target Amount'] || rowData['Target'],
          fallbackData.targetAmount!
        ),
        currentAmount: safeParseNumber(
          rowData['Current Amount'] || rowData['Raised'],
          fallbackData.currentAmount!
        ),
        expectedReturn: safeParseString(
          rowData['Expected Return'] || rowData['Return'],
          fallbackData.expectedReturn!
        ),
        investorCount: safeParseNumber(
          rowData['Investor Count'] || rowData['Investors'],
          fallbackData.investorCount!
        ),
        status: safeParseString(
          rowData['Status'],
          fallbackData.status!
        ),
        insured: safeParseBool(
          rowData['Insured'],
          fallbackData.insured!
        ),
        endDate: safeParseString(
          rowData['End Date'] || rowData['Deadline'],
          fallbackData.endDate!
        ),
        minInvestment: safeParseNumber(
          rowData['Min Investment'] || rowData['Minimum'],
          fallbackData.minInvestment!
        ),
        description: safeParseString(
          rowData['Description'],
          fallbackData.description!
        ),
        highlights: safeParseArray(
          rowData['Highlights'],
          fallbackData.highlights!
        ),

        // Additional fields with fallbacks
        startDate: safeParseString(
          rowData['Start Date'] || rowData['Launch Date'],
          fallbackData.startDate!
        ),
        category: safeParseString(
          rowData['Category'] || rowData['Type'],
          fallbackData.category!
        ),
        managementFee: safeParseString(
          rowData['Management Fee'] || rowData['Fee'],
          fallbackData.managementFee!
        ),
        exitStrategy: safeParseString(
          rowData['Exit Strategy'] || rowData['Exit'],
          fallbackData.exitStrategy!
        ),
        pastPerformance: safeParseString(
          rowData['Past Performance'] || rowData['Performance'],
          fallbackData.pastPerformance!
        ),
        region: safeParseString(
          rowData['Region'] || rowData['Area'],
          fallbackData.location! // Use location as region fallback
        ),
        projectLeader: safeParseString(
          rowData['Project Leader'] || rowData['Manager'],
          fallbackData.projectLeader!
        ),
        documents: safeParseArray(
          rowData['Documents'],
          ['Investment Proposal.pdf', 'Financial Projections.xlsx']
        ),
        tags: safeParseArray(
          rowData['Tags'],
          fallbackData.tags!
        )
      };

      return tripData;
    }).filter(trip => trip.name && trip.name !== ''); // Filter out empty rows

    return trips;
  } catch (error) {
    console.error('Error reading Excel file:', error);
    throw new Error('Failed to read trip data from Excel file');
  }
};

// Fallback function with enhanced data if Excel reading fails
export const getFallbackTripData = (): TripData[] => {
  return Array.from({ length: 5 }, (_, index) => {
    const fallbackData = generateFallbackTripData(index);
    return {
      id: index + 1,
      ...fallbackData
    } as TripData;
  });
};