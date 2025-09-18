export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  nationality: string;
  fatherName: string;
  motherName: string;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  occupation: string;
  annualIncome: string;
}

export interface AddressInfo {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  residenceType: 'owned' | 'rented' | 'family';
  yearsAtAddress: string;
}

export interface DocumentInfo {
  panNumber: string;
  panDocument?: File;
  aadharNumber: string;
  aadharFront?: File;
  aadharBack?: File;
  drivingLicense?: string;
  drivingLicenseDocument?: File;
  passport?: string;
  passportDocument?: File;
  selfie?: File;
  addressProof?: File;
  addressProofType: 'utility_bill' | 'bank_statement' | 'rent_agreement' | 'other';
}

export interface BankInfo {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  accountType: 'savings' | 'current' | 'salary';
  chequeDocument?: File;
  bankStatement?: File;
}

export interface VideoVerificationInfo {
  verificationPhrase: string;
  selectedLanguage: 'english' | 'hindi';
  videoFile?: File;
  isVerified: boolean;
  recordingStarted?: boolean;
  recordingCompleted?: boolean;
  uploadCompleted?: boolean;
}

export interface KYCData {
  id: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  currentStep: number;
  personalInfo: PersonalInfo;
  addressInfo: AddressInfo;
  documentInfo: DocumentInfo;
  bankInfo: BankInfo;
  videoVerification: VideoVerificationInfo;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

const KYC_STORAGE_KEY = 'trip-vesta-kyc';
const USER_ID = 'user_123'; // In real app, get from auth context

// Natural conversational phrases for verification - Real expressions people use daily
const ENGLISH_VERIFICATION_PHRASES = [
  'I am here today', 'this is my real name', 'I live in this city', 'my phone number is correct',
  'I work every day', 'my family is important', 'I need this account', 'this is my address',
  'I save money monthly', 'my job pays well', 'I trust this bank', 'this card belongs to me',
  'I came here myself', 'my age is correct', 'I understand the rules', 'this is my signature',
  'I have all papers', 'my details are true', 'I earn honest money', 'this is really me',
  'I want to invest', 'my income is good', 'I know what I am doing', 'this process is important',
  'I agree to everything', 'my information is correct', 'I read all terms', 'this is my choice',
  'I will follow rules', 'my documents are real', 'I am telling truth', 'this helps my future',
  'I work hard daily', 'my family needs this', 'I save for tomorrow', 'this is my plan',
  'I respect the law', 'my business is legal', 'I pay all taxes', 'this is my right',
  'I came alone today', 'my decision is final', 'I know the risks', 'this investment suits me'
];

const HINDI_VERIFICATION_PHRASES = [
  'मैं आज यहाँ हूँ', 'यह मेरा सच्चा नाम है', 'मैं इस शहर में रहता हूँ', 'मेरा फोन नंबर सही है',
  'मैं रोज काम करता हूँ', 'मेरा परिवार महत्वपूर्ण है', 'मुझे यह खाता चाहिए', 'यह मेरा पता है',
  'मैं हर महीने पैसा बचाता हूँ', 'मेरी नौकरी अच्छी है', 'मैं इस बैंक पर भरोसा करता हूँ', 'यह कार्ड मेरा है',
  'मैं खुद यहाँ आया हूँ', 'मेरी उम्र सही है', 'मैं नियम समझता हूँ', 'यह मेरा साइन है',
  'मेरे पास सभी कागज हैं', 'मेरी जानकारी सच्ची है', 'मैं ईमानदारी से पैसा कमाता हूँ', 'यह वाकई मैं हूँ',
  'मैं निवेश करना चाहता हूँ', 'मेरी आमदनी अच्छी है', 'मैं जानता हूँ कि मैं क्या कर रहा हूँ', 'यह प्रक्रिया जरूरी है',
  'मैं सब कुछ मानता हूँ', 'मेरी जानकारी सही है', 'मैंने सभी नियम पढ़े हैं', 'यह मेरा चुनाव है',
  'मैं नियमों का पालन करूंगा', 'मेरे दस्तावेज असली हैं', 'मैं सच कह रहा हूँ', 'यह मेरे भविष्य के लिए है',
  'मैं रोज मेहनत करता हूँ', 'मेरे परिवार को इसकी जरूरत है', 'मैं कल के लिए बचत करता हूँ', 'यह मेरी योजना है',
  'मैं कानून का सम्मान करता हूँ', 'मेरा धंधा कानूनी है', 'मैं सभी टैक्स देता हूँ', 'यह मेरा हक है',
  'मैं आज अकेला आया हूँ', 'मेरा फैसला अंतिम है', 'मैं जोखिम जानता हूँ', 'यह निवेश मेरे लिए सही है'
];

const generateRandomPhrase = (language: 'english' | 'hindi' = 'english'): string => {
  const phrases = language === 'hindi' ? HINDI_VERIFICATION_PHRASES : ENGLISH_VERIFICATION_PHRASES;

  // Generate exactly 2 lines with 4-6 natural phrases each
  const line1Phrases: string[] = [];
  const line2Phrases: string[] = [];

  // First line: 4-6 phrases
  const line1PhraseCount = Math.floor(Math.random() * 3) + 4; // 4-6 phrases
  for (let i = 0; i < line1PhraseCount; i++) {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    line1Phrases.push(phrases[randomIndex]);
  }

  // Second line: 4-6 phrases
  const line2PhraseCount = Math.floor(Math.random() * 3) + 4; // 4-6 phrases
  for (let i = 0; i < line2PhraseCount; i++) {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    line2Phrases.push(phrases[randomIndex]);
  }

  // Join phrases with commas and end with periods
  const line1 = line1Phrases.join(', ') + '.';
  const line2 = line2Phrases.join(', ') + '.';

  return `${line1}\n${line2}`;
};

export class KYCStorage {
  // Get KYC data from localStorage
  static getKYCData(): KYCData | null {
    try {
      const stored = localStorage.getItem(KYC_STORAGE_KEY);
      if (!stored) return null;

      const kycData = JSON.parse(stored);

      // Migration: Add videoVerification field if it doesn't exist
      if (!kycData.videoVerification) {
        kycData.videoVerification = {
          verificationPhrase: generateRandomPhrase('english'),
          selectedLanguage: 'english',
          isVerified: false,
          recordingStarted: false,
          recordingCompleted: false,
          uploadCompleted: false
        };
        // Save the updated data back to localStorage
        this.saveKYCData(kycData);
      }

      // Migration: Add selectedLanguage if it doesn't exist
      if (!kycData.videoVerification.selectedLanguage) {
        kycData.videoVerification.selectedLanguage = 'english';
        this.saveKYCData(kycData);
      }

      return kycData;
    } catch (error) {
      console.error('Error loading KYC data from localStorage:', error);
      return null;
    }
  }

  // Initialize KYC data
  static initializeKYC(): KYCData {
    const now = new Date().toISOString();
    const kycData: KYCData = {
      id: USER_ID,
      status: 'not_started',
      currentStep: 1,
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: 'male',
        nationality: 'Indian',
        fatherName: '',
        motherName: '',
        maritalStatus: 'single',
        occupation: '',
        annualIncome: ''
      },
      addressInfo: {
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pinCode: '',
        country: 'India',
        residenceType: 'owned',
        yearsAtAddress: ''
      },
      documentInfo: {
        panNumber: '',
        aadharNumber: '',
        addressProofType: 'utility_bill'
      },
      bankInfo: {
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        branchName: '',
        accountType: 'savings'
      },
      videoVerification: {
        verificationPhrase: generateRandomPhrase('english'),
        selectedLanguage: 'english',
        isVerified: false,
        recordingStarted: false,
        recordingCompleted: false,
        uploadCompleted: false
      },
      createdAt: now,
      updatedAt: now
    };

    this.saveKYCData(kycData);
    return kycData;
  }

  // Save KYC data to localStorage
  static saveKYCData(kycData: KYCData): void {
    try {
      kycData.updatedAt = new Date().toISOString();
      localStorage.setItem(KYC_STORAGE_KEY, JSON.stringify(kycData));
    } catch (error) {
      console.error('Error saving KYC data to localStorage:', error);
    }
  }

  // Update specific section of KYC data
  static updateKYCSection(section: keyof KYCData, data: any): void {
    const kycData = this.getKYCData() || this.initializeKYC();
    (kycData as any)[section] = data;
    kycData.status = 'in_progress';
    this.saveKYCData(kycData);
  }

  // Update KYC status
  static updateKYCStatus(status: KYCData['status'], rejectionReason?: string): void {
    const kycData = this.getKYCData();
    if (kycData) {
      kycData.status = status;
      kycData.updatedAt = new Date().toISOString();

      if (status === 'submitted') {
        kycData.submittedAt = new Date().toISOString();
      } else if (status === 'approved') {
        kycData.approvedAt = new Date().toISOString();
      } else if (status === 'rejected') {
        kycData.rejectedAt = new Date().toISOString();
        kycData.rejectionReason = rejectionReason;
      }

      this.saveKYCData(kycData);
    }
  }

  // Get KYC completion percentage
  static getCompletionPercentage(): number {
    const kycData = this.getKYCData();
    if (!kycData) return 0;

    // Ensure all required fields exist
    if (!kycData.personalInfo || !kycData.addressInfo || !kycData.documentInfo || !kycData.bankInfo) {
      return 0;
    }

    let completedFields = 0;
    let totalFields = 0;

    // Personal Info (10 required fields)
    const personalRequired = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'fatherName', 'motherName', 'occupation', 'annualIncome'];
    personalRequired.forEach(field => {
      totalFields++;
      if ((kycData.personalInfo as any)[field]) completedFields++;
    });

    // Address Info (7 required fields)
    const addressRequired = ['addressLine1', 'city', 'state', 'pinCode', 'yearsAtAddress'];
    addressRequired.forEach(field => {
      totalFields++;
      if ((kycData.addressInfo as any)[field]) completedFields++;
    });

    // Document Info (2 required fields)
    const documentRequired = ['panNumber', 'aadharNumber'];
    documentRequired.forEach(field => {
      totalFields++;
      if ((kycData.documentInfo as any)[field]) completedFields++;
    });

    // Bank Info (6 required fields)
    const bankRequired = ['accountHolderName', 'accountNumber', 'ifscCode', 'bankName', 'branchName'];
    bankRequired.forEach(field => {
      totalFields++;
      if ((kycData.bankInfo as any)[field]) completedFields++;
    });

    // Video Verification (1 required field)
    totalFields++;
    if (kycData.videoVerification?.isVerified) completedFields++;

    return Math.round((completedFields / totalFields) * 100);
  }

  // Check if KYC is complete
  static isKYCComplete(): boolean {
    return this.getCompletionPercentage() === 100;
  }

  // Generate new verification phrase
  static generateNewVerificationPhrase(language: 'english' | 'hindi' = 'english'): string {
    return generateRandomPhrase(language);
  }

  // Update video verification status
  static updateVideoVerificationStatus(status: Partial<VideoVerificationInfo>): void {
    const kycData = this.getKYCData();
    if (kycData) {
      // Ensure videoVerification exists
      if (!kycData.videoVerification) {
        kycData.videoVerification = {
          verificationPhrase: generateRandomPhrase('english'),
          selectedLanguage: 'english',
          isVerified: false,
          recordingStarted: false,
          recordingCompleted: false,
          uploadCompleted: false
        };
      }
      kycData.videoVerification = { ...kycData.videoVerification, ...status };
      this.saveKYCData(kycData);
    }
  }

  // Clear KYC data
  static clearKYCData(): void {
    localStorage.removeItem(KYC_STORAGE_KEY);
  }
}