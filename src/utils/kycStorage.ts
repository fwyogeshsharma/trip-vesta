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

export interface KYCData {
  id: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  currentStep: number;
  personalInfo: PersonalInfo;
  addressInfo: AddressInfo;
  documentInfo: DocumentInfo;
  bankInfo: BankInfo;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

const KYC_STORAGE_KEY = 'trip-vesta-kyc';
const USER_ID = 'user_123'; // In real app, get from auth context

export class KYCStorage {
  // Get KYC data from localStorage
  static getKYCData(): KYCData | null {
    try {
      const stored = localStorage.getItem(KYC_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
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

    return Math.round((completedFields / totalFields) * 100);
  }

  // Check if KYC is complete
  static isKYCComplete(): boolean {
    return this.getCompletionPercentage() === 100;
  }

  // Clear KYC data
  static clearKYCData(): void {
    localStorage.removeItem(KYC_STORAGE_KEY);
  }
}