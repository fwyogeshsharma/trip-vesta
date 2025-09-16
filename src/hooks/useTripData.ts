// Hook to load trip data from Excel file
import { useState, useEffect } from 'react';
import { TripData, readTripExcelFile, getFallbackTripData } from '@/utils/excelReader';

interface UseTripDataReturn {
  trips: TripData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useTripData = (): UseTripDataReturn => {
  const [trips, setTrips] = useState<TripData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadTripData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to read from Excel file first
      const excelTrips = await readTripExcelFile('/trip-summary-report.xlsx');
      setTrips(excelTrips);
      console.log('Loaded trip data from Excel:', excelTrips);
    } catch (excelError) {
      console.warn('Failed to load from Excel, using fallback data:', excelError);

      // Use fallback data if Excel reading fails
      const fallbackTrips = getFallbackTripData();
      setTrips(fallbackTrips);
      setError('Using demo data - Excel file could not be loaded');
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await loadTripData();
  };

  useEffect(() => {
    loadTripData();
  }, []);

  return {
    trips,
    loading,
    error,
    refetch
  };
};