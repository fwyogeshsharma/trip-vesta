// API service for trip management
import { getAuthToken } from './authService';

// Base API URL from auth service
const API_BASE_URL = 'https://35.244.19.78:8042';

export interface TripParcel {
  _id: string;
  _created: string;
  actual_kanta_weight: {
    weight: number | null;
    weight_unit: string;
  };
  charges: {
    freight_charges: number;
  };
  cost: number;
  material_type: {
    _id: string;
    name: string;
  };
  pickup_postal_address: {
    address_line_1: string;
    city: {
      _id: string;
      city_name: string;
      state_iso_code_name: string;
    };
    pin: number;
  };
  unload_postal_address: {
    address_line_1: string;
    city: {
      _id: string;
      city_name: string;
      state_iso_code_name: string;
    };
    pin: number;
  };
  quantity: number;
  quantity_unit: string;
  receiver: {
    name: string;
    gstin: string;
    receiver_company: {
      _id: string;
      name: string;
      phone: string | null;
    };
  };
  sender: {
    name: string;
    gstin: string;
    sender_company: {
      _id: string;
      name: string;
      phone: string | null;
      logo?: string;
    };
  };
  verification: string;
}

export interface TripData {
  _id: string;
  _created: string;
  _updated: string;
  trip_number: string;
  trip_stage: string;
  advance_amount: number;
  total_freight_charge: number;
  quantity_in_tons: number;
  travel_mode: string;
  booked_vehicle?: {
    rc_number: string;
  };
  crew: Array<{
    name: string;
    position: string;
    worker: string;
  }>;
  handled_by: {
    _id: string;
    name: string;
  };
  parcels: TripParcel[];
  purchase_order: {
    _id: string;
    purchase_order_number: number;
    total_cost: number;
    status: string;
    balances: {
      actual_to_be_paid_amount: number;
      to_be_paid_amount: number;
      total_payable_amount: number;
    };
    vehicle_provider: {
      _id: string;
      name: string;
    };
  };
  trip_stages: Array<{
    start_datetime: string | null;
    trip_stage: string;
  }>;
  payment_status_flags: {
    vehicle: {
      advance_done: boolean;
      clearance_done: boolean;
    };
  };
}

export interface TripsResponse {
  _items: TripData[];
  _meta: {
    max_results: number;
    page: number;
    total: number;
  };
}

export interface GetTripsParams {
  trip_owner_company_id: string;
  trip_status?: string;
  trip_stage?: string;
  trip_handler_id?: string;
  sort?: string;
  page?: number;
  max_results?: number;
}

/**
 * Get trips from the API
 */
export const getTrips = async (params: GetTripsParams): Promise<TripsResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Build query parameters
    const queryParams = new URLSearchParams();

    // Required parameter
    queryParams.append('trip_owner_company_id', params.trip_owner_company_id);

    // Optional parameters with defaults
    queryParams.append('trip_status', params.trip_status || 'All');
    queryParams.append('trip_stage', params.trip_stage || 'Vehicle Booking');

    if (params.trip_handler_id) {
      queryParams.append('trip_handler_id', params.trip_handler_id);
    }

    queryParams.append('sort', params.sort || '[("_created",-1)]');
    queryParams.append('page', (params.page || 1).toString());
    queryParams.append('max_results', (params.max_results || 10).toString());

    const response = await fetch(`${API_BASE_URL}/v2/get_trips?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching trips:', error);
    throw new Error('Failed to fetch trips. Please try again.');
  }
};

/**
 * Get available trip stages for filtering
 */
export const getTripStages = (): string[] => {
  return [
    'All',
    'Parcel Information',
    'Bidding',
    'Vehicle Booking',
    'Loading',
    'Documents Collection',
    'Enroute',
    'Unloading',
    'Clear POD Balance',
    'Original POD with invoice submitted to consignor',
    'POD Invoice Clearance',
    'Trip Completed',
    'Trip Cancelled'
  ];
};

/**
 * Get available trip statuses for filtering
 */
export const getTripStatuses = (): string[] => {
  return [
    'All',
    'Active',
    'Completed',
    'Cancelled'
  ];
};

/**
 * Get file from the API by file ID
 */
export const getFileFromId = async (fileId: string): Promise<any> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const queryParams = new URLSearchParams();
    queryParams.append('where', `{"_id":"${fileId}"}`);

    const response = await fetch(`${API_BASE_URL}/files?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching file:', error);
    throw new Error('Failed to fetch file. Please try again.');
  }
};

/**
 * Get image bytes from file ID for displaying logos
 */
export const getImageBytesFromFileId = async (fileId: string | null): Promise<string | null> => {
  if (!fileId) return null;

  try {
    const response = await getFileFromId(fileId);
    if (!response) return null;

    const fileItem = response['_items']?.[0]?.['file'];

    if (fileItem?.['file'] && fileItem?.['content_type'] !== 'application/pdf') {
      // Return base64 data URL for React images
      return `data:${fileItem['content_type']};base64,${fileItem['file']}`;
    }
    return null;
  } catch (error) {
    console.error('Error getting image bytes from file ID:', error);
    return null;
  }
};

/**
 * Get company record by company ID
 */
export const getCompanyRecord = async (companyId: string): Promise<any> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const queryParams = new URLSearchParams();
    queryParams.append('company_id', companyId);

    const response = await fetch(`${API_BASE_URL}/get_company_record?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching company record:', error);
    throw new Error('Failed to fetch company record. Please try again.');
  }
};

/**
 * Format trip data for display
 */
export const formatTripForDisplay = (trip: TripData) => {
  const mainParcel = trip.parcels[0];
  const purchaseOrder = trip.purchase_order;
  const extraCharges = purchaseOrder?.extra_charges;

  return {
    id: trip._id,
    tripNumber: trip.trip_number,
    stage: trip.trip_stage,
    created: new Date(trip._created).toLocaleDateString(),
    createdTime: new Date(trip._created).toLocaleTimeString(),
    updated: new Date(trip._updated).toLocaleDateString(),
    updatedTime: new Date(trip._updated).toLocaleTimeString(),

    // Route information with full addresses
    pickup: mainParcel ? {
      city: mainParcel.pickup_postal_address.city.city_name,
      state: mainParcel.pickup_postal_address.city.state_iso_code_name,
      address: mainParcel.pickup_postal_address.address_line_1,
      pin: mainParcel.pickup_postal_address.pin,
      fullAddress: `${mainParcel.pickup_postal_address.address_line_1}, ${mainParcel.pickup_postal_address.city.city_name}, ${mainParcel.pickup_postal_address.city.state_iso_code_name} - ${mainParcel.pickup_postal_address.pin}`
    } : null,

    delivery: mainParcel ? {
      city: mainParcel.unload_postal_address.city.city_name,
      state: mainParcel.unload_postal_address.city.state_iso_code_name,
      address: mainParcel.unload_postal_address.address_line_1,
      pin: mainParcel.unload_postal_address.pin,
      fullAddress: `${mainParcel.unload_postal_address.address_line_1}, ${mainParcel.unload_postal_address.city.city_name}, ${mainParcel.unload_postal_address.city.state_iso_code_name} - ${mainParcel.unload_postal_address.pin}`
    } : null,

    // Financial information with detailed breakdown
    freightCharges: trip.total_freight_charge,
    totalCost: purchaseOrder?.total_cost || 0,
    pendingAmount: purchaseOrder?.balances.to_be_paid_amount || 0,
    actualPayableAmount: purchaseOrder?.balances.actual_to_be_paid_amount || 0,
    alreadyPaidAmount: purchaseOrder?.balances.already_paid_amount || 0,
    extraCharges: {
      brokerage: extraCharges?.brokerage_charge || 0,
      diesel: extraCharges?.diesel_charges || 0,
      extraDistance: extraCharges?.extra_distance_charges || 0,
      extraWeight: extraCharges?.extra_weight_charges || 0,
      halting: extraCharges?.halting_amount || 0,
      hamali: extraCharges?.hamali_amount || 0,
      other: extraCharges?.other_charges || 0
    },
    purchaseOrderNumber: purchaseOrder?.purchase_order_number,

    // Vehicle and crew information
    vehicleNumber: trip.booked_vehicle?.rc_number || 'Not assigned',
    crew: trip.crew?.map(member => ({
      name: member.name,
      position: member.position,
      workerId: member.worker
    })) || [],
    driverName: trip.crew?.find(c => c.position === 'Driver')?.name || 'Not assigned',

    // Company and handler information
    handler: trip.handled_by?.name || 'Not assigned',
    handlerId: trip.handled_by?._id || '',
    vehicleProvider: purchaseOrder?.vehicle_provider?.name || 'Not assigned',
    vehicleProviderGST: purchaseOrder?.vehicle_provider?.identities?.find(id => id.id_name === 'GST')?.number,

    // Sender and receiver information
    sender: mainParcel ? {
      name: mainParcel.sender?.name || 'Unknown',
      gstin: mainParcel.sender?.gstin || 'Not provided',
      company: mainParcel.sender?.sender_company?.name || 'Unknown'
    } : null,

    receiver: mainParcel ? {
      name: mainParcel.receiver?.name || 'Unknown',
      gstin: mainParcel.receiver?.gstin || 'Not provided',
      company: mainParcel.receiver?.receiver_company?.name || 'Unknown'
    } : null,

    // Material and shipment information
    materialType: mainParcel?.material_type?.name || 'Unknown',
    quantity: mainParcel?.quantity || 0,
    quantityUnit: mainParcel?.quantity_unit || 'KILOGRAMS',
    quantityInTons: trip.quantity_in_tons || 0,
    partLoad: mainParcel?.part_load || false,
    okToShareVehicle: mainParcel?.ok_to_share_vehicle || false,

    // Document information
    documents: {
      biltyNumber: trip.biltys?.[0]?.bilty_number || '-',
      biltyDownloadable: trip.is_bilty_downloadable,
      eWayBill: mainParcel?.documents?.eway_bill?.number,
      consignorInvoice: mainParcel?.documents?.consignor_invoice?.number
    },

    // Status and payment information
    advancePaid: trip.payment_status_flags?.vehicle?.advance_done || false,
    clearanceDone: trip.payment_status_flags?.vehicle?.clearance_done || false,
    advanceAmount: trip.advance_amount,
    podAmount: trip.pod_amount,
    travelMode: trip.travel_mode,

    // Trip stages and progress
    tripStages: trip.trip_stages?.map(stage => ({
      stage: stage.trip_stage,
      startTime: stage.start_datetime ? new Date(stage.start_datetime) : null,
      isCompleted: !!stage.start_datetime
    })) || [],

    // Current stage progress
    currentStageIndex: trip.trip_stages?.findIndex(stage => stage.trip_stage === trip.trip_stage) || 0,
    totalStages: trip.trip_stages?.length || 0,

    // Additional trip information
    source: trip.source || 'Unknown',
    locked: trip.trip_config?.locked || false,
    doNotDisturb: trip.do_not_disturb || false,
    modeOfCommunication: trip.mode_of_communication || [],
    thirdPartyExpenses: trip.third_party_expenses || null,

    // Verification status
    verificationStatus: mainParcel?.verification || 'Pending',

    // Use company name as trip name and trip_id as identifier
    name: mainParcel?.sender?.sender_company?.name || 'Unknown Company',
    tripId: trip._id,

    // Original data for detailed view
    rawData: trip
  };
};