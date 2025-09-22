// Hook to load trip data from API
import { useState, useEffect } from 'react';
import { getTrips, TripData, TripsResponse, GetTripsParams, formatTripForDisplay } from '@/services/tripService';

interface UseApiTripsReturn {
  trips: any[];
  loading: boolean;
  error: string | null;
  refetch: (params?: Partial<GetTripsParams>) => Promise<void>;
  totalTrips: number;
  currentPage: number;
  totalPages: number;
}

const DEFAULT_COMPANY_ID = '62d66794e54f47829a886a1d';

export const useApiTrips = (initialParams?: Partial<GetTripsParams>): UseApiTripsReturn => {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalTrips, setTotalTrips] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);

  const loadTrips = async (params?: Partial<GetTripsParams>) => {
    setLoading(true);
    setError(null);

    try {
      const requestParams: GetTripsParams = {
        trip_owner_company_id: DEFAULT_COMPANY_ID,
        trip_status: params?.trip_status || initialParams?.trip_status || 'All',
        trip_stage: params?.trip_stage || initialParams?.trip_stage || 'Vehicle Booking',
        trip_handler_id: params?.trip_handler_id || initialParams?.trip_handler_id || '',
        sort: '[("_created",-1)]',
        page: params?.page || initialParams?.page || 1,
        max_results: params?.max_results || initialParams?.max_results || 10
      };

      console.log('Fetching trips with params:', requestParams);
      const response: TripsResponse = await getTrips(requestParams);

      console.log('Raw API response:', response);

      // Check if response has the expected structure
      if (!response._items || !Array.isArray(response._items)) {
        throw new Error('Invalid API response: missing _items array');
      }

      // Format trips for display with error handling for each trip
      const formattedTrips = response._items.map((trip, index) => {
        try {
          return formatTripForDisplay(trip);
        } catch (formatError) {
          console.error(`Error formatting trip ${index}:`, formatError);
          console.error('Problematic trip data:', trip);
          throw new Error(`Failed to format trip ${trip._id || index}: ${formatError.message}`);
        }
      });

      setTrips(formattedTrips);
      setTotalTrips(response._meta?.total || 0);
      setCurrentPage(response._meta?.page || 1);
      setTotalPages(Math.ceil((response._meta?.total || 0) / (response._meta?.max_results || 10)));

      console.log('Loaded trips from API:', formattedTrips);
      console.log('Total trips:', response._meta?.total || 0);
    } catch (apiError: any) {
      console.error('Failed to load trips from API:', apiError);
      console.error('Error stack:', apiError.stack);
      setError(apiError.message || 'Failed to load trips from API');
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async (params?: Partial<GetTripsParams>) => {
    await loadTrips(params);
  };

  useEffect(() => {
    loadTrips();
  }, []);

  return {
    trips,
    loading,
    error,
    refetch,
    totalTrips,
    currentPage,
    totalPages
  };
};