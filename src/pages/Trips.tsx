import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TripMilestones } from "@/components/TripMilestones";
import {
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  ShoppingCart,
  MapIcon,
  Plane,
  Luggage,
  Building,
  FileText,
  PlayCircle,
  Lock,
  Timer,
  Loader2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  LayoutList,
  LayoutGrid
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TripLockService } from "@/services/tripLockService";
import { useTripData } from "@/hooks/useTripData";
import { TripData } from "@/utils/excelReader";
import { InvestmentStorage, InvestmentData } from "@/utils/investmentStorage";
import { useWallet } from "@/contexts/WalletContext";

// Trip data loaded from Excel file

const myInvestments = [
  {
    id: 1,
    tripName: "Santorini Sunset",
    amount: 207500,
    investedDate: "2024-09-15",
    tripStartDate: "2024-09-20",
    expectedEndDate: "2024-12-01",
    status: "active",
    progress: 75,
    daysRemaining: 47,
    profitCredited: 0, // Active trips don't have profit yet
    milestones: [
      { id: 1, name: "Trip Started", icon: PlayCircle, status: "completed" as const, date: "2024-09-20" },
      { id: 2, name: "Bookings Confirmed", icon: Calendar, status: "completed" as const, date: "2024-09-25" },
      { id: 3, name: "Travel Arrangements", icon: Plane, status: "completed" as const, date: "2024-10-01" },
      { id: 4, name: "Accommodation Ready", icon: Building, status: "completed" as const, date: "2024-10-05" },
      { id: 5, name: "Service Delivery", icon: MapIcon, status: "current" as const, date: "2024-10-15" },
      { id: 6, name: "Trip Completion", icon: CheckCircle, status: "pending" as const, date: "2024-11-20" },
      { id: 7, name: "Invoice Processing", icon: FileText, status: "pending" as const, date: "2024-11-25" },
      { id: 8, name: "Returns Distributed", icon: DollarSign, status: "pending" as const, date: "2024-12-01" }
    ]
  },
  {
    id: 2,
    tripName: "African Safari",
    amount: 415000,
    investedDate: "2024-08-20",
    tripStartDate: "2024-08-25",
    expectedEndDate: "2024-10-20",
    status: "completed",
    progress: 100,
    daysRemaining: 0,
    profitCredited: 74700, // 18% profit on 415000
    milestones: [
      { id: 1, name: "Trip Started", icon: PlayCircle, status: "completed" as const, date: "2024-08-25" },
      { id: 2, name: "Bookings Confirmed", icon: Calendar, status: "completed" as const, date: "2024-08-30" },
      { id: 3, name: "Travel Arrangements", icon: Plane, status: "completed" as const, date: "2024-09-05" },
      { id: 4, name: "Accommodation Ready", icon: Building, status: "completed" as const, date: "2024-09-10" },
      { id: 5, name: "Service Delivery", icon: MapIcon, status: "completed" as const, date: "2024-09-25" },
      { id: 6, name: "Trip Completion", icon: CheckCircle, status: "completed" as const, date: "2024-10-15" },
      { id: 7, name: "Invoice Processing", icon: FileText, status: "completed" as const, date: "2024-10-18" },
      { id: 8, name: "Returns Distributed", icon: DollarSign, status: "completed" as const, date: "2024-10-20" }
    ]
  },
  {
    id: 3,
    tripName: "Berger Paints",
    amount: 99600,
    investedDate: "2024-08-28",
    tripStartDate: "2024-09-01",
    expectedEndDate: "2024-12-15",
    status: "active",
    progress: 60,
    daysRemaining: 61,
    profitCredited: 0, // Active trips don't have profit yet
    milestones: [
      { id: 1, name: "Trip Started", icon: PlayCircle, status: "completed" as const, date: "2024-09-01" },
      { id: 2, name: "Bookings Confirmed", icon: Calendar, status: "completed" as const, date: "2024-09-08" },
      { id: 3, name: "Travel Arrangements", icon: Plane, status: "completed" as const, date: "2024-09-15" },
      { id: 4, name: "Accommodation Ready", icon: Building, status: "current" as const, date: "2024-10-20" },
      { id: 5, name: "Service Delivery", icon: MapIcon, status: "pending" as const, date: "2024-11-01" },
      { id: 6, name: "Trip Completion", icon: CheckCircle, status: "pending" as const, date: "2024-12-01" },
      { id: 7, name: "Invoice Processing", icon: FileText, status: "pending" as const, date: "2024-12-10" },
      { id: 8, name: "Returns Distributed", icon: DollarSign, status: "pending" as const, date: "2024-12-15" }
    ]
  }
];

const Trips = () => {
  const { walletData, deductFromBalance } = useWallet();

  // Add custom styles for responsive trip cards
  const tripCardStyles = `
    .trip-card {
      min-height: 200px;
      max-height: 400px;
    }
    .trip-card .card-header {
      padding: 0.75rem;
      padding-bottom: 0.5rem;
    }
    .trip-card .card-content {
      padding: 0.75rem;
      padding-top: 0;
    }
    @media (max-width: 1023px) {
      .trip-grid { grid-template-columns: 1fr !important; }
    }
    @media (min-width: 1024px) {
      .trip-grid { grid-template-columns: 1fr !important; }
    }
  `;

  // Inject styles
  if (typeof document !== 'undefined' && !document.getElementById('trip-card-styles')) {
    const style = document.createElement('style');
    style.id = 'trip-card-styles';
    style.textContent = tripCardStyles;
    document.head.appendChild(style);
  }
  const { toast } = useToast();

  // Load trip data from Excel file
  const { trips: availableTrips, loading: tripsLoading, error: tripsError } = useTripData();

  const [selectedTrips, setSelectedTrips] = useState<Set<number>>(new Set());
  // const [investmentAmounts, setInvestmentAmounts] = useState<Record<number, string>>({});
  const [isInvesting, setIsInvesting] = useState(false);
  // const [bulkInvestmentAmount, setBulkInvestmentAmount] = useState("");

  // Trip locking and payment states
  const [lockedTrips, setLockedTrips] = useState<Set<number>>(new Set());
  const [processingTrips, setProcessingTrips] = useState<Set<number>>(new Set());
  const [tripLockTimers, setTripLockTimers] = useState<Record<number, number>>({});
  const [currentUserId] = useState("user_123"); // In real app, get from auth context
  const [reservationIds, setReservationIds] = useState<Record<number, string>>({});

  // Collapsible milestones state - default collapsed (all IDs in set)
  const [collapsedMilestones, setCollapsedMilestones] = useState<Set<number>>(
    new Set(myInvestments.map(inv => inv.id))
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [tripsPerPage, setTripsPerPage] = useState(10); // Number of trips per page

  // My Investments pagination state
  const [myInvestmentsCurrentPage, setMyInvestmentsCurrentPage] = useState(1);
  const [myInvestmentsPerPage, setMyInvestmentsPerPage] = useState(10);

  // My Investments filter state
  const [myInvestmentsFilters, setMyInvestmentsFilters] = useState({
    status: 'all',
    tripName: '',
    dateRange: 'all'
  });

  // Common compact view toggle
  const [compactView, setCompactView] = useState(false);

  // Dynamic investments from localStorage
  const [userInvestments, setUserInvestments] = useState<InvestmentData[]>([]);

  // Filter state
  const [filters, setFilters] = useState({
    status: 'all',
    startRoute: '',
    endRoute: '',
    tripName: '',
    minDuration: '',
    maxDuration: '',
    startDate: '',
    endDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showMyInvestmentsFilters, setShowMyInvestmentsFilters] = useState(false);

  // Load user investments from localStorage on mount
  useEffect(() => {
    const loadInvestments = () => {
      const investments = InvestmentStorage.getInvestments();
      setUserInvestments(investments);

      // Resume progress simulation for active investments
      investments.forEach((investment) => {
        if (investment.status === "active" && investment.progress < 100) {
          simulateInvestmentProgress(investment.id, Math.random() * 5000); // Random delay 0-5s
        }
      });
    };

    loadInvestments();
  }, []);

  // Update locked trips periodically
  useEffect(() => {
    const updateLockedTrips = () => {
      const currentlyLocked = TripLockService.getLockedTrips();
      setLockedTrips(new Set(currentlyLocked));
    };

    // Initial update
    updateLockedTrips();

    // Update every 30 seconds
    const interval = setInterval(updateLockedTrips, 30000);

    return () => clearInterval(interval);
  }, []);

  // Cleanup reservations on component unmount
  useEffect(() => {
    return () => {
      // Cancel any active reservations when component unmounts
      Object.entries(reservationIds).forEach(([tripId, reservationId]) => {
        TripLockService.cancelReservation(reservationId, currentUserId);
      });
    };
  }, [reservationIds, currentUserId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "completed":
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      case "upcoming":
        return <Badge variant="secondary">Upcoming</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getProgress = (current: number, target: number) => {
    return Math.round((current / target) * 100);
  };

  // Helper function to convert a trip to investment data
  const createInvestmentFromTrip = (trip: TripData, investmentId: number): InvestmentData => {
    const today = new Date().toISOString().split('T')[0];
    const endDate = trip.endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Default 90 days from now

    return {
      id: investmentId,
      tripName: trip.name,
      amount: trip.targetAmount,
      investedDate: today,
      tripStartDate: trip.startDate || today,
      expectedEndDate: endDate,
      status: "active",
      progress: 0, // Start at 0%
      daysRemaining: Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      profitCredited: 0,
      originalTripId: trip.id,
      milestones: [
        { id: 1, name: "Trip Started", icon: PlayCircle, status: "completed", date: today },
        { id: 2, name: "Bookings Confirmed", icon: Calendar, status: "current", date: today },
        { id: 3, name: "Travel Arrangements", icon: Plane, status: "pending", date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
        { id: 4, name: "Accommodation Ready", icon: Building, status: "pending", date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
        { id: 5, name: "Service Delivery", icon: MapIcon, status: "pending", date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
        { id: 6, name: "Trip Completion", icon: CheckCircle, status: "pending", date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
        { id: 7, name: "Invoice Processing", icon: FileText, status: "pending", date: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
        { id: 8, name: "Returns Distributed", icon: DollarSign, status: "pending", date: endDate }
      ]
    };
  };

  // Simulate investment progress over time
  const simulateInvestmentProgress = (investmentId: number, delay: number = 0) => {
    setTimeout(() => {
      const updateProgress = () => {
        const currentInvestments = InvestmentStorage.getInvestments();
        const investment = currentInvestments.find(inv => inv.id === investmentId);

        if (investment && investment.progress < 100) {
          // Increment progress by 5-15% randomly
          const increment = Math.floor(Math.random() * 11) + 5; // 5-15
          const newProgress = Math.min(100, investment.progress + increment);

          InvestmentStorage.updateInvestmentProgress(investmentId, newProgress);

          // Update local state
          setUserInvestments(prev => prev.map(inv =>
            inv.id === investmentId
              ? { ...inv, progress: newProgress, status: newProgress >= 100 ? "completed" : "active" }
              : inv
          ));

          // Continue updating if not complete
          if (newProgress < 100) {
            // Next update in 10-30 seconds
            const nextInterval = (Math.floor(Math.random() * 21) + 10) * 1000;
            setTimeout(updateProgress, nextInterval);
          } else {
            // Investment completed, calculate profit
            const profit = Math.floor(investment.amount * 0.15); // 15% profit
            InvestmentStorage.updateInvestmentProgress(investmentId, 100);

            // Update with profit
            setUserInvestments(prev => prev.map(inv =>
              inv.id === investmentId
                ? { ...inv, progress: 100, status: "completed", profitCredited: profit, daysRemaining: 0 }
                : inv
            ));

            toast({
              title: "Investment Completed!",
              description: `Your investment in ${investment.tripName} is complete. Profit of ₹${profit.toLocaleString()} has been credited.`,
            });
          }
        }
      };

      // Start the progress updates
      updateProgress();
    }, delay);
  };

  const handleTripSelection = async (tripId: number, checked: boolean) => {
    if (checked) {
      // Check if trip is available before selecting
      if (!TripLockService.isTripAvailable(tripId, currentUserId)) {
        toast({
          title: "Trip Unavailable",
          description: "This trip is currently being processed by another investor",
          variant: "destructive"
        });
        return;
      }

      // Try to lock the trip
      const lockResult = TripLockService.lockTrip(tripId, currentUserId);

      if (!lockResult.success) {
        toast({
          title: "Cannot Select Trip",
          description: lockResult.message,
          variant: "destructive"
        });
        return;
      }

      // Successfully locked, add to selection
      const newSelected = new Set(selectedTrips);
      newSelected.add(tripId);
      setSelectedTrips(newSelected);

      toast({
        title: "Trip Reserved",
        description: "Trip reserved for 10 minutes while you complete your investment",
      });

    } else {
      // Release lock when unchecking
      const reservationId = reservationIds[tripId];
      if (reservationId) {
        TripLockService.cancelReservation(reservationId, currentUserId);

        const newReservationIds = { ...reservationIds };
        delete newReservationIds[tripId];
        setReservationIds(newReservationIds);
      } else {
        // Just release the lock if no reservation
        const lockInfo = TripLockService.getLockInfo(tripId);
        if (lockInfo) {
          TripLockService.releaseLock(tripId, currentUserId, lockInfo.sessionId);
        }
      }

      const newSelected = new Set(selectedTrips);
      newSelected.delete(tripId);
      setSelectedTrips(newSelected);

      // Remove investment amount when unchecked
      // const newAmounts = { ...investmentAmounts };
      // delete newAmounts[tripId];
      // setInvestmentAmounts(newAmounts);
    }
  };

  // const handleAmountChange = (tripId: number, amount: string) => {
  //   setInvestmentAmounts(prev => ({
  //     ...prev,
  //     [tripId]: amount
  //   }));
  // };

  const handleInvestInSelected = async () => {
    if (selectedTrips.size === 0) {
      toast({
        title: "No Trips Selected",
        description: "Please select at least one trip to invest in",
        variant: "destructive"
      });
      return;
    }

    // Validate amounts - check if any trip has no amount set
    // const invalidAmounts = Array.from(selectedTrips).filter(tripId => {
    //   const amount = parseFloat(investmentAmounts[tripId] || "0");
    //   return amount === 0; // Only require some amount to be entered, minimum will be enforced during processing
    // });

    // if (invalidAmounts.length > 0) {
    //   toast({
    //     title: "Invalid Investment Amounts",
    //     description: "Please enter valid amounts for all selected trips",
    //     variant: "destructive"
    //   });
    //   return;
    // }

    // Check if user has sufficient balance
    const totalAmount = getTotalInvestment();
    if (walletData.balance < totalAmount) {
      toast({
        title: "Insufficient Balance",
        description: `You need ₹${totalAmount.toLocaleString()} but only have ₹${walletData.balance.toLocaleString()} in your wallet.`,
        variant: "destructive"
      });
      return;
    }

    setIsInvesting(true);

    try {
      // Create payment reservations for all selected trips
      const newReservationIds: Record<number, string> = {};

      for (const tripId of selectedTrips) {
        const trip = availableStatusTrips.find(t => t.id === tripId);
        const effectiveAmount = trip?.targetAmount || 0; // Invest full trip amount

        // Verify trip is still available
        if (!TripLockService.isTripAvailable(tripId, currentUserId)) {
          throw new Error(`Trip ${tripId} is no longer available`);
        }

        // Create reservation with full trip amount
        const reservationResult = TripLockService.createReservation(tripId, currentUserId, effectiveAmount);

        if (!reservationResult.success) {
          throw new Error(`Failed to reserve trip ${tripId}: ${reservationResult.message}`);
        }

        newReservationIds[tripId] = reservationResult.reservationId!;

        // Update reservation status to processing
        TripLockService.updateReservationStatus(reservationResult.reservationId!, 'processing');
      }

      setReservationIds(newReservationIds);
      setProcessingTrips(new Set(selectedTrips));

      // Simulate payment processing
      toast({
        title: "Processing Payment",
        description: "Your payment is being processed. Please wait...",
      });

      await new Promise(resolve => setTimeout(resolve, 3000));

      // Deduct amount from wallet balance
      const balanceDeducted = deductFromBalance(totalAmount);

      if (!balanceDeducted) {
        throw new Error("Failed to deduct amount from wallet balance");
      }

      // Complete all reservations and create investments
      const newInvestments: InvestmentData[] = [];
      let nextInvestmentId = Math.max(0, ...userInvestments.map(inv => inv.id)) + 1;

      for (const [tripId, reservationId] of Object.entries(newReservationIds)) {
        TripLockService.completeReservation(reservationId, currentUserId);

        // Find the trip and create investment data
        const trip = availableStatusTrips.find(t => t.id === parseInt(tripId));
        if (trip) {
          const investment = createInvestmentFromTrip(trip, nextInvestmentId++);
          InvestmentStorage.addInvestment(investment);
          newInvestments.push(investment);
        }
      }

      // Update local state with new investments
      setUserInvestments(prev => [...prev, ...newInvestments]);

      // Start progress simulation for new investments
      newInvestments.forEach((investment, index) => {
        simulateInvestmentProgress(investment.id, index * 1000); // Stagger the start times
      });

      toast({
        title: "Investment Successful",
        description: `Successfully invested ₹${totalAmount.toLocaleString()} across ${selectedTrips.size} trips`,
      });

      // Reset selections
      setSelectedTrips(new Set());
      // setInvestmentAmounts({});
      setReservationIds({});
      setProcessingTrips(new Set());

    } catch (error) {
      // Cancel all reservations on error
      Object.entries(reservationIds).forEach(([tripId, reservationId]) => {
        TripLockService.cancelReservation(reservationId, currentUserId);
      });

      toast({
        title: "Investment Failed",
        description: error instanceof Error ? error.message : "An error occurred during investment",
        variant: "destructive"
      });

      setReservationIds({});
      setProcessingTrips(new Set());
    } finally {
      setIsInvesting(false);
    }
  };

  const getTotalInvestment = () => {
    return Array.from(selectedTrips).reduce((sum, tripId) => {
      const trip = availableStatusTrips.find(t => t.id === tripId);
      const effectiveAmount = trip?.targetAmount || 0; // Full trip amount
      return sum + effectiveAmount;
    }, 0);
  };

  // const getEffectiveInvestmentAmount = (tripId: number) => {
  //   const amount = parseFloat(investmentAmounts[tripId] || "0");
  //   const trip = availableStatusTrips.find(t => t.id === tripId);
  //   const minAmount = trip?.minInvestment || 0;
  //   return Math.max(amount, minAmount);
  // };

  // const isAmountBelowMinimum = (tripId: number) => {
  //   const amount = parseFloat(investmentAmounts[tripId] || "0");
  //   const trip = availableStatusTrips.find(t => t.id === tripId);
  //   const minAmount = trip?.minInvestment || 0;
  //   return amount > 0 && amount < minAmount;
  // };

  // Helper functions for trip status
  const isTripLocked = (tripId: number) => {
    return lockedTrips.has(tripId) && !TripLockService.isTripAvailable(tripId, currentUserId);
  };

  const isTripSelectedByUser = (tripId: number) => {
    return selectedTrips.has(tripId);
  };

  const isTripProcessing = (tripId: number) => {
    return processingTrips.has(tripId);
  };

  const getTripLockStatus = (tripId: number) => {
    if (isTripProcessing(tripId)) {
      return { status: 'processing', message: 'Processing payment...' };
    }

    if (isTripSelectedByUser(tripId)) {
      return { status: 'reserved', message: 'Reserved by you' };
    }

    if (isTripLocked(tripId)) {
      const lockInfo = TripLockService.getLockInfo(tripId);
      if (lockInfo) {
        const timeRemaining = Math.ceil((lockInfo.expiresAt - Date.now()) / (1000 * 60));
        return {
          status: 'locked',
          message: `Locked by another user (${timeRemaining}m remaining)`
        };
      }
    }

    return { status: 'available', message: 'Available for investment' };
  };

  // Toggle milestone collapse state
  const toggleMilestoneCollapse = (investmentId: number) => {
    setCollapsedMilestones(prev => {
      const newSet = new Set(prev);
      if (newSet.has(investmentId)) {
        newSet.delete(investmentId);
      } else {
        newSet.add(investmentId);
      }
      return newSet;
    });
  };

  // Helper function to calculate remaining days for a trip
  const getRemainingDays = (endDate: string): number => {
    const today = new Date();
    const tripEndDate = new Date(endDate);
    const diffTime = tripEndDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Helper function to extract duration in days from duration string
  const getDurationInDays = (durationStr: string): number => {
    const match = durationStr.match(/(\d+)\s*(month|months)/i);
    if (match) {
      return parseInt(match[1]) * 30; // Approximate days in a month
    }
    return 0;
  };

  // Filter trips based on selected criteria and only show available/running/active trips
  // Also exclude trips that have already been invested in
  const availableStatusTrips = availableTrips.filter(trip =>
    ['available', 'running', 'active'].includes(trip.status.toLowerCase()) &&
    !InvestmentStorage.isTripInvested(trip.id)
  ).map(trip => ({
    ...trip,
    // Generate random investor count between 1-5 for display
    investorCount: Math.floor(Math.random() * 5) + 1,
    // Add max investment amount (typically 5-10x the minimum investment)
    maxInvestment: trip.minInvestment * (Math.floor(Math.random() * 6) + 5) // 5x to 10x multiplier
  }));

  const filteredTrips = availableStatusTrips.filter(trip => {
    // Status filter
    if (filters.status && filters.status !== 'all' && trip.status !== filters.status) return false;

    // Start route filter (beginning of route)
    if (filters.startRoute) {
      const routeParts = trip.location.split(' to ');
      const startLocation = routeParts[0]?.toLowerCase() || '';
      if (!startLocation.includes(filters.startRoute.toLowerCase())) return false;
    }

    // End route filter (end of route)
    if (filters.endRoute) {
      const routeParts = trip.location.split(' to ');
      const endLocation = routeParts[1]?.toLowerCase() || routeParts[0]?.toLowerCase() || '';
      if (!endLocation.includes(filters.endRoute.toLowerCase())) return false;
    }

    // Trip name filter
    if (filters.tripName && !trip.name.toLowerCase().includes(filters.tripName.toLowerCase())) return false;

    // Duration range filter
    const tripDurationDays = getDurationInDays(trip.duration);
    if (filters.minDuration && tripDurationDays < parseInt(filters.minDuration)) return false;
    if (filters.maxDuration && tripDurationDays > parseInt(filters.maxDuration)) return false;

    // Start date filter
    if (filters.startDate && trip.startDate) {
      const tripStartDate = new Date(trip.startDate);
      const filterStartDate = new Date(filters.startDate);
      if (tripStartDate < filterStartDate) return false;
    }

    // End date filter
    if (filters.endDate) {
      const tripEndDate = new Date(trip.endDate);
      const filterEndDate = new Date(filters.endDate);
      if (tripEndDate > filterEndDate) return false;
    }

    return true;
  });

  // Pagination logic
  const totalTrips = filteredTrips.length;
  const effectiveTripsPerPage = tripsPerPage === -1 ? totalTrips : tripsPerPage; // -1 means "all"
  const totalPages = tripsPerPage === -1 ? 1 : Math.ceil(totalTrips / tripsPerPage);
  const startIndex = tripsPerPage === -1 ? 0 : (currentPage - 1) * tripsPerPage;
  const endIndex = tripsPerPage === -1 ? totalTrips : startIndex + tripsPerPage;
  const currentTrips = filteredTrips.slice(startIndex, endIndex);

  // Pagination functions
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  // Reset to first page when trips data or per page count changes
  useEffect(() => {
    setCurrentPage(1);
  }, [totalTrips, tripsPerPage]);

  // Reset my investments page when data or per page count changes
  useEffect(() => {
    setMyInvestmentsCurrentPage(1);
  }, [myInvestmentsPerPage]);

  // Filter helper functions
  const updateFilter = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      startRoute: '',
      endRoute: '',
      tripName: '',
      minDuration: '',
      maxDuration: '',
      startDate: '',
      endDate: ''
    });
    setCurrentPage(1);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status && filters.status !== 'all') count++;
    if (filters.startRoute) count++;
    if (filters.endRoute) count++;
    if (filters.tripName) count++;
    if (filters.minDuration) count++;
    if (filters.maxDuration) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    return count;
  };

  // Get predefined status options for filter dropdown
  const getStatusOptions = () => {
    return ['active', 'running'];
  };

  const getUniqueStartLocations = () => {
    const locations = new Set<string>();
    availableStatusTrips.forEach(trip => {
      const routeParts = trip.location.split(' to ');
      if (routeParts[0]) {
        locations.add(routeParts[0].trim());
      }
    });
    return Array.from(locations);
  };

  const getUniqueEndLocations = () => {
    const locations = new Set<string>();
    availableStatusTrips.forEach(trip => {
      const routeParts = trip.location.split(' to ');
      if (routeParts[1]) {
        locations.add(routeParts[1].trim());
      } else if (routeParts[0]) {
        locations.add(routeParts[0].trim()); // For single location trips
      }
    });
    return Array.from(locations);
  };

  // Auto-suggestion filtering
  const getFilteredStartLocations = (query: string) => {
    if (!query) return [];
    return getUniqueStartLocations().filter(location =>
      location.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5); // Limit to 5 suggestions
  };

  const getFilteredEndLocations = (query: string) => {
    if (!query) return [];
    return getUniqueEndLocations().filter(location =>
      location.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5); // Limit to 5 suggestions
  };

  // Select All functionality
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all available trips that aren't locked or processing
      const availableTripsToSelect = currentTrips
        .filter(trip => !isTripLocked(trip.id) && !isTripProcessing(trip.id) && trip.status !== "completed")
        .map(trip => trip.id);

      const newSelected = new Set(selectedTrips);

      // Try to lock all trips
      const successfullyLocked: number[] = [];
      for (const tripId of availableTripsToSelect) {
        if (!TripLockService.isTripAvailable(tripId, currentUserId)) continue;

        const lockResult = TripLockService.lockTrip(tripId, currentUserId);
        if (lockResult.success) {
          newSelected.add(tripId);
          successfullyLocked.push(tripId);
        }
      }

      setSelectedTrips(newSelected);

      if (successfullyLocked.length > 0) {
        toast({
          title: "Trips Reserved",
          description: `${successfullyLocked.length} trips reserved for investment`,
        });
      }
    } else {
      // Deselect all and release locks
      selectedTrips.forEach(tripId => {
        const reservationId = reservationIds[tripId];
        if (reservationId) {
          TripLockService.cancelReservation(reservationId, currentUserId);
        } else {
          const lockInfo = TripLockService.getLockInfo(tripId);
          if (lockInfo) {
            TripLockService.releaseLock(tripId, currentUserId, lockInfo.sessionId);
          }
        }
      });

      setSelectedTrips(new Set());
      setInvestmentAmounts({});
      setReservationIds({});
      // setBulkInvestmentAmount("");
    }
  };

  const isAllSelected = () => {
    const selectableTrips = currentTrips.filter(trip =>
      !isTripLocked(trip.id) && !isTripProcessing(trip.id) && trip.status !== "completed"
    );
    return selectableTrips.length > 0 && selectableTrips.every(trip => selectedTrips.has(trip.id));
  };

  const isSomeSelected = () => {
    const selectableTrips = currentTrips.filter(trip =>
      !isTripLocked(trip.id) && !isTripProcessing(trip.id) && trip.status !== "completed"
    );
    return selectableTrips.some(trip => selectedTrips.has(trip.id));
  };

  // Bulk investment amount handling - COMMENTED OUT
  // const handleBulkAmountChange = (amount: string) => {
  //   // setBulkInvestmentAmount(amount);

  //   if (amount && parseFloat(amount) > 0) {
  //     const newAmounts: Record<number, string> = { ...investmentAmounts };

  //     selectedTrips.forEach(tripId => {
  //       if (!investmentAmounts[tripId]) {
  //         newAmounts[tripId] = amount;
  //       }
  //     });

  //     setInvestmentAmounts(newAmounts);
  //   }
  // };

  // const applyBulkAmount = () => {
  //   if (bulkInvestmentAmount && parseFloat(bulkInvestmentAmount) > 0) {
  //     const newAmounts: Record<number, string> = {};

  //     selectedTrips.forEach(tripId => {
  //       newAmounts[tripId] = bulkInvestmentAmount;
  //     });

  //     setInvestmentAmounts(prev => ({ ...prev, ...newAmounts }));

  //     toast({
  //       title: "Amounts Applied",
  //       description: `₹${parseFloat(bulkInvestmentAmount).toLocaleString()} applied to ${selectedTrips.size} selected trips`,
  //     });
  //   }
  // };

  // Combine static demo investments with user's dynamic investments
  const allInvestments = [...myInvestments, ...userInvestments];

  // My Investments filtering and pagination logic
  const filteredMyInvestments = allInvestments.filter(investment => {
    // Status filter
    if (myInvestmentsFilters.status !== 'all' && investment.status !== myInvestmentsFilters.status) return false;

    // Trip name filter
    if (myInvestmentsFilters.tripName && !investment.tripName.toLowerCase().includes(myInvestmentsFilters.tripName.toLowerCase())) return false;

    // Date range filter
    if (myInvestmentsFilters.dateRange !== 'all') {
      const investDate = new Date(investment.investedDate);
      const now = new Date();
      const daysAgo = (now.getTime() - investDate.getTime()) / (1000 * 60 * 60 * 24);

      switch (myInvestmentsFilters.dateRange) {
        case '30days':
          if (daysAgo > 30) return false;
          break;
        case '90days':
          if (daysAgo > 90) return false;
          break;
        case '1year':
          if (daysAgo > 365) return false;
          break;
      }
    }

    return true;
  });

  // My Investments pagination logic
  const totalMyInvestments = filteredMyInvestments.length;
  const effectiveMyInvestmentsPerPage = myInvestmentsPerPage === -1 ? totalMyInvestments : myInvestmentsPerPage;
  const totalMyInvestmentsPages = myInvestmentsPerPage === -1 ? 1 : Math.ceil(totalMyInvestments / myInvestmentsPerPage);
  const myInvestmentsStartIndex = myInvestmentsPerPage === -1 ? 0 : (myInvestmentsCurrentPage - 1) * myInvestmentsPerPage;
  const myInvestmentsEndIndex = myInvestmentsPerPage === -1 ? totalMyInvestments : myInvestmentsStartIndex + myInvestmentsPerPage;
  const currentMyInvestments = filteredMyInvestments.slice(myInvestmentsStartIndex, myInvestmentsEndIndex);

  // My Investments pagination functions
  const goToMyInvestmentsPage = (page: number) => {
    setMyInvestmentsCurrentPage(Math.max(1, Math.min(page, totalMyInvestmentsPages)));
  };

  const goToPreviousMyInvestmentsPage = () => {
    setMyInvestmentsCurrentPage(prev => Math.max(1, prev - 1));
  };

  const goToNextMyInvestmentsPage = () => {
    setMyInvestmentsCurrentPage(prev => Math.min(totalMyInvestmentsPages, prev + 1));
  };

  // My Investments filter helper functions
  const updateMyInvestmentsFilter = (key: keyof typeof myInvestmentsFilters, value: string) => {
    setMyInvestmentsFilters(prev => ({ ...prev, [key]: value }));
    setMyInvestmentsCurrentPage(1);
  };

  const clearMyInvestmentsFilters = () => {
    setMyInvestmentsFilters({
      status: 'all',
      tripName: '',
      dateRange: 'all'
    });
    setMyInvestmentsCurrentPage(1);
  };

  const getMyInvestmentsActiveFilterCount = () => {
    let count = 0;
    if (myInvestmentsFilters.status !== 'all') count++;
    if (myInvestmentsFilters.tripName) count++;
    if (myInvestmentsFilters.dateRange !== 'all') count++;
    return count;
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Trip Investments</h1>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCompactView(!compactView)}
            className="flex items-center gap-2"
          >
            {compactView ? <LayoutGrid className="h-4 w-4" /> : <LayoutList className="h-4 w-4" />}
            {compactView ? 'Full View' : 'Compact View'}
          </Button>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-sm text-muted-foreground">
              {tripsLoading ? 'Loading...' : `${filteredTrips.length} of ${availableStatusTrips.length} available trips`}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="p-4 bg-muted/30">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Filter Trips</h3>
              <div className="flex items-center gap-2">
                {getActiveFilterCount() > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All available</SelectItem>
                    {getStatusOptions().map(status => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start Route Filter */}
              <div className="space-y-2">
                <Label>Start Route</Label>
                <div className="relative">
                  <Input
                    placeholder="Search start location..."
                    value={filters.startRoute}
                    onChange={(e) => updateFilter('startRoute', e.target.value)}
                  />
                  {filters.startRoute && getFilteredStartLocations(filters.startRoute).length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-32 overflow-y-auto">
                      {getFilteredStartLocations(filters.startRoute).map((location, index) => (
                        <div
                          key={index}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onClick={() => updateFilter('startRoute', location)}
                        >
                          {location}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* End Route Filter */}
              <div className="space-y-2">
                <Label>End Route</Label>
                <div className="relative">
                  <Input
                    placeholder="Search end location..."
                    value={filters.endRoute}
                    onChange={(e) => updateFilter('endRoute', e.target.value)}
                  />
                  {filters.endRoute && getFilteredEndLocations(filters.endRoute).length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-32 overflow-y-auto">
                      {getFilteredEndLocations(filters.endRoute).map((location, index) => (
                        <div
                          key={index}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onClick={() => updateFilter('endRoute', location)}
                        >
                          {location}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Trip Name Filter */}
              <div className="space-y-2">
                <Label>Trip Name</Label>
                <Input
                  placeholder="Search by trip name..."
                  value={filters.tripName}
                  onChange={(e) => updateFilter('tripName', e.target.value)}
                />
              </div>

              {/* Duration Range Filter */}
              <div className="space-y-2">
                <Label>Min Duration (days)</Label>
                <Input
                  type="number"
                  placeholder="Min days..."
                  value={filters.minDuration}
                  onChange={(e) => updateFilter('minDuration', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Max Duration (days)</Label>
                <Input
                  type="number"
                  placeholder="Max days..."
                  value={filters.maxDuration}
                  onChange={(e) => updateFilter('maxDuration', e.target.value)}
                />
              </div>

              {/* Start Date Filter */}
              <div className="space-y-2">
                <Label>Start Date From</Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => updateFilter('startDate', e.target.value)}
                />
              </div>

              {/* End Date Filter */}
              <div className="space-y-2">
                <Label>End Date Until</Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => updateFilter('endDate', e.target.value)}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {tripsLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading trip data from Excel file...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {tripsError && (
        <Card className="border-warning bg-warning/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-warning">
              <Timer className="h-4 w-4" />
              <span className="font-medium">Notice:</span>
              <span>{tripsError}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {!tripsLoading && (
        <Tabs defaultValue="available" className="space-y-4">
          <TabsList>
            <TabsTrigger value="available">Available Trips</TabsTrigger>
            <TabsTrigger value="my-investments">My Investments</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
          {/* Available Trips Filters */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Available Trips</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {getActiveFilterCount() > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>
          </div>
          {/* Select All Controls */}
          <Card className="p-4 bg-muted/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isAllSelected()}
                    onCheckedChange={handleSelectAll}
                    className="data-[state=checked]:bg-primary"
                    ref={(el) => {
                      if (el && isSomeSelected() && !isAllSelected()) {
                        el.indeterminate = true;
                      }
                    }}
                  />
                  <Label className="text-sm font-medium">
                    Select All ({currentTrips.filter(trip => !isTripLocked(trip.id) && !isTripProcessing(trip.id) && trip.status !== "completed").length} trips)
                  </Label>
                </div>

                {selectedTrips.size > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {selectedTrips.size} selected
                    </span>
                  </div>
                )}
              </div>

              {/* Bulk Investment Amount Input - REMOVED */}
              {/*
              {selectedTrips.size > 0 && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="bulk-amount" className="text-sm whitespace-nowrap">
                    Bulk Amount:
                  </Label>
                  <Input
                    id="bulk-amount"
                    type="number"
                    placeholder="Enter amount..."
                    value={bulkInvestmentAmount}
                    onChange={(e) => handleBulkAmountChange(e.target.value)}
                    className="w-32 h-8"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={applyBulkAmount}
                    disabled={!bulkInvestmentAmount || parseFloat(bulkInvestmentAmount) <= 0}
                  >
                    Apply to All
                  </Button>
                </div>
              )}
              */}
            </div>
          </Card>
          {/* Enhanced Investment Summary Card */}
          {selectedTrips.size > 0 && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Investment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Selected Trips</p>
                    <p className="text-xl font-bold">{selectedTrips.size}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Investment Amount</p>
                    <p className="text-xl font-bold">₹{getTotalInvestment().toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Available Balance</p>
                    <p className={`text-xl font-bold ${walletData.balance >= getTotalInvestment() ? 'text-success' : 'text-destructive'}`}>
                      ₹{walletData.balance.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Remaining Balance</p>
                    <p className={`text-xl font-bold ${walletData.balance >= getTotalInvestment() ? 'text-success' : 'text-destructive'}`}>
                      ₹{Math.max(0, walletData.balance - getTotalInvestment()).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Insufficient Balance Warning */}
                {walletData.balance < getTotalInvestment() && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <div className="flex items-start gap-2">
                      <Timer className="h-4 w-4 text-destructive mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-destructive">Insufficient Wallet Balance</p>
                        <p className="text-muted-foreground mt-1">
                          You need ₹{(getTotalInvestment() - walletData.balance).toLocaleString()} more in your wallet to complete this investment.
                          <span className="text-primary cursor-pointer hover:underline ml-2">
                            Add funds to wallet →
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Minimum Amount Warnings - REMOVED */}
                {/*
                {Array.from(selectedTrips).some(tripId => isAmountBelowMinimum(tripId)) && (
                  <div className="p-3 bg-warning/10 border border-warning/20 rounded-md">
                    <div className="flex items-start gap-2">
                      <Timer className="h-4 w-4 text-warning mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-warning">Notice: Minimum amounts will be applied</p>
                        <p className="text-muted-foreground mt-1">
                          {Array.from(selectedTrips).filter(tripId => isAmountBelowMinimum(tripId)).length} trips have amounts below minimum and will be automatically adjusted.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                */}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-sm text-muted-foreground">
                    Ready to invest in {selectedTrips.size} trip{selectedTrips.size !== 1 ? 's' : ''}
                  </div>
                  <Button
                    onClick={handleInvestInSelected}
                    disabled={isInvesting || getTotalInvestment() === 0 || walletData.balance < getTotalInvestment()}
                    size="lg"
                    className="min-w-32"
                  >
                    {isInvesting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      `Invest All (₹${getTotalInvestment().toLocaleString()})`
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {compactView ? (
            /* Compact View - Multiple trips per row */
            <div className="space-y-2">
              {Array.from({ length: Math.ceil(currentTrips.length / 3) }, (_, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {currentTrips.slice(rowIndex * 3, (rowIndex + 1) * 3).map((trip) => {
                    const lockStatus = getTripLockStatus(trip.id);
                    const isLocked = lockStatus.status === 'locked';
                    const isProcessing = lockStatus.status === 'processing';
                    const isReserved = lockStatus.status === 'reserved';

                    return (
                      <Card key={trip.id} className={`p-3 transition-all ${
                        selectedTrips.has(trip.id) ? 'ring-2 ring-primary/50 bg-primary/5' : ''
                      } ${isLocked ? 'opacity-60 bg-muted/30' : ''} ${
                        isProcessing ? 'ring-2 ring-warning/50 bg-warning/5' : ''
                      }`}>
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedTrips.has(trip.id)}
                            onCheckedChange={(checked) => handleTripSelection(trip.id, !!checked)}
                            disabled={trip.status === "completed" || isLocked || isProcessing}
                            className="flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-semibold text-sm truncate">{trip.name}</h3>
                              {getStatusBadge(trip.status)}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{trip.location}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Target: ₹{(trip.targetAmount / 1000).toFixed(0)}K
                            </div>
                            {/* Investment Amount Input - REMOVED */}
                            {/*
                            {selectedTrips.has(trip.id) && (
                              <div className="mt-2">
                                <Input
                                  type="number"
                                  placeholder={`Min: ₹${trip.minInvestment}`}
                                  value={investmentAmounts[trip.id] || ""}
                                  onChange={(e) => handleAmountChange(trip.id, e.target.value)}
                                  className="h-7 text-xs"
                                />
                              </div>
                            )}
                            */}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            /* Full View - One trip per row */
            <div className="grid gap-2 grid-cols-1 trip-grid">
              {currentTrips.map((trip) => {
              const lockStatus = getTripLockStatus(trip.id);
              const isLocked = lockStatus.status === 'locked';
              const isProcessing = lockStatus.status === 'processing';
              const isReserved = lockStatus.status === 'reserved';

              // const isBelowMinimum = selectedTrips.has(trip.id) && isAmountBelowMinimum(trip.id);

              return (
              <Card key={trip.id} className={`overflow-hidden transition-all trip-card ${
                selectedTrips.has(trip.id) ? 'ring-2 ring-primary/50 bg-primary/5' : ''
              } ${isLocked ? 'opacity-60 bg-muted/30' : ''} ${
                isProcessing ? 'ring-2 ring-warning/50 bg-warning/5' : ''
              }`}>
                <CardHeader className="pb-2 p-3">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Checkbox
                        checked={selectedTrips.has(trip.id)}
                        onCheckedChange={(checked) => handleTripSelection(trip.id, !!checked)}
                        disabled={trip.status === "completed" || isLocked || isProcessing}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                            <CardTitle className="text-sm font-semibold truncate">{trip.name}</CardTitle>
                            {trip.category && (
                              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                                {trip.category}
                              </Badge>
                            )}
                          </div>
                          <div className="ml-2 flex-shrink-0">
                            {getStatusBadge(trip.status)}
                          </div>
                        </div>

                        {/* Status badges row */}
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {isLocked && (
                            <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                              <Lock className="h-3 w-3 mr-1" />
                              Locked
                            </Badge>
                          )}
                          {isProcessing && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-warning/10 text-warning border-warning/20">
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Processing
                            </Badge>
                          )}
                          {isReserved && !isProcessing && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary border-primary/20">
                              <Timer className="h-3 w-3 mr-1" />
                              Reserved
                            </Badge>
                          )}
                        </div>

                        {/* Location and basic info with date range */}
                        <div className="flex flex-col gap-1 text-xs text-muted-foreground mt-1.5">
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{trip.location}</span>
                          </span>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 whitespace-nowrap">
                              <Users className="h-3 w-3" />
                              <span className="text-xs">Investors:</span>
                              {trip.investorCount}
                            </span>
                            {trip.startDate && trip.endDate && (
                              <span className="text-xs">
                                From: {trip.startDate} to {trip.endDate}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-3 pt-0 space-y-3">
                  {/* Lock Status Message - Compact */}
                  {(isLocked || isProcessing || isReserved) && (
                    <div className={`p-2 rounded text-xs font-medium ${
                      isLocked ? 'bg-destructive/5 text-destructive' :
                      isProcessing ? 'bg-warning/5 text-warning' :
                      'bg-primary/5 text-primary'
                    }`}>
                      <div className="flex items-center gap-1">
                        {isLocked && <Lock className="h-3 w-3" />}
                        {isProcessing && <Loader2 className="h-3 w-3 animate-spin" />}
                        {isReserved && !isProcessing && <Timer className="h-3 w-3" />}
                        <span className="truncate">{lockStatus.message}</span>
                      </div>
                    </div>
                  )}

                  {/* Investment Amount Input - REMOVED */}
                  {/*
                  {selectedTrips.has(trip.id) && (
                    <div className={`p-2 rounded ${isBelowMinimum ? 'bg-amber-50 border border-amber-200' : 'bg-muted/50'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <Label htmlFor={`amount-${trip.id}`} className="text-xs font-medium">Investment Amount</Label>
                        {isBelowMinimum && (
                          <span className="text-xs text-amber-600 font-medium">
                            Will use min: ₹{trip.minInvestment.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          id={`amount-${trip.id}`}
                          type="number"
                          placeholder={`Min: ₹${trip.minInvestment}`}
                          value={investmentAmounts[trip.id] || ""}
                          onChange={(e) => handleAmountChange(trip.id, e.target.value)}
                          className={`flex-1 h-7 text-xs ${isBelowMinimum ? 'border-amber-300 focus:border-amber-400' : ''}`}
                        />
                        <span className="text-xs text-muted-foreground">INR</span>
                      </div>
                      {isBelowMinimum && (
                        <p className="text-xs text-amber-600 mt-1">
                          Amount below minimum. ₹{trip.minInvestment.toLocaleString()} will be used instead.
                        </p>
                      )}
                    </div>
                  )}
                  */}

                  {/* Progress Section */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium">Progress: {getProgress(trip.currentAmount, trip.targetAmount)}%</span>
                      {trip.endDate && getRemainingDays(trip.endDate) <= 180 && (
                        <span className="text-muted-foreground">
                          {getRemainingDays(trip.endDate)} days left
                        </span>
                      )}
                    </div>
                    <Progress
                      value={getProgress(trip.currentAmount, trip.targetAmount)}
                      className="h-1.5"
                    />
                  </div>

                  {/* Trip Details - Single Row */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
                    <div>
                      <span className="text-muted-foreground">Trip Amount</span>
                      <p className="font-medium">₹{(trip.targetAmount / 1000).toFixed(0)}K</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Progress</span>
                      <p className="font-medium">{getProgress(trip.currentAmount, trip.targetAmount)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              );
            })}
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Showing {Math.min(startIndex + 1, totalTrips)}-{Math.min(endIndex, totalTrips)} of {totalTrips} trips
              </p>

              {/* Per Page Selector */}
              <div className="flex items-center gap-2">
                <Label htmlFor="trips-per-page" className="text-sm text-muted-foreground whitespace-nowrap">
                  Show:
                </Label>
                <Select
                  value={tripsPerPage.toString()}
                  onValueChange={(value) => setTripsPerPage(value === "all" ? -1 : parseInt(value))}
                >
                  <SelectTrigger id="trips-per-page" className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Navigation Controls - Only show if not showing all */}
            {totalPages > 1 && tripsPerPage !== -1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    const isCurrentPage = page === currentPage;
                    const showPage = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;

                    if (!showPage && page !== 2 && page !== totalPages - 1) {
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <span key={page} className="px-2 text-muted-foreground">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <Button
                        key={page}
                        variant={isCurrentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="my-investments" className="space-y-4">
          {/* My Investments Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Investments</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMyInvestmentsFilters(!showMyInvestmentsFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {getMyInvestmentsActiveFilterCount() > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                  {getMyInvestmentsActiveFilterCount()}
                </Badge>
              )}
            </Button>
          </div>

          {/* My Investments Filter Panel */}
          {showMyInvestmentsFilters && (
            <Card className="p-4 bg-muted/30">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Filter Investments</h3>
                  <div className="flex items-center gap-2">
                    {getMyInvestmentsActiveFilterCount() > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearMyInvestmentsFilters}>
                        <X className="h-4 w-4 mr-1" />
                        Clear All
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setShowMyInvestmentsFilters(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Status Filter */}
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={myInvestmentsFilters.status} onValueChange={(value) => updateMyInvestmentsFilter('status', value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Trip Name Filter */}
                  <div className="space-y-2">
                    <Label>Trip Name</Label>
                    <Input
                      placeholder="Search by trip name..."
                      value={myInvestmentsFilters.tripName}
                      onChange={(e) => updateMyInvestmentsFilter('tripName', e.target.value)}
                    />
                  </div>

                  {/* Date Range Filter */}
                  <div className="space-y-2">
                    <Label>Investment Date</Label>
                    <Select value={myInvestmentsFilters.dateRange} onValueChange={(value) => updateMyInvestmentsFilter('dateRange', value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All time</SelectItem>
                        <SelectItem value="30days">Last 30 days</SelectItem>
                        <SelectItem value="90days">Last 90 days</SelectItem>
                        <SelectItem value="1year">Last year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {compactView ? (
            /* Compact View - Multiple investments per row */
            <div className="space-y-2">
              {Array.from({ length: Math.ceil(currentMyInvestments.length / 3) }, (_, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {currentMyInvestments.slice(rowIndex * 3, (rowIndex + 1) * 3).map((investment) => (
                    <Card key={investment.id} className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm truncate">{investment.tripName}</h3>
                          {getStatusBadge(investment.status)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          From: {investment.tripStartDate} to {investment.expectedEndDate}
                        </div>
                        <div className={`grid gap-2 text-xs ${investment.status === "completed" ? "grid-cols-3" : "grid-cols-2"}`}>
                          <div>
                            <span className="text-muted-foreground">Amount</span>
                            <p className="font-semibold">₹{(investment.amount / 1000).toFixed(0)}K</p>
                          </div>
                          {investment.status === "completed" && (
                            <div>
                              <span className="text-muted-foreground">Profit</span>
                              <p className="font-semibold text-success">₹{(investment.profitCredited / 1000).toFixed(0)}K</p>
                            </div>
                          )}
                          <div>
                            <span className="text-muted-foreground">Progress</span>
                            <p className="font-semibold">{investment.progress}%</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            /* Full View - One investment per row */
            <div className="grid gap-2 grid-cols-1 trip-grid">
              {currentMyInvestments.map((investment) => (
              <Card key={investment.id} className="overflow-hidden trip-card">
                <CardHeader className="pb-2 p-3">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                        <CardTitle className="text-sm font-semibold truncate">{investment.tripName}</CardTitle>
                        {investment.status === "completed" ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : (
                          <Clock className="h-4 w-4 text-warning" />
                        )}
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        {getStatusBadge(investment.status)}
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      From: {investment.tripStartDate} to {investment.expectedEndDate}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-3 pt-0 space-y-3">
                  {/* Investment Overview - Compact Grid */}
                  <div className={`grid gap-2 text-xs ${investment.status === "completed" ? "grid-cols-4" : "grid-cols-3"}`}>
                    <div>
                      <span className="text-muted-foreground">Amount Invested</span>
                      <p className="font-semibold">₹{(investment.amount / 1000).toFixed(0)}K</p>
                    </div>
                    {investment.status === "completed" && (
                      <div>
                        <span className="text-muted-foreground">Profit Credited</span>
                        <p className="font-semibold text-success">₹{(investment.profitCredited / 1000).toFixed(0)}K</p>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Progress</span>
                      <p className="font-semibold">{investment.progress}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Days Left</span>
                      <p className="font-semibold">
                        {investment.status === "completed" ? "Done" : `${investment.daysRemaining}`}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <Progress
                      value={investment.progress}
                      className="h-1.5"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{investment.progress}% Complete</span>
                      <span>
                        {investment.status === "completed" ? "Completed" : `${investment.daysRemaining} days remaining`}
                      </span>
                    </div>
                  </div>

                  {/* Trip Milestones - Compact */}
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-medium">Milestones</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {investment.milestones.filter(m => m.status === 'completed').length}/{investment.milestones.length}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleMilestoneCollapse(investment.id)}
                          className="h-6 w-6 p-0"
                        >
                          {collapsedMilestones.has(investment.id) ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronUp className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Collapsible Milestones Content - Horizontal Layout */}
                    {!collapsedMilestones.has(investment.id) && (
                      <div className="mt-2 transition-all duration-200 ease-in-out">
                        <div className="space-y-2">
                          {/* Horizontal Progress Bar */}
                          <div className="flex items-center gap-1">
                            {investment.milestones.map((milestone, index) => {
                              const isCompleted = milestone.status === 'completed';
                              const isCurrent = milestone.status === 'current';
                              const IconComponent = milestone.icon;

                              return (
                                <div key={milestone.id} className="flex items-center flex-1">
                                  {/* Milestone Step */}
                                  <div
                                    className={`
                                      relative w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium cursor-help
                                      ${isCompleted ? 'bg-success/20 border-success text-success' :
                                        isCurrent ? 'bg-warning/20 border-warning text-warning animate-pulse' :
                                        'bg-muted border-muted-foreground/30 text-muted-foreground'}
                                    `}
                                    title={`${milestone.name} - ${milestone.date}`}
                                  >
                                    {isCompleted ? (
                                      <CheckCircle className="h-3 w-3" />
                                    ) : isCurrent ? (
                                      <Clock className="h-3 w-3" />
                                    ) : (
                                      <span>{index + 1}</span>
                                    )}
                                  </div>

                                  {/* Connecting Line */}
                                  {index < investment.milestones.length - 1 && (
                                    <div className={`
                                      flex-1 h-0.5 mx-1
                                      ${isCompleted ? 'bg-success' : 'bg-muted-foreground/20'}
                                    `} />
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Trip Status Label */}
                          <div className="text-center">
                            {investment.status === 'completed' ? (
                              <div>
                                <div className="text-xs text-success font-medium">
                                  Current Trip Status: Completed
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Completed on: {investment.expectedEndDate}
                                </div>
                              </div>
                            ) : investment.milestones.some(m => m.status === 'current') ? (
                              <div>
                                <div className="text-xs text-warning font-medium">
                                  Current Trip Status: {investment.milestones.find(m => m.status === 'current')?.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Expected: {investment.milestones.find(m => m.status === 'current')?.date}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="text-xs text-muted-foreground font-medium">
                                  Current Trip Status: Upcoming
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Starts: {investment.tripStartDate}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          )}

          {/* My Investments Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Showing {Math.min(myInvestmentsStartIndex + 1, totalMyInvestments)}-{Math.min(myInvestmentsEndIndex, totalMyInvestments)} of {totalMyInvestments} investments
              </p>

              {/* Per Page Selector for My Investments */}
              <div className="flex items-center gap-2">
                <Label htmlFor="investments-per-page" className="text-sm text-muted-foreground whitespace-nowrap">
                  Show:
                </Label>
                <Select
                  value={myInvestmentsPerPage.toString()}
                  onValueChange={(value) => setMyInvestmentsPerPage(value === "all" ? -1 : parseInt(value))}
                >
                  <SelectTrigger id="investments-per-page" className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Navigation Controls - Only show if not showing all */}
            {totalMyInvestmentsPages > 1 && myInvestmentsPerPage !== -1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousMyInvestmentsPage}
                  disabled={myInvestmentsCurrentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalMyInvestmentsPages }, (_, i) => i + 1).map((page) => {
                    const isCurrentPage = page === myInvestmentsCurrentPage;
                    const showPage = page === 1 || page === totalMyInvestmentsPages || Math.abs(page - myInvestmentsCurrentPage) <= 1;

                    if (!showPage && page !== 2 && page !== totalMyInvestmentsPages - 1) {
                      if (page === myInvestmentsCurrentPage - 2 || page === myInvestmentsCurrentPage + 2) {
                        return (
                          <span key={page} className="px-2 text-muted-foreground">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <Button
                        key={page}
                        variant={isCurrentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToMyInvestmentsPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextMyInvestmentsPage}
                  disabled={myInvestmentsCurrentPage === totalMyInvestmentsPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Trips;