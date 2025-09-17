export interface InvestmentData {
  id: number;
  tripName: string;
  amount: number;
  investedDate: string;
  tripStartDate: string;
  expectedEndDate: string;
  status: "active" | "completed" | "upcoming";
  progress: number;
  daysRemaining: number;
  profitCredited: number;
  originalTripId: number; // Reference to the original trip
  companyLogo?: string; // Company logo path
  milestones: Array<{
    id: number;
    name: string;
    icon: any;
    status: "completed" | "current" | "pending";
    date: string;
  }>;
}

const INVESTMENTS_STORAGE_KEY = 'trip-vesta-investments';
const INVESTED_TRIPS_STORAGE_KEY = 'trip-vesta-invested-trips';

export class InvestmentStorage {
  // Get all user investments from localStorage
  static getInvestments(): InvestmentData[] {
    try {
      const stored = localStorage.getItem(INVESTMENTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading investments from localStorage:', error);
      return [];
    }
  }

  // Save investments to localStorage
  static saveInvestments(investments: InvestmentData[]): void {
    try {
      localStorage.setItem(INVESTMENTS_STORAGE_KEY, JSON.stringify(investments));
    } catch (error) {
      console.error('Error saving investments to localStorage:', error);
    }
  }

  // Add a new investment
  static addInvestment(investment: InvestmentData): void {
    const investments = this.getInvestments();
    investments.push(investment);
    this.saveInvestments(investments);

    // Also track which trip IDs have been invested in
    this.addInvestedTripId(investment.originalTripId);
  }

  // Get list of trip IDs that have been invested in
  static getInvestedTripIds(): number[] {
    try {
      const stored = localStorage.getItem(INVESTED_TRIPS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading invested trip IDs from localStorage:', error);
      return [];
    }
  }

  // Add a trip ID to the invested list
  static addInvestedTripId(tripId: number): void {
    const investedIds = this.getInvestedTripIds();
    if (!investedIds.includes(tripId)) {
      investedIds.push(tripId);
      try {
        localStorage.setItem(INVESTED_TRIPS_STORAGE_KEY, JSON.stringify(investedIds));
      } catch (error) {
        console.error('Error saving invested trip ID to localStorage:', error);
      }
    }
  }

  // Check if a trip has been invested in
  static isTripInvested(tripId: number): boolean {
    return this.getInvestedTripIds().includes(tripId);
  }

  // Update investment progress (for simulation purposes)
  static updateInvestmentProgress(investmentId: number, progress: number): void {
    const investments = this.getInvestments();
    const investment = investments.find(inv => inv.id === investmentId);
    if (investment) {
      investment.progress = progress;
      // Update days remaining based on progress
      const totalDays = this.calculateTotalDays(investment.tripStartDate, investment.expectedEndDate);
      investment.daysRemaining = Math.max(0, Math.round(totalDays * (1 - progress / 100)));

      // Update status based on progress
      if (progress >= 100) {
        investment.status = "completed";
        investment.daysRemaining = 0;
      } else if (progress > 0) {
        investment.status = "active";
      }

      this.saveInvestments(investments);
    }
  }

  // Calculate total days between two dates
  private static calculateTotalDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Clear all investments (for testing)
  static clearAllInvestments(): void {
    localStorage.removeItem(INVESTMENTS_STORAGE_KEY);
    localStorage.removeItem(INVESTED_TRIPS_STORAGE_KEY);
  }
}