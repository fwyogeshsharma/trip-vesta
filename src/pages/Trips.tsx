import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSEO, pageSEO } from "@/hooks/useSEO";
import { generateServiceSchema } from "@/utils/structuredData";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TripMilestones } from "@/components/TripMilestones";
import CompanyLogo from "@/components/CompanyLogo";
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
  LayoutGrid,
  Navigation,
  Truck,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TripLockService } from "@/services/tripLockService";
// import { useTripData } from "@/hooks/useTripData"; // Removed - Available Trips disabled
import { useApiTrips } from "@/hooks/useApiTrips";
// import { TripData } from "@/utils/excelReader"; // Removed - Available Trips disabled
import { InvestmentStorage, InvestmentData } from "@/utils/investmentStorage";
import { useWallet } from "@/contexts/WalletContext";

// Declare Google Maps global interface
declare global {
  interface Window {
    google: any;
    currentRoutePath?: google.maps.LatLng[];
  }
}

// Trip data loaded from Excel file

// Static demo investments removed - now using only dynamic user investments

const Trips = () => {
  // SEO Implementation
  useSEO({
    ...pageSEO.trips,
    structuredData: generateServiceSchema(),
    ogUrl: typeof window !== 'undefined' ? window.location.href : 'https://tripvesta.com/trips',
    canonical: 'https://tripvesta.com/trips'
  });

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

  // Load trip data from Excel file (investment trips)
  // Removed useTripData hook since Available Trips section is disabled
  // const { trips: availableTrips, loading: tripsLoading, error: tripsError } = useTripData();
  const tripsLoading = false;
  const tripsError = null;

  // Load real trip data from API
  const {
    trips: apiTrips,
    loading: apiTripsLoading,
    error: apiTripsError,
    refetch: refetchApiTrips,
    totalTrips: totalApiTrips,
    currentPage: apiCurrentPage,
    totalPages: totalApiPages
  } = useApiTrips();

  // API trip filters
  const [apiTripFilters, setApiTripFilters] = useState({
    startRoute: '',
    endRoute: '',
    tripName: '',
    page: 1,
    max_results: 10
  });

  // Expanded trip details state
  const [expandedTrips, setExpandedTrips] = useState<Set<string>>(new Set());

  // Live trips selection state
  const [selectedLiveTrips, setSelectedLiveTrips] = useState<Set<string>>(new Set());
  const [showSelectedTripsTable, setShowSelectedTripsTable] = useState(false);

  const toggleTripExpansion = (tripId: string) => {
    const newExpanded = new Set(expandedTrips);
    if (newExpanded.has(tripId)) {
      newExpanded.delete(tripId);
    } else {
      newExpanded.add(tripId);
    }
    setExpandedTrips(newExpanded);
  };

  // Helper functions for auto-complete
  const getApiTripStartLocations = (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 1) return [];

    const allStartLocations = apiTrips
      .map(trip => trip.pickup?.city)
      .filter(city => city && city.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter((city, index, self) => self.indexOf(city) === index) // Remove duplicates
      .slice(0, 5); // Limit to 5 suggestions

    return allStartLocations;
  };

  const getApiTripEndLocations = (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 1) return [];

    const allEndLocations = apiTrips
      .map(trip => trip.delivery?.city)
      .filter(city => city && city.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter((city, index, self) => self.indexOf(city) === index) // Remove duplicates
      .slice(0, 5); // Limit to 5 suggestions

    return allEndLocations;
  };

  const getApiTripNames = (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 1) return [];

    const allTripNames = apiTrips
      .map(trip => trip.materialType)
      .filter(name => name && name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter((name, index, self) => self.indexOf(name) === index) // Remove duplicates
      .slice(0, 5); // Limit to 5 suggestions

    return allTripNames;
  };

  const updateApiFilter = (key: string, value: string) => {
    setApiTripFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  // Live trips selection handlers
  const handleLiveTripSelection = (tripId: string, checked: boolean) => {
    const newSelected = new Set(selectedLiveTrips);
    if (checked) {
      newSelected.add(tripId);
    } else {
      newSelected.delete(tripId);
    }
    setSelectedLiveTrips(newSelected);
  };

  // Individual trip investment handler
  const handleInvestInSingleTrip = async (trip: any) => {
    // Check if user has sufficient balance
    const investmentAmount = trip.freightCharges || trip.total_freight_Charges || 0;
    if (walletData.balance < investmentAmount) {
      toast({
        title: "Insufficient Balance",
        description: `You need ₹${investmentAmount.toLocaleString()} but only have ₹${walletData.balance.toLocaleString()} in your wallet.`,
        variant: "destructive"
      });
      return;
    }

    setIsInvesting(true);
    try {
      // Simulate investment processing
      toast({
        title: "Processing Investment",
        description: `Investing ₹${investmentAmount.toLocaleString()} in ${trip.sender?.company || trip.name || 'Unknown Company'}...`,
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Deduct amount from wallet balance
      const balanceDeducted = deductFromBalance(investmentAmount);

      if (!balanceDeducted) {
        throw new Error("Failed to deduct amount from wallet balance");
      }

      toast({
        title: "Investment Successful! 🎉",
        description: `Successfully invested ₹${investmentAmount.toLocaleString()} in trip ${trip.tripNumber}`,
      });

      // Remove from selected trips if it was selected
      const newSelected = new Set(selectedLiveTrips);
      newSelected.delete(trip.id);
      setSelectedLiveTrips(newSelected);

    } catch (error) {
      toast({
        title: "Investment Failed",
        description: error instanceof Error ? error.message : "An error occurred during investment",
        variant: "destructive"
      });
    } finally {
      setIsInvesting(false);
    }
  };

  // Multiple trips investment handler
  const handleInvestInSelectedLiveTrips = async () => {
    if (selectedLiveTrips.size === 0) {
      toast({
        title: "No Trips Selected",
        description: "Please select at least one trip to invest in",
        variant: "destructive"
      });
      return;
    }

    // Check if user has sufficient balance
    const totalAmount = getTotalSelectedCost();
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
      // Simulate investment processing
      toast({
        title: "Processing Investments",
        description: `Processing investments for ${selectedLiveTrips.size} trips...`,
      });

      await new Promise(resolve => setTimeout(resolve, 3000));

      // Deduct amount from wallet balance
      const balanceDeducted = deductFromBalance(totalAmount);

      if (!balanceDeducted) {
        throw new Error("Failed to deduct amount from wallet balance");
      }

      toast({
        title: "Investments Successful! 🎉",
        description: `Successfully invested ₹${totalAmount.toLocaleString()} across ${selectedLiveTrips.size} trips`,
      });

      // Clear selections
      setSelectedLiveTrips(new Set());

    } catch (error) {
      toast({
        title: "Investment Failed",
        description: error instanceof Error ? error.message : "An error occurred during investment",
        variant: "destructive"
      });
    } finally {
      setIsInvesting(false);
    }
  };

  const handleSelectAllLiveTrips = (checked: boolean) => {
    if (checked) {
      const allTripIds = new Set(filteredApiTrips.map(trip => trip.id));
      setSelectedLiveTrips(allTripIds);
    } else {
      setSelectedLiveTrips(new Set());
    }
  };

  const isAllLiveTripsSelected = () => {
    return filteredApiTrips.length > 0 && filteredApiTrips.every(trip => selectedLiveTrips.has(trip.id));
  };

  const isSomeLiveTripsSelected = () => {
    return selectedLiveTrips.size > 0 && selectedLiveTrips.size < filteredApiTrips.length;
  };

  // Calculate total freight charges of selected trips
  const getTotalSelectedCost = () => {
    return filteredApiTrips
      .filter(trip => selectedLiveTrips.has(trip.id))
      .reduce((total, trip) => total + (trip.freightCharges || trip.total_freight_Charges || 0), 0);
  };

  const getSelectedTripsData = () => {
    return filteredApiTrips.filter(trip => selectedLiveTrips.has(trip.id));
  };

  // Filter trips based on search criteria
  const filteredApiTrips = apiTrips.filter(trip => {
    // Start route filter
    if (apiTripFilters.startRoute && !trip.pickup?.city?.toLowerCase().includes(apiTripFilters.startRoute.toLowerCase())) {
      return false;
    }

    // End route filter
    if (apiTripFilters.endRoute && !trip.delivery?.city?.toLowerCase().includes(apiTripFilters.endRoute.toLowerCase())) {
      return false;
    }

    // Trip name filter (using material type as trip identifier)
    if (apiTripFilters.tripName && !trip.materialType?.toLowerCase().includes(apiTripFilters.tripName.toLowerCase())) {
      return false;
    }

    return true;
  });

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
  const [collapsedMilestones, setCollapsedMilestones] = useState<Set<number>>(new Set());

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

  // GPS Tracking states
  const [trackingTrip, setTrackingTrip] = useState<number | null>(null);
  const [truckLocations, setTruckLocations] = useState<Record<number, { lat: number; lng: number }>>({});

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
  const [showFilters, setShowFilters] = useState(false); // Disabled - using Live Trips filters instead
  const [showMyInvestmentsFilters, setShowMyInvestmentsFilters] = useState(false);
  const [showApiTripFilters, setShowApiTripFilters] = useState(false);

  // Load user investments from localStorage on mount
  useEffect(() => {
    const loadInvestments = () => {
      // Clear all existing investments since they were based on static data
      InvestmentStorage.clearAllInvestments();

      // Start with empty investments array
      const investments: any[] = [];
      setUserInvestments(investments);

      // Set collapsed milestones for all investments by default
      setCollapsedMilestones(new Set(investments.map(inv => inv.id)));

      // No need to resume progress simulation since we're starting fresh
    };

    loadInvestments();
  }, []);

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (window.google) return;

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDORAiwsJBUe0hBl6ViXWmf97aVT3VnYqg&libraries=geometry`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    };

    loadGoogleMapsScript();
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

  const getInsuredBadge = (insured: boolean) => {
    if (insured) {
      return (
        <Badge className="bg-blue-500 text-white flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Insured
        </Badge>
      );
    }
    return null;
  };

  const getTruckNameFromImage = (imageName: string): string => {
    return imageName.replace(/\.[^/.]+$/, "").replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase()).trim();
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
      amount: trip.freightCharges,
      investedDate: today,
      tripStartDate: trip.startDate || today,
      expectedEndDate: endDate,
      status: "active",
      progress: 0, // Start at 0%
      daysRemaining: Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      profitCredited: 0,
      profitGain: { amount: Math.floor(Math.random() * 7000) + 5000, percentage: 60 }, // 60% profit, random 5k-12k range
      originalTripId: trip.id,
      companyLogo: trip.companyLogo,
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
            // Investment completed, calculate profit in 5k-12k range
            const profit = Math.floor(Math.random() * 7000) + 5000; // 5k-12k range
            const profitGain = Math.floor(profit * 0.60); // 60% of actual profit
            InvestmentStorage.updateInvestmentProgress(investmentId, 100);

            // Update with profit and mark all milestones as completed
            setUserInvestments(prev => prev.map(inv =>
              inv.id === investmentId
                ? {
                    ...inv,
                    progress: 100,
                    status: "completed",
                    profitCredited: profit,
                    profitGain: { amount: profitGain, percentage: 60 },
                    daysRemaining: 0,
                    milestones: inv.milestones.map(milestone => ({
                      ...milestone,
                      status: "completed" as const
                    }))
                  }
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
          description: "This trip is currently being processed by another lender",
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
        const effectiveAmount = trip?.freightCharges || 0; // Invest full trip freight charges

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
      const effectiveAmount = trip?.freightCharges || 0; // Full trip freight charges
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

  // Available Trips section disabled - no static trip data
  const availableStatusTrips: any[] = [];

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

  // Helper function to ensure completed trips have all milestones marked as completed and proper profit amounts
  const ensureCompletedMilestonesForCompletedTrips = (investments: any[]) => {
    return investments.map(investment => {
      if (investment.status === "completed") {
        // If profitCredited is 0 or not in 5k-12k range, set proper amounts
        const needsProfitUpdate = investment.profitCredited === 0 || investment.profitCredited < 5000 || investment.profitCredited > 12000;
        const newProfitCredited = needsProfitUpdate ? Math.floor(Math.random() * 7000) + 5000 : investment.profitCredited;
        const newProfitGain = Math.floor(newProfitCredited * 0.60);

        return {
          ...investment,
          profitCredited: newProfitCredited,
          profitGain: { amount: newProfitGain, percentage: 60 },
          milestones: investment.milestones.map((milestone: any) => ({
            ...milestone,
            status: "completed" as const
          }))
        };
      }
      return investment;
    });
  };

  // Use only user's dynamic investments and ensure completed trips have all milestones completed
  const allInvestments = ensureCompletedMilestonesForCompletedTrips([...userInvestments]);

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

  // GPS Tracking functions
  const getLocationCoordinates = (locationName: string) => {
    // Common trip locations with coordinates
    const locationMap: Record<string, { lat: number; lng: number }> = {
      'Mumbai': { lat: 19.0760, lng: 72.8777 },
      'Delhi': { lat: 28.6139, lng: 77.2090 },
      'Bangalore': { lat: 12.9716, lng: 77.5946 },
      'Chennai': { lat: 13.0827, lng: 80.2707 },
      'Hyderabad': { lat: 17.3850, lng: 78.4867 },
      'Pune': { lat: 18.5204, lng: 73.8567 },
      'Kolkata': { lat: 22.5726, lng: 88.3639 },
      'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
      'Jaipur': { lat: 26.9124, lng: 75.7873 },
      'Lucknow': { lat: 26.8467, lng: 80.9462 },
      'Kanpur': { lat: 26.4499, lng: 80.3319 },
      'Nagpur': { lat: 21.1458, lng: 79.0882 },
      'Indore': { lat: 22.7196, lng: 75.8577 },
      'Thane': { lat: 19.2183, lng: 72.9781 },
      'Bhopal': { lat: 23.2599, lng: 77.4126 },
      'Visakhapatnam': { lat: 17.6868, lng: 83.2185 },
      'Pimpri': { lat: 18.6298, lng: 73.7997 },
      'Patna': { lat: 25.5941, lng: 85.1376 },
      'Vadodara': { lat: 22.3072, lng: 73.1812 },
      'Ghaziabad': { lat: 28.6692, lng: 77.4538 },
      'Ludhiana': { lat: 30.9010, lng: 75.8573 },
      'Agra': { lat: 27.1767, lng: 78.0081 },
      'Nashik': { lat: 19.9975, lng: 73.7898 },
      'Faridabad': { lat: 28.4089, lng: 77.3178 },
      'Meerut': { lat: 28.9845, lng: 77.7064 }
    };

    // Try exact match first
    if (locationMap[locationName]) {
      return locationMap[locationName];
    }

    // Try partial match
    for (const [key, coords] of Object.entries(locationMap)) {
      if (locationName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(locationName.toLowerCase())) {
        return coords;
      }
    }

    // Default to Mumbai if no match found
    return locationMap['Mumbai'];
  };

  const generateRandomTruckPosition = (startLocation: string, endLocation: string, progress: number) => {
    const start = getLocationCoordinates(startLocation);
    const end = getLocationCoordinates(endLocation);

    // Calculate position based on progress (0-100%)
    const progressRatio = Math.min(progress / 100, 0.95); // Max 95% to keep truck moving

    // Add some randomness to make it more realistic (±0.01 degrees)
    const randomOffset = {
      lat: (Math.random() - 0.5) * 0.02,
      lng: (Math.random() - 0.5) * 0.02
    };

    const currentLat = start.lat + (end.lat - start.lat) * progressRatio + randomOffset.lat;
    const currentLng = start.lng + (end.lng - start.lng) * progressRatio + randomOffset.lng;

    return { lat: currentLat, lng: currentLng };
  };

  // Pre-built realistic highway paths for when Google API fails
  const getRealisticHighwayPath = (startLocation: string, endLocation: string): google.maps.LatLng[] => {
    const routeKey = `${startLocation}-${endLocation}`;

    // Define realistic highway paths with intermediate points
    const highwayPaths: Record<string, { lat: number; lng: number }[]> = {
      'Santorini Sunset-Delhi': [
        { lat: 19.0760, lng: 72.8777 }, // Mumbai
        { lat: 19.1334, lng: 72.9133 }, // Thane
        { lat: 19.2183, lng: 73.0595 }, // Kalyan
        { lat: 19.8762, lng: 73.2482 }, // Nashik Road
        { lat: 20.0112, lng: 73.7902 }, // Nashik
        { lat: 20.5937, lng: 74.1982 }, // Malegaon
        { lat: 21.1498, lng: 75.3827 }, // Dhule
        { lat: 22.1991, lng: 75.7849 }, // Indore approach
        { lat: 22.7196, lng: 75.8577 }, // Indore
        { lat: 23.1765, lng: 76.0534 }, // Dewas
        { lat: 24.0734, lng: 76.7811 }, // Ujjain
        { lat: 24.5854, lng: 76.8081 }, // Agar
        { lat: 25.4484, lng: 76.9366 }, // Kota approach
        { lat: 26.2389, lng: 76.4317 }, // Bundi
        { lat: 26.9124, lng: 75.7873 }, // Jaipur
        { lat: 27.1767, lng: 76.0081 }, // Dausa
        { lat: 27.6094, lng: 76.1300 }, // Alwar
        { lat: 28.0229, lng: 76.8779 }, // Gurgaon
        { lat: 28.6139, lng: 77.2090 }  // Delhi
      ],
      'Delhi-Santorini Sunset': [
        { lat: 28.6139, lng: 77.2090 }, // Delhi
        { lat: 28.0229, lng: 76.8779 }, // Gurgaon
        { lat: 27.6094, lng: 76.1300 }, // Alwar
        { lat: 27.1767, lng: 76.0081 }, // Dausa
        { lat: 26.9124, lng: 75.7873 }, // Jaipur
        { lat: 26.2389, lng: 76.4317 }, // Bundi
        { lat: 25.4484, lng: 76.9366 }, // Kota approach
        { lat: 24.5854, lng: 76.8081 }, // Agar
        { lat: 24.0734, lng: 76.7811 }, // Ujjain
        { lat: 23.1765, lng: 76.0534 }, // Dewas
        { lat: 22.7196, lng: 75.8577 }, // Indore
        { lat: 22.1991, lng: 75.7849 }, // Indore approach
        { lat: 21.1498, lng: 75.3827 }, // Dhule
        { lat: 20.5937, lng: 74.1982 }, // Malegaon
        { lat: 20.0112, lng: 73.7902 }, // Nashik
        { lat: 19.8762, lng: 73.2482 }, // Nashik Road
        { lat: 19.2183, lng: 73.0595 }, // Kalyan
        { lat: 19.1334, lng: 72.9133 }, // Thane
        { lat: 19.0760, lng: 72.8777 }  // Mumbai
      ],
      'Mumbai-Delhi': [
        { lat: 19.0760, lng: 72.8777 }, // Mumbai
        { lat: 18.5204, lng: 73.8567 }, // Pune
        { lat: 19.8762, lng: 73.2482 }, // Nashik
        { lat: 22.7196, lng: 75.8577 }, // Indore
        { lat: 26.9124, lng: 75.7873 }, // Jaipur
        { lat: 28.6139, lng: 77.2090 }  // Delhi
      ],
      'Delhi-Mumbai': [
        { lat: 28.6139, lng: 77.2090 }, // Delhi
        { lat: 26.9124, lng: 75.7873 }, // Jaipur
        { lat: 22.7196, lng: 75.8577 }, // Indore
        { lat: 19.8762, lng: 73.2482 }, // Nashik
        { lat: 18.5204, lng: 73.8567 }, // Pune
        { lat: 19.0760, lng: 72.8777 }  // Mumbai
      ]
    };

    // Return realistic path if available
    if (highwayPaths[routeKey]) {
      return highwayPaths[routeKey].map(point => new google.maps.LatLng(point.lat, point.lng));
    }

    // Generate realistic curved path between any two cities
    const start = getLocationCoordinates(startLocation);
    const end = getLocationCoordinates(endLocation);

    // Create realistic highway curve with multiple intermediate points
    const path: google.maps.LatLng[] = [];
    const steps = 15; // Number of intermediate points

    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;

      // Add highway-like curves (not straight line)
      const curveFactor = Math.sin(ratio * Math.PI) * 0.3; // Creates realistic highway curve
      const lat = start.lat + (end.lat - start.lat) * ratio + curveFactor * (Math.random() - 0.5) * 0.5;
      const lng = start.lng + (end.lng - start.lng) * ratio + curveFactor * (Math.random() - 0.5) * 0.5;

      path.push(new google.maps.LatLng(lat, lng));
    }

    return path;
  };

  // Helper function to get strategic waypoints for better highway routing
  const getStrategicWaypoints = (startLocation: string, endLocation: string) => {
    // Define major highway junction cities for better routing
    const majorCities: Record<string, { lat: number; lng: number }> = {
      'Mumbai': { lat: 19.0760, lng: 72.8777 },
      'Delhi': { lat: 28.6139, lng: 77.2090 },
      'Bangalore': { lat: 12.9716, lng: 77.5946 },
      'Chennai': { lat: 13.0827, lng: 80.2707 },
      'Hyderabad': { lat: 17.3850, lng: 78.4867 },
      'Pune': { lat: 18.5204, lng: 73.8567 },
      'Kolkata': { lat: 22.5726, lng: 88.3639 },
      'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
      'Jaipur': { lat: 26.9124, lng: 75.7873 },
      'Indore': { lat: 22.7196, lng: 75.8577 },
      'Nagpur': { lat: 21.1458, lng: 79.0882 },
      'Surat': { lat: 21.1702, lng: 72.8311 }
    };

    // Define common highway routes with strategic waypoints
    const routeWaypoints: Record<string, string[]> = {
      'Mumbai-Delhi': ['Pune', 'Nashik', 'Indore', 'Jaipur'],
      'Delhi-Mumbai': ['Jaipur', 'Indore', 'Nashik', 'Pune'],
      'Mumbai-Bangalore': ['Pune', 'Belgaum'],
      'Bangalore-Mumbai': ['Belgaum', 'Pune'],
      'Delhi-Chennai': ['Nagpur', 'Hyderabad'],
      'Chennai-Delhi': ['Hyderabad', 'Nagpur'],
      'Mumbai-Chennai': ['Pune', 'Hyderabad'],
      'Chennai-Mumbai': ['Hyderabad', 'Pune'],
      'Delhi-Bangalore': ['Nagpur', 'Hyderabad'],
      'Bangalore-Delhi': ['Hyderabad', 'Nagpur'],
      'Mumbai-Kolkata': ['Nagpur', 'Raipur'],
      'Kolkata-Mumbai': ['Raipur', 'Nagpur']
    };

    const routeKey = `${startLocation}-${endLocation}`;
    const waypoints = routeWaypoints[routeKey] || [];

    return waypoints.map(city => ({
      location: majorCities[city] || getLocationCoordinates(city),
      stopover: false
    })).filter(wp => wp.location);
  };

  const handleGPSTracking = (investment: any) => {
    if (!window.google) {
      toast({
        title: "Maps Loading",
        description: "Google Maps is loading. Please try again in a moment.",
        variant: "destructive"
      });
      return;
    }

    // Extract start and end locations from trip name or use defaults
    const tripLocations = investment.tripName.split(' to ');
    const startLocation = tripLocations[0] || 'Mumbai';
    const endLocation = tripLocations[1] || 'Delhi';

    // Generate current truck position
    const truckPosition = generateRandomTruckPosition(startLocation, endLocation, investment.progress);

    // Update truck location state
    setTruckLocations(prev => ({
      ...prev,
      [investment.id]: truckPosition
    }));

    // Set current tracking trip
    setTrackingTrip(investment.id);

    // Create a modal or popup to show the map
    showGPSTrackingModal(investment, startLocation, endLocation, truckPosition);
  };

  const showGPSTrackingModal = (investment: any, startLocation: string, endLocation: string, truckPosition: { lat: number; lng: number }) => {
    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 w-11/12 max-w-4xl h-3/4 max-h-[600px] flex flex-col overflow-hidden">
        <div class="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 class="text-2xl font-bold">GPS Tracking - ${investment.tripName}</h2>
          <button id="closeModal" class="text-gray-500 hover:text-gray-700 text-2xl hover:bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center">&times;</button>
        </div>
        <div class="mb-4 p-4 bg-blue-50 rounded flex-shrink-0 border border-blue-200">
          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              <span class="font-semibold text-gray-700">Start:</span>
              <span class="font-medium text-gray-900">${startLocation}</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-red-500 rounded-full"></div>
              <span class="font-semibold text-gray-700">Destination:</span>
              <span class="font-medium text-gray-900">${endLocation}</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span class="font-semibold text-gray-700">Progress:</span>
              <span class="font-bold text-blue-600">${investment.progress}%</span>
            </div>
          </div>
        </div>
        <div class="flex-1 min-h-0">
          <div id="map" style="width: 100%; height: 100%; border-radius: 8px; border: 1px solid #e5e7eb;"></div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Initialize map
    const mapElement = document.getElementById('map');
    const map = new google.maps.Map(mapElement, {
      zoom: 6,
      center: truckPosition,
      mapTypeId: 'roadmap'
    });

    // Add markers
    const startCoords = getLocationCoordinates(startLocation);
    const endCoords = getLocationCoordinates(endLocation);

    // Start marker (green)
    new google.maps.Marker({
      position: startCoords,
      map: map,
      title: `Start: ${startLocation}`,
      icon: {
        url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="#10B981" stroke="white" stroke-width="2"/>
            <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">S</text>
          </svg>
        `),
        scaledSize: new google.maps.Size(32, 32)
      }
    });

    // End marker (red)
    new google.maps.Marker({
      position: endCoords,
      map: map,
      title: `Destination: ${endLocation}`,
      icon: {
        url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="#EF4444" stroke="white" stroke-width="2"/>
            <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">E</text>
          </svg>
        `),
        scaledSize: new google.maps.Size(32, 32)
      }
    });

    // Realistic Truck marker - animated
    const truckMarker = new google.maps.Marker({
      position: truckPosition,
      map: map,
      title: `Truck Location (${investment.progress}% complete)`,
      icon: {
        url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
          <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <!-- Shadow -->
            <ellipse cx="24" cy="44" rx="20" ry="3" fill="rgba(0,0,0,0.2)"/>

            <!-- Truck Body -->
            <g transform="translate(4, 8)">
              <!-- Main Cabin -->
              <rect x="2" y="8" width="14" height="12" rx="2" fill="#E53E3E" stroke="#C53030" stroke-width="1"/>
              <!-- Windshield -->
              <rect x="3" y="9" width="12" height="6" rx="1" fill="#87CEEB" stroke="#4682B4" stroke-width="0.5"/>
              <!-- Side Window -->
              <rect x="13" y="11" width="2" height="4" fill="#87CEEB" stroke="#4682B4" stroke-width="0.5"/>

              <!-- Cargo Container -->
              <rect x="16" y="6" width="20" height="16" rx="1" fill="#F7FAFC" stroke="#E2E8F0" stroke-width="1"/>
              <!-- Container Details -->
              <line x1="20" y1="6" x2="20" y2="22" stroke="#E2E8F0" stroke-width="1"/>
              <line x1="24" y1="6" x2="24" y2="22" stroke="#E2E8F0" stroke-width="1"/>
              <line x1="28" y1="6" x2="28" y2="22" stroke="#E2E8F0" stroke-width="1"/>
              <line x1="32" y1="6" x2="32" y2="22" stroke="#E2E8F0" stroke-width="1"/>

              <!-- Headlights -->
              <circle cx="2" cy="12" r="1.5" fill="#FFF3A0" stroke="#F6E05E" stroke-width="0.5"/>
              <circle cx="2" cy="16" r="1.5" fill="#FFF3A0" stroke="#F6E05E" stroke-width="0.5"/>

              <!-- Front Bumper -->
              <rect x="0" y="10" width="2" height="8" rx="1" fill="#2D3748"/>

              <!-- Wheels -->
              <circle cx="8" cy="22" r="3" fill="#2D3748" stroke="#1A202C" stroke-width="1"/>
              <circle cx="8" cy="22" r="1.5" fill="#4A5568"/>
              <circle cx="18" cy="22" r="3" fill="#2D3748" stroke="#1A202C" stroke-width="1"/>
              <circle cx="18" cy="22" r="1.5" fill="#4A5568"/>
              <circle cx="30" cy="22" r="3" fill="#2D3748" stroke="#1A202C" stroke-width="1"/>
              <circle cx="30" cy="22" r="1.5" fill="#4A5568"/>

              <!-- Side Mirror -->
              <rect x="15" y="10" width="1" height="2" fill="#4A5568"/>

              <!-- Door Handle -->
              <rect x="10" y="14" width="2" height="0.5" rx="0.25" fill="#4A5568"/>
            </g>
          </svg>
        `),
        scaledSize: new google.maps.Size(48, 48),
        anchor: new google.maps.Point(24, 40)
      }
    });

    // Create Directions Service for real road routing
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true, // We'll use our custom markers
      suppressInfoWindows: true,
      polylineOptions: {
        strokeColor: '#2563EB', // Darker blue for highways
        strokeOpacity: 0.9,
        strokeWeight: 6, // Thicker line for highway appearance
        zIndex: 100
      }
    });
    directionsRenderer.setMap(map);

    // Check API key availability first
    console.log('Google Maps API status:', !!window.google?.maps?.DirectionsService);
    console.log('Attempting route from:', startLocation, 'to:', endLocation);

    // Simplified route request to avoid API restrictions
    const routeRequest = {
      origin: startLocation + ', India', // Use place names instead of coordinates
      destination: endLocation + ', India',
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
      region: 'IN'
    };

    console.log('Requesting route from', startLocation, 'to', endLocation);

    directionsService.route(routeRequest, (result, status) => {
      console.log('Directions status:', status);

      if (status === google.maps.DirectionsStatus.OK && result) {
        console.log('Route found successfully');

        // Set the directions on the renderer
        directionsRenderer.setDirections(result);

        // Get DETAILED route path that follows ACTUAL ROADS
        const route = result.routes[0];
        const leg = route.legs[0];

        // Get DETAILED path with ALL road points, not just overview
        let detailedPath: google.maps.LatLng[] = [];

        // Extract ALL points from ALL steps to get complete road path
        leg.steps.forEach(step => {
          if (step.path && step.path.length > 0) {
            detailedPath = detailedPath.concat(step.path);
          }
        });

        // Use detailed path if available, fallback to overview
        const path = detailedPath.length > 0 ? detailedPath : route.overview_path;

        console.log('Got DETAILED road path with', path.length, 'actual road points (not straight line!)');
        console.log('Route steps:', leg.steps.length, 'road segments');

        // Calculate truck position along the actual route
        const totalPoints = path.length;
        const progressIndex = Math.min(Math.floor((investment.progress / 100) * (totalPoints - 1)), totalPoints - 1);

        console.log('Route has', totalPoints, 'points, truck at index', progressIndex);

        const actualTruckPosition = {
          lat: path[progressIndex].lat(),
          lng: path[progressIndex].lng()
        };

        // Update truck marker position to be on actual route
        truckMarker.setPosition(actualTruckPosition);

        // IMPORTANT: Remove the default blue route line from DirectionsRenderer
        // and draw our own custom route lines that follow ACTUAL ROADS
        directionsRenderer.setOptions({
          polylineOptions: {
            strokeOpacity: 0 // Hide the default route line
          }
        });

        // Draw REAL ROAD PATH - Full Route (Blue)
        const fullRoadPath = new google.maps.Polyline({
          path: path, // This follows ACTUAL ROADS, not straight lines
          geodesic: false,
          strokeColor: '#2563EB',
          strokeOpacity: 0.7,
          strokeWeight: 6,
          zIndex: 100
        });
        fullRoadPath.setMap(map);

        // Draw COMPLETED ROAD PATH (Green) - Only the portion traveled
        if (progressIndex > 0) {
          const completedRoadPath = path.slice(0, progressIndex + 1);
          const completedPath = new google.maps.Polyline({
            path: completedRoadPath, // This shows completed ROAD path, not straight line
            geodesic: false,
            strokeColor: '#10B981',
            strokeOpacity: 1.0,
            strokeWeight: 8,
            zIndex: 200 // Higher priority than full route
          });
          completedPath.setMap(map);

          console.log('Drawing completed road path with', completedRoadPath.length, 'road points');
        }

        console.log('Drawing full road path with', path.length, 'road points - NO STRAIGHT LINES!');

        // Extract detailed route information
        const distance = leg.distance?.text || 'Unknown';
        const duration = leg.duration?.text || 'Unknown';
        const durationInTraffic = leg.duration_in_traffic?.text || duration;

        // Calculate completed distance and time
        const totalDistanceKm = leg.distance?.value ? (leg.distance.value / 1000) : 0;
        const totalDurationMin = leg.duration?.value ? (leg.duration.value / 60) : 0;

        const completedDistanceKm = (totalDistanceKm * investment.progress / 100);
        const completedDurationMin = (totalDurationMin * investment.progress / 100);
        const remainingDurationMin = totalDurationMin - completedDurationMin;

        const formatDuration = (minutes: number) => {
          const hours = Math.floor(minutes / 60);
          const mins = Math.round(minutes % 60);
          return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
        };

        // Update modal with detailed route info
        const routeInfoDiv = document.createElement('div');
        routeInfoDiv.className = 'mt-3 p-3 bg-green-50 border border-green-200 rounded text-sm';
        routeInfoDiv.innerHTML = `
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="font-semibold text-green-800 mb-2">Route Information</div>
              <div class="space-y-1 text-xs">
                <div><strong>Total Distance:</strong> ${distance}</div>
                <div><strong>Est. Duration:</strong> ${duration}</div>
                <div><strong>In Traffic:</strong> ${durationInTraffic}</div>
              </div>
            </div>
            <div>
              <div class="font-semibold text-blue-800 mb-2">Progress Details</div>
              <div class="space-y-1 text-xs">
                <div><strong>Completed:</strong> ${completedDistanceKm.toFixed(1)} km</div>
                <div><strong>Time Elapsed:</strong> ${formatDuration(completedDurationMin)}</div>
                <div><strong>ETA Remaining:</strong> ${formatDuration(remainingDurationMin)}</div>
              </div>
            </div>
          </div>
        `;

        const infoPanel = modal.querySelector('.bg-blue-50');
        if (infoPanel) {
          infoPanel.appendChild(routeInfoDiv);
        }

        // Store route path for animation
        window.currentRoutePath = path;

        console.log('Route info added:', {
          distance: distance,
          duration: duration,
          completed: completedDistanceKm.toFixed(1) + ' km'
        });

      } else {
        console.error('Directions API failed with status:', status, '- Trying alternative routing...');

        // TRY ALTERNATIVE ROUTING with fewer constraints
        const fallbackRequest = {
          origin: new google.maps.LatLng(startCoords.lat, startCoords.lng),
          destination: new google.maps.LatLng(endCoords.lat, endCoords.lng),
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
          region: 'IN'
        };

        // Retry with simpler request
        directionsService.route(fallbackRequest, (fallbackResult, fallbackStatus) => {
          if (fallbackStatus === google.maps.DirectionsStatus.OK && fallbackResult) {
            console.log('Fallback route found successfully!');

            const fallbackRoute = fallbackResult.routes[0];
            const fallbackLeg = fallbackRoute.legs[0];

            // Get detailed path from fallback route
            let fallbackDetailedPath: google.maps.LatLng[] = [];
            fallbackLeg.steps.forEach(step => {
              if (step.path && step.path.length > 0) {
                fallbackDetailedPath = fallbackDetailedPath.concat(step.path);
              }
            });

            const fallbackPath = fallbackDetailedPath.length > 0 ? fallbackDetailedPath : fallbackRoute.overview_path;

            console.log('Fallback route has', fallbackPath.length, 'road points');

            // Draw the REAL ROAD path
            const fullRoadPath = new google.maps.Polyline({
              path: fallbackPath,
              geodesic: false,
              strokeColor: '#F59E0B', // Orange for fallback route
              strokeOpacity: 0.8,
              strokeWeight: 5,
              zIndex: 100
            });
            fullRoadPath.setMap(map);

            // Position truck on actual road
            const fallbackProgressIndex = Math.min(
              Math.floor((investment.progress / 100) * (fallbackPath.length - 1)),
              fallbackPath.length - 1
            );
            const actualTruckPos = {
              lat: fallbackPath[fallbackProgressIndex].lat(),
              lng: fallbackPath[fallbackProgressIndex].lng()
            };
            truckMarker.setPosition(actualTruckPos);

            // Draw completed portion
            if (fallbackProgressIndex > 0) {
              const completedRoadPath = fallbackPath.slice(0, fallbackProgressIndex + 1);
              const completedPath = new google.maps.Polyline({
                path: completedRoadPath,
                geodesic: false,
                strokeColor: '#10B981',
                strokeOpacity: 1.0,
                strokeWeight: 7,
                zIndex: 200
              });
              completedPath.setMap(map);
            }

            // Add fallback route info
            const distance = fallbackLeg.distance?.text || 'Unknown';
            const duration = fallbackLeg.duration?.text || 'Unknown';

            const fallbackInfoDiv = document.createElement('div');
            fallbackInfoDiv.className = 'mt-3 p-3 bg-orange-50 border border-orange-200 rounded text-sm';
            fallbackInfoDiv.innerHTML = `
              <div class="text-orange-800">
                <div class="font-semibold mb-2">🛣️ Alternative Route Found</div>
                <div class="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div><strong>Distance:</strong> ${distance}</div>
                    <div><strong>Duration:</strong> ${duration}</div>
                  </div>
                  <div>
                    <div><strong>Progress:</strong> ${investment.progress}%</div>
                    <div><strong>Following Real Roads</strong></div>
                  </div>
                </div>
              </div>
            `;

            const infoPanel = modal.querySelector('.bg-blue-50');
            if (infoPanel) {
              infoPanel.appendChild(fallbackInfoDiv);
            }

          } else {
            console.error('Both primary and fallback routing failed! Using pre-built highway path...');

            // USE PRE-BUILT REALISTIC HIGHWAY PATH
            const realisticPath = getRealisticHighwayPath(startLocation, endLocation);
            console.log('Using pre-built highway path with', realisticPath.length, 'realistic road points');

            // Draw realistic highway path
            const preBuiltRoadPath = new google.maps.Polyline({
              path: realisticPath,
              geodesic: false,
              strokeColor: '#10B981', // Green for pre-built route
              strokeOpacity: 0.8,
              strokeWeight: 6,
              zIndex: 100,
              icons: [{
                icon: {
                  path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                  scale: 4,
                  strokeColor: '#10B981'
                },
                offset: '50%',
                repeat: '100px'
              }]
            });
            preBuiltRoadPath.setMap(map);

            // Position truck on realistic path
            const pathProgressIndex = Math.min(
              Math.floor((investment.progress / 100) * (realisticPath.length - 1)),
              realisticPath.length - 1
            );
            const realisticTruckPos = {
              lat: realisticPath[pathProgressIndex].lat(),
              lng: realisticPath[pathProgressIndex].lng()
            };
            truckMarker.setPosition(realisticTruckPos);

            // Draw completed portion of realistic path
            if (pathProgressIndex > 0) {
              const completedRealisticPath = realisticPath.slice(0, pathProgressIndex + 1);
              const completedPath = new google.maps.Polyline({
                path: completedRealisticPath,
                geodesic: false,
                strokeColor: '#059669', // Darker green for completed
                strokeOpacity: 1.0,
                strokeWeight: 8,
                zIndex: 200
              });
              completedPath.setMap(map);
            }

            // Estimate distance and time for the realistic path
            let totalDistance = 0;
            for (let i = 1; i < realisticPath.length; i++) {
              totalDistance += google.maps.geometry.spherical.computeDistanceBetween(
                realisticPath[i - 1],
                realisticPath[i]
              );
            }

            const distanceKm = totalDistance / 1000;
            const estimatedHours = distanceKm / 65; // 65 km/h highway average
            const completedKm = (distanceKm * investment.progress) / 100;

            // Add pre-built route info
            const preBuiltInfoDiv = document.createElement('div');
            preBuiltInfoDiv.className = 'mt-3 p-3 bg-green-50 border border-green-200 rounded text-sm';
            preBuiltInfoDiv.innerHTML = `
              <div class="text-green-800">
                <div class="font-semibold mb-2">🛣️ Using Realistic Highway Route</div>
                <div class="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div><strong>Est. Distance:</strong> ${distanceKm.toFixed(0)} km</div>
                    <div><strong>Est. Duration:</strong> ${Math.floor(estimatedHours)}h ${Math.round((estimatedHours % 1) * 60)}m</div>
                  </div>
                  <div>
                    <div><strong>Completed:</strong> ${completedKm.toFixed(1)} km</div>
                    <div><strong>Following Highway Path</strong></div>
                  </div>
                </div>
                <div class="mt-2 text-xs text-green-600">
                  <div>✅ Route follows realistic Indian highway network</div>
                  <div>📍 Truck positioned on actual road path</div>
                </div>
              </div>
            `;

            const infoPanel = modal.querySelector('.bg-blue-50');
            if (infoPanel) {
              infoPanel.appendChild(preBuiltInfoDiv);
            }

            // Store the realistic path for animation
            window.currentRoutePath = realisticPath;
          }
        });
      }
    });

    // Fit map to show all markers
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(startCoords);
    bounds.extend(endCoords);
    bounds.extend(truckPosition);
    map.fitBounds(bounds);

    // Animate truck movement along the route
    let animationFrame = 0;
    let routePath: google.maps.LatLng[] = [];
    let currentRoutePosition = truckPosition;

    const animateTruck = () => {
      animationFrame++;

      // Use actual route path if available, otherwise use simple animation
      if (routePath.length > 0) {
        const progressIndex = Math.floor((investment.progress / 100) * (routePath.length - 1));
        const basePosition = routePath[progressIndex];

        // Add subtle movement around the route position
        const offset = Math.sin(animationFrame * 0.05) * 0.0001;
        currentRoutePosition = {
          lat: basePosition.lat() + offset,
          lng: basePosition.lng() + offset * 0.3
        };
      } else {
        // Fallback animation for straight line
        const offset = Math.sin(animationFrame * 0.1) * 0.001;
        currentRoutePosition = {
          lat: truckPosition.lat + offset,
          lng: truckPosition.lng + offset * 0.5
        };
      }

      truckMarker.setPosition(currentRoutePosition);

      if (modal.parentNode) {
        requestAnimationFrame(animateTruck);
      }
    };

    // Start animation after giving time for route to load
    setTimeout(() => {
      try {
        // Try to get the route path from the stored global variable
        if (window.currentRoutePath && window.currentRoutePath.length > 0) {
          routePath = window.currentRoutePath;
          console.log('Using real route path for animation with', routePath.length, 'points');
        } else {
          // Try to get from directions renderer
          const directions = directionsRenderer.getDirections();
          if (directions && directions.routes[0]) {
            routePath = directions.routes[0].overview_path;
            console.log('Got route from directions renderer with', routePath.length, 'points');
          }
        }
      } catch (e) {
        console.log('Using fallback animation:', e);
      }

      // Start animation regardless of route availability
      animateTruck();
    }, 2000); // Increased timeout to ensure route is loaded

    // Close modal functionality
    const closeModal = () => {
      if (modal.parentNode) {
        document.body.removeChild(modal);
        setTrackingTrip(null);
        document.removeEventListener('keydown', handleKeyPress);
      }
    };

    // Keyboard event listener for ESC key
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleKeyPress);
      }
    };

    // Wait for DOM to be ready before adding event listeners
    setTimeout(() => {
      const closeButton = document.getElementById('closeModal');
      if (closeButton) {
        closeButton.addEventListener('click', closeModal);
      }
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
      document.addEventListener('keydown', handleKeyPress);
    }, 100);

    // Auto close after 30 seconds
    setTimeout(closeModal, 30000);

    toast({
      title: "GPS Tracking Active",
      description: `Tracking ${investment.tripName} - ${investment.progress}% complete`,
    });
  };

  return (
    <div className="flex-1 space-y-6 p-6 bg-background text-foreground">
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
              {`${filteredTrips.length} of ${availableStatusTrips.length} available trips`}
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
              <span>Loading trip data ...</span>
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
        <Tabs defaultValue="live-trips" className="space-y-4">
          <TabsList>
            <TabsTrigger value="live-trips">Live Trips</TabsTrigger>
            {/* <TabsTrigger value="available">Available Trips</TabsTrigger> */}
            <TabsTrigger value="my-investments">My Investments</TabsTrigger>
          </TabsList>

          <TabsContent value="live-trips" className="space-y-4">
            {/* Live Trips Section */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Live Trips</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApiTripFilters(!showApiTripFilters)}
                  className={`${showApiTripFilters ? 'bg-blue-100 text-blue-700 border-blue-300' : ''}`}
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchApiTrips()}
                  disabled={apiTripsLoading}
                >
                  {apiTripsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
                </Button>
              </div>
            </div>

            {/* Live Trips Filters */}
            {showApiTripFilters && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Filter Trips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Start Route Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="start-route">Start Route</Label>
                    <div className="relative">
                      <Input
                        id="start-route"
                        placeholder="Search start location..."
                        value={apiTripFilters.startRoute}
                        onChange={(e) => updateApiFilter('startRoute', e.target.value)}
                      />
                      {apiTripFilters.startRoute && getApiTripStartLocations(apiTripFilters.startRoute).length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-32 overflow-y-auto">
                          {getApiTripStartLocations(apiTripFilters.startRoute).map((location, index) => (
                            <div
                              key={index}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                              onClick={() => updateApiFilter('startRoute', location)}
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
                    <Label htmlFor="end-route">End Route</Label>
                    <div className="relative">
                      <Input
                        id="end-route"
                        placeholder="Search end location..."
                        value={apiTripFilters.endRoute}
                        onChange={(e) => updateApiFilter('endRoute', e.target.value)}
                      />
                      {apiTripFilters.endRoute && getApiTripEndLocations(apiTripFilters.endRoute).length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-32 overflow-y-auto">
                          {getApiTripEndLocations(apiTripFilters.endRoute).map((location, index) => (
                            <div
                              key={index}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                              onClick={() => updateApiFilter('endRoute', location)}
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
                    <Label htmlFor="trip-name">Trip Name</Label>
                    <div className="relative">
                      <Input
                        id="trip-name"
                        placeholder="Search trip name..."
                        value={apiTripFilters.tripName}
                        onChange={(e) => updateApiFilter('tripName', e.target.value)}
                      />
                      {apiTripFilters.tripName && getApiTripNames(apiTripFilters.tripName).length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-32 overflow-y-auto">
                          {getApiTripNames(apiTripFilters.tripName).map((name, index) => (
                            <div
                              key={index}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                              onClick={() => updateApiFilter('tripName', name)}
                            >
                              {name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const resetFilters = {
                        startRoute: '',
                        endRoute: '',
                        tripName: '',
                        page: 1,
                        max_results: 10
                      };
                      setApiTripFilters(resetFilters);
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
            )}

            {/* Live Trips List */}
            {apiTripsError && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <p className="text-red-600">Error loading trips: {apiTripsError}</p>
                </CardContent>
              </Card>
            )}

            {apiTripsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading trips...</span>
              </div>
            ) : apiTrips.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No trips found matching your criteria.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Trip Stats */}
                <div className="text-sm text-muted-foreground">
                  Showing {filteredApiTrips.length} of {totalApiTrips} trips
                  {(apiTripFilters.startRoute || apiTripFilters.endRoute || apiTripFilters.tripName) &&
                    ` (${apiTrips.length - filteredApiTrips.length} filtered out)`
                  }
                </div>

                {/* Selected Trips Summary Card */}
                {selectedLiveTrips.size > 0 && (
                  <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                              {selectedLiveTrips.size} Selected
                            </Badge>
                            <span className="font-semibold text-lg text-blue-900">
                              Total Cost: ₹{getTotalSelectedCost().toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowSelectedTripsTable(!showSelectedTripsTable)}
                            className="text-blue-700 border-blue-300 hover:bg-blue-100"
                          >
                            {showSelectedTripsTable ? (
                              <>
                                <ChevronUp className="h-4 w-4 mr-1" />
                                Hide Details
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4 mr-1" />
                                Show Details
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedLiveTrips(new Set())}
                            className="text-red-700 border-red-300 hover:bg-red-100"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Clear All
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleInvestInSelectedLiveTrips}
                            disabled={isInvesting || selectedLiveTrips.size === 0}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {isInvesting ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                Investing...
                              </>
                            ) : (
                              <>
                                <TrendingUp className="h-4 w-4 mr-1" />
                                Invest All
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Collapsible Table */}
                      {showSelectedTripsTable && (
                        <div className="mt-4 border-t border-blue-200 pt-4">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-blue-200">
                                  <th className="text-left py-2 px-3 font-medium text-blue-900">Trip #</th>
                                  <th className="text-left py-2 px-3 font-medium text-blue-900">Route</th>
                                  <th className="text-left py-2 px-3 font-medium text-blue-900">Company</th>
                                  <th className="text-left py-2 px-3 font-medium text-blue-900">Vehicle</th>
                                  <th className="text-right py-2 px-3 font-medium text-blue-900">Cost</th>
                                </tr>
                              </thead>
                              <tbody>
                                {getSelectedTripsData().map((trip) => (
                                  <tr key={trip.id} className="border-b border-blue-100 hover:bg-blue-100/50">
                                    <td className="py-2 px-3 font-mono text-blue-800">#{trip.tripNumber}</td>
                                    <td className="py-2 px-3 text-blue-800">
                                      {trip.pickup?.city} → {trip.delivery?.city}
                                    </td>
                                    <td className="py-2 px-3">
                                      <div className="flex items-center gap-2">
                                        <CompanyLogo
                                          fileId={trip.rawData?.parcels?.[0]?.sender?.sender_company?.logo}
                                          companyName={trip.sender?.company || trip.name || 'Unknown Company'}
                                          size="sm"
                                        />
                                        <span className="text-blue-800 font-medium">{trip.sender?.company || trip.name || 'Unknown Company'}</span>
                                        <Badge variant="outline" className="text-xs bg-white border-blue-300 text-blue-700">
                                          #{trip.tripNumber}
                                        </Badge>
                                      </div>
                                    </td>
                                    <td className="py-2 px-3 text-blue-800">{trip.vehicleNumber}</td>
                                    <td className="py-2 px-3 text-right font-medium text-blue-800">
                                      ₹{(trip.freightCharges || trip.total_freight_Charges || 0).toLocaleString()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Multi-select Controls */}
                {filteredApiTrips.length > 0 && (
                  <div className="flex items-center gap-2 py-2">
                    <Checkbox
                      id="select-all-live-trips"
                      checked={isAllLiveTripsSelected()}
                      onCheckedChange={handleSelectAllLiveTrips}
                      className="border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <Label htmlFor="select-all-live-trips" className="text-sm font-medium cursor-pointer">
                      {isAllLiveTripsSelected() ? 'Deselect All' : 'Select All'} ({filteredApiTrips.length} trips)
                    </Label>
                  </div>
                )}

                {compactView ? (
                  /* Compact View - Multiple live trips per row */
                  <div className="space-y-2">
                    {Array.from({ length: Math.ceil(filteredApiTrips.length / 3) }, (_, rowIndex) => (
                      <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {filteredApiTrips.slice(rowIndex * 3, (rowIndex + 1) * 3).map((trip) => (
                          <Card key={trip.id} className="p-3 hover:shadow-md transition-all relative">
                            {/* Insured Badge - Compact View (Shield only, bottom-right) */}
                            <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-100 border border-green-300 rounded-full flex items-center justify-center z-10">
                              <span className="text-green-700 text-sm">🛡️</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={selectedLiveTrips.has(trip.id)}
                                onCheckedChange={(checked) => handleLiveTripSelection(trip.id, checked as boolean)}
                                className="border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 flex-shrink-0"
                              />
                              <div className="flex-shrink-0">
                                <CompanyLogo
                                  fileId={trip.rawData?.parcels?.[0]?.sender?.sender_company?.logo}
                                  companyName={trip.sender?.company || trip.name || 'Unknown Company'}
                                  size="sm"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <h3 className="font-semibold text-sm truncate cursor-help">
                                            {trip.sender?.company || trip.name || 'Unknown Company'}
                                          </h3>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="max-w-xs">{trip.sender?.company || trip.name || 'Unknown Company'}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5 flex-shrink-0">
                                      #{trip.tripNumber}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                  <MapPin className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{trip.pickup?.city} → {trip.delivery?.city}</span>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                  <div className="text-xs font-medium text-green-700">
                                    ₹{((trip.freightCharges || trip.total_freight_Charges || 0) / 1000).toFixed(0)}K
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() => handleInvestInSingleTrip(trip)}
                                    disabled={isInvesting}
                                    className="h-6 px-2 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    {isInvesting ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      "Invest"
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Full View - Sleek Trip Cards */
                  <div className="grid gap-3">
                    {filteredApiTrips.map((trip) => (
                      <Card key={trip.id} className="p-0 hover:shadow-md transition-shadow relative">
                        {/* Insured Badge */}
                        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-700 border-green-300 text-xs"
                          >
                            🛡️ Insured
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => handleInvestInSingleTrip(trip)}
                            disabled={isInvesting}
                            className="h-6 px-2 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {isInvesting ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              "Invest"
                            )}
                          </Button>
                        </div>

                        <CardContent className="p-4">
                          <div className="flex items-center justify-between py-1">
                            {/* Left Section - Trip Info */}
                            <div className="flex items-center gap-6">
                              {/* Selection Checkbox */}
                              <Checkbox
                                checked={selectedLiveTrips.has(trip.id)}
                                onCheckedChange={(checked) => handleLiveTripSelection(trip.id, checked as boolean)}
                                className="border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 flex-shrink-0"
                              />

                              {/* Company Info Section - Double Fixed Width */}
                              <div className="flex items-center gap-3 w-160 flex-shrink-0">
                                <CompanyLogo
                                  fileId={trip.rawData?.parcels?.[0]?.sender?.sender_company?.logo}
                                  companyName={trip.sender?.company || trip.name || 'Unknown Company'}
                                  size="lg"
                                  className="flex-shrink-0"
                                />
                                <div className="flex flex-col gap-1 min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="font-semibold text-sm text-gray-800 truncate cursor-help">
                                            {trip.sender?.company || trip.name || 'Unknown Company'}
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="max-w-xs">{trip.sender?.company || trip.name || 'Unknown Company'}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-blue-100 text-blue-700 border-blue-300 flex-shrink-0"
                                    >
                                      #{trip.tripNumber}
                                    </Badge>
                                    {trip.locked && <Lock className="h-3 w-3 text-orange-500 flex-shrink-0" />}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    📦 {trip.materialType} • {trip.quantity} {trip.quantityUnit?.toLowerCase()}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Right Section - Route, Cost & Actions */}
                            <div className="flex items-center gap-6 mr-16">
                              {/* Route Section */}
                              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border">
                                <div className="text-center">
                                  <div className="text-xs text-muted-foreground font-medium">FROM</div>
                                  <div className="font-semibold text-sm text-gray-800">{trip.pickup?.city}</div>
                                </div>
                                <Navigation className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                <div className="text-center">
                                  <div className="text-xs text-muted-foreground font-medium">TO</div>
                                  <div className="font-semibold text-sm text-gray-800">{trip.delivery?.city}</div>
                                </div>
                              </div>

                              {/* Cost Section */}
                              <div className="flex flex-col items-center justify-center text-center px-4 py-2 bg-green-50 rounded-lg border border-green-200 min-w-[100px] h-[52px]">
                                <div className="text-xs text-green-600 font-medium">TOTAL COST</div>
                                <div className="font-bold text-lg text-green-700">₹{(trip.freightCharges / 1000).toFixed(0)}K</div>
                              </div>

                              {/* Expand Button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleTripExpansion(trip.id)}
                                className="p-2 h-10 w-10 hover:bg-gray-100 flex-shrink-0"
                              >
                                {expandedTrips.has(trip.id) ? (
                                  <ChevronUp className="h-5 w-5 text-gray-600" />
                                ) : (
                                  <ChevronDown className="h-5 w-5 text-gray-600" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Expanded Details Section */}
                          {expandedTrips.has(trip.id) && (
                              <div className="mt-6 pt-4 border-t bg-gray-50 rounded-lg p-4">
                              <div className="grid md:grid-cols-2 gap-6">
                                {/* Timeline Details */}
                                <div>
                                  <h5 className="font-semibold mb-3 flex items-center gap-2">
                                    <Timer className="h-4 w-4" />
                                    Trip Timeline
                                  </h5>
                                  <div className="space-y-3">
                                    {trip.tripStages.map((stage, index) => (
                                      <div key={index} className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                                          stage.isCompleted ? 'bg-green-500' :
                                          index === trip.currentStageIndex ? 'bg-blue-500' :
                                          'bg-gray-300'
                                        }`} />
                                        <div className="flex-1">
                                          <div className={`text-sm font-medium ${
                                            stage.isCompleted ? 'text-green-700' :
                                            index === trip.currentStageIndex ? 'text-blue-700' :
                                            'text-gray-500'
                                          }`}>
                                            {stage.stage}
                                          </div>
                                          {stage.startTime && (
                                            <div className="text-xs text-muted-foreground">
                                              {stage.startTime.toLocaleDateString()} {stage.startTime.toLocaleTimeString()}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Additional Details */}
                                <div>
                                  <h5 className="font-semibold mb-3 flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Additional Information
                                  </h5>
                                  <div className="space-y-3">
                                    {/* Vehicle Information */}
                                    <div className="p-3 bg-white rounded border">
                                      <div className="text-sm font-medium mb-2">🚛 Vehicle Details</div>
                                      <div className="space-y-1 text-xs">
                                        <div className="flex justify-between">
                                          <span>Vehicle Number:</span>
                                          <span className="font-medium">{trip.vehicleNumber}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Provider:</span>
                                          <span>{trip.vehicleProvider}</span>
                                        </div>
                                        {trip.crew.length > 0 && (
                                          <>
                                            <div className="border-t pt-1 mt-1">
                                              <span className="text-xs font-medium">Crew:</span>
                                            </div>
                                            {trip.crew.map((member, index) => (
                                              <div key={index} className="flex justify-between">
                                                <span>{member.position}:</span>
                                                <span className="font-medium">{member.name}</span>
                                              </div>
                                            ))}
                                          </>
                                        )}
                                      </div>
                                    </div>



                                    {/* Trip Settings */}
                                    <div className="p-3 bg-white rounded border">
                                      <div className="text-sm font-medium mb-2">⚙️ Settings</div>
                                      <div className="space-y-1 text-xs">
                                        <div className="flex justify-between">
                                          <span>Travel Mode:</span>
                                          <span>{trip.travelMode}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Do Not Disturb:</span>
                                          <span>{trip.doNotDisturb ? 'Yes' : 'No'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Locked:</span>
                                          <span>{trip.locked ? 'Yes' : 'No'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Part Load:</span>
                                          <span>{trip.partLoad ? 'Yes' : 'No'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Shareable Vehicle:</span>
                                          <span>{trip.okToShareVehicle ? 'Yes' : 'No'}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Third Party Expenses */}
                                    {trip.thirdPartyExpenses && trip.thirdPartyExpenses.charges > 0 && (
                                      <div className="p-3 bg-white rounded border">
                                        <div className="text-sm font-medium mb-2">💰 Third Party Expenses</div>
                                        <div className="text-xs">
                                          <div className="flex justify-between">
                                            <span>{trip.thirdPartyExpenses.name || 'Miscellaneous'}:</span>
                                            <span>₹{trip.thirdPartyExpenses.charges.toLocaleString()}</span>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                    </Card>
                  ))}
                </div>
                )}

                {/* Pagination */}
                {totalApiPages > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Page {apiCurrentPage} of {totalApiPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newFilters = { ...apiTripFilters, page: apiCurrentPage - 1 };
                          setApiTripFilters(newFilters);
                          refetchApiTrips(newFilters);
                        }}
                        disabled={apiCurrentPage === 1 || apiTripsLoading}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newFilters = { ...apiTripFilters, page: apiCurrentPage + 1 };
                          setApiTripFilters(newFilters);
                          refetchApiTrips(newFilters);
                        }}
                        disabled={apiCurrentPage === totalApiPages || apiTripsLoading}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {false && (
        <TabsContent value="available" className="space-y-4">
          {/* Available Trips Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Available Trips</h2>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="text-sm text-muted-foreground">
                {`${filteredTrips.length} of ${availableStatusTrips.length} available trips`}
              </span>
            </div>
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
                        {/* Trip managed by section at top center */}
                        <div className="flex items-center justify-center gap-2 mb-3 pb-2 border-b border-gray-100">
                          <span className="text-xs text-muted-foreground">Trip managed by:</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex-shrink-0 cursor-pointer">
                                  <img
                                    src={`/${trip.managedBy.image}`}
                                    alt={`Managed by ${trip.managedBy.name}`}
                                    className="w-6 h-6 object-contain"
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{trip.managedBy.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedTrips.has(trip.id)}
                            onCheckedChange={(checked) => handleTripSelection(trip.id, !!checked)}
                            disabled={trip.status === "completed" || isLocked || isProcessing}
                            className="flex-shrink-0"
                          />
                          <div className="flex-shrink-0">
                            <CompanyLogo
                              fileId={trip.rawData?.parcels?.[0]?.sender?.sender_company?.logo}
                              companyName={trip.sender?.company || trip.name || 'Unknown Company'}
                              size="sm"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <h3 className="font-semibold text-sm truncate">{trip.name}</h3>
                                <Badge variant="secondary" className="text-xs px-1.5 py-0.5 flex-shrink-0">
                                  {trip.tripId ? trip.tripId.slice(-6) : trip.id.slice(-6)}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex-shrink-0 cursor-pointer">
                                        <img
                                          src={`/manage-trip/${trip.truckImage}`}
                                          alt={`${getTruckNameFromImage(trip.truckImage)} truck`}
                                          className="w-12 h-12 object-contain"
                                        />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{getTruckNameFromImage(trip.truckImage)}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                {getStatusBadge(trip.status)}
                                {getInsuredBadge(trip.insured)}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{trip.location}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Freight: ₹{(trip.freightCharges / 1000).toFixed(0)}K
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
                  {/* Trip managed by section at top center */}
                  <div className="flex items-center justify-center gap-2 mb-3 pb-2 border-b border-gray-100">
                    <span className="text-sm text-muted-foreground">Trip managed by:</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex-shrink-0 cursor-pointer">
                            <img
                              src={`/${trip.managedBy.image}`}
                              alt={`Managed by ${trip.managedBy.name}`}
                              className="w-8 h-8 object-contain"
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{trip.managedBy.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Checkbox
                        checked={selectedTrips.has(trip.id)}
                        onCheckedChange={(checked) => handleTripSelection(trip.id, !!checked)}
                        disabled={trip.status === "completed" || isLocked || isProcessing}
                        className="mt-0.5"
                      />
                      {trip.companyLogo && (
                        <div className="flex-shrink-0 mr-3">
                          <img
                            src={trip.companyLogo}
                            alt={`${trip.name} logo`}
                            className="w-10 h-10 object-contain rounded border border-gray-200 bg-white"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                            <CardTitle className="text-sm font-semibold truncate">{trip.name}</CardTitle>
                            <Badge variant="secondary" className="text-xs px-1.5 py-0.5 flex-shrink-0">
                              {trip.tripId ? trip.tripId.slice(-6) : trip.id.slice(-6)}
                            </Badge>
                            {trip.category && (
                              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                                {trip.category}
                              </Badge>
                            )}
                          </div>
                          <div className="ml-2 flex-shrink-0 flex items-center gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex-shrink-0 cursor-pointer">
                                    <img
                                      src={`/manage-trip/${trip.truckImage}`}
                                      alt={`${getTruckNameFromImage(trip.truckImage)} truck`}
                                      className="w-16 h-16 object-contain"
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{getTruckNameFromImage(trip.truckImage)}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            {getStatusBadge(trip.status)}
                            {getInsuredBadge(trip.insured)}
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
                              <span className="text-xs">Lenders:</span>
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
                      <span className="font-medium">Progress: {getProgress(trip.currentAmount, trip.freightCharges)}%</span>
                      {trip.endDate && getRemainingDays(trip.endDate) <= 180 && (
                        <span className="text-muted-foreground">
                          {getRemainingDays(trip.endDate)} days left
                        </span>
                      )}
                    </div>
                    <Progress
                      value={getProgress(trip.currentAmount, trip.freightCharges)}
                      className="h-1.5"
                    />
                  </div>

                  {/* Trip Details - Single Row */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
                    <div>
                      <span className="text-muted-foreground">Freight Charges</span>
                      <p className="font-medium">₹{(trip.freightCharges / 1000).toFixed(0)}K</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Progress</span>
                      <p className="font-medium">{getProgress(trip.currentAmount, trip.freightCharges)}%</p>
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
        )}

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
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {investment.companyLogo && (
                              <img
                                src={investment.companyLogo}
                                alt={`${investment.tripName} logo`}
                                className="w-6 h-6 object-contain rounded border border-gray-200 flex-shrink-0"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            )}
                            <h3 className="font-semibold text-sm truncate">{investment.tripName}</h3>
                          </div>
                          {getStatusBadge(investment.status)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          From: {investment.tripStartDate} to {investment.expectedEndDate}
                        </div>
                        <div className={`grid gap-2 text-xs ${investment.status === "completed" ? "grid-cols-4" : "grid-cols-2"}`}>
                          <div>
                            <span className="text-muted-foreground">Amount</span>
                            <p className="font-semibold">₹{(investment.amount / 1000).toFixed(0)}K</p>
                          </div>
                          {investment.status === "completed" && (investment as any).profitGain && (
                            <div>
                              <span className="text-muted-foreground">Profit Gain</span>
                              <p className="font-semibold text-primary">₹{((investment as any).profitGain.amount / 1000).toFixed(1)}K ({(investment as any).profitGain.percentage}%)</p>
                            </div>
                          )}
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
              <Card key={investment.id} className="overflow-hidden trip-card relative">
                <CardHeader className="pb-2 p-3">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                        {investment.companyLogo && (
                          <img
                            src={investment.companyLogo}
                            alt={`${investment.tripName} logo`}
                            className="w-8 h-8 object-contain rounded border border-gray-200 flex-shrink-0 bg-white"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        )}
                        <CardTitle className="text-sm font-semibold truncate">{investment.tripName}</CardTitle>
                        {investment.status === "completed" ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : (
                          <Clock className="h-4 w-4 text-warning" />
                        )}
                      </div>
                      <div className="ml-2 flex-shrink-0 flex items-center gap-2">
                        {/* GPS Tracking Icon for Active Trips */}
                        {investment.status !== "completed" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGPSTracking(investment)}
                            className="h-6 w-6 p-0 rounded-full bg-blue-100 hover:bg-blue-200 border border-blue-300"
                            disabled={trackingTrip === investment.id}
                            title="Track GPS Location"
                          >
                            {trackingTrip === investment.id ? (
                              <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                            ) : (
                              <Navigation className="h-3 w-3 text-blue-600" />
                            )}
                          </Button>
                        )}
                        {getStatusBadge(investment.status)}
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      From: {investment.tripStartDate} to {investment.expectedEndDate}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-3 pt-0 space-y-3">
                  {/* Investment Overview and GPS Tracking - Compact Grid */}
                  <div className="space-y-3">
                    <div className={`grid gap-2 text-xs ${investment.status === "completed" ? "grid-cols-5" : "grid-cols-3"}`}>
                      <div>
                        <span className="text-muted-foreground">Amount Invested</span>
                        <p className="font-semibold">₹{(investment.amount / 1000).toFixed(0)}K</p>
                      </div>
                      {investment.status === "completed" && (investment as any).profitGain && (
                        <div>
                          <span className="text-muted-foreground">Profit Gain</span>
                          <p className="font-semibold text-primary">₹{((investment as any).profitGain.amount / 1000).toFixed(1)}K ({(investment as any).profitGain.percentage}%)</p>
                        </div>
                      )}
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