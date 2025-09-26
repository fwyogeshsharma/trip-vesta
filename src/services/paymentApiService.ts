import { getAuthToken } from './authService';

// API configuration
const API_BASE_URL = 'https://35.244.19.78:8042';

// Interface for payment request
interface PaymentRequest {
  amount: number;
  mode_of_payment: string;
  order_note: string;
  product_or_service?: string;
  paying_user?: string;
  receiving_user?: string;
  paying_company?: string;
  delivery_address?: string;
  gps_device?: string;
  state_id?: string;
  discount_offered?: number;
}

// Interface for payment response
interface PaymentResponse {
  success: boolean;
  data?: {
    payment_link?: string;
    payment_id?: string;
    order_id?: string;
    id?: string;
    [key: string]: unknown;
  };
  message?: string;
  error?: string;
}

class PaymentApiService {
  private static instance: PaymentApiService;

  private constructor() {}

  static getInstance(): PaymentApiService {
    if (!PaymentApiService.instance) {
      PaymentApiService.instance = new PaymentApiService();
    }
    return PaymentApiService.instance;
  }

  /**
   * Create payment request using your existing API
   */
  async createPaymentRequest(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Add return URL configuration for Cashfree redirect
      const currentOrigin = window.location.origin;
      const returnUrl = `${currentOrigin}/wallet?payment=success`;

      console.log('Creating payment request with return URL:', {
        paymentData,
        returnUrl
      });

      // Note: Your backend payment_request API should configure Cashfree with this return URL:
      // return_url: `${currentOrigin}/wallet?payment=success&order_id={order_id}&amount={amount}&status={status}&transaction_id={transaction_id}`

      const response = await fetch(`${API_BASE_URL}/payment_request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Return-URL': returnUrl
        },
        body: JSON.stringify({
          ...paymentData,
          return_url: returnUrl
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Payment API error (${response.status}):`, errorText);
        throw new Error(`Payment API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Payment request result:', result);

      // Check if the response indicates success
      if (!result || (result.success === false)) {
        throw new Error(result?.message || 'Payment request failed');
      }

      // Extract payment link from various possible response structures
      const responseData = result.data || result;
      const paymentLink = responseData.payment_link ||
                         responseData.paymentLink ||
                         responseData.payment_url ||
                         result.payment_link ||
                         result.paymentLink ||
                         result.payment_url;

      if (!paymentLink) {
        console.warn('No payment link found in response:', result);
        return {
          success: false,
          error: 'No payment link received from payment gateway',
          message: 'Payment link not available'
        };
      }

      console.log('Payment link found:', paymentLink);

      return {
        success: true,
        data: {
          ...responseData,
          payment_link: paymentLink,
          payment_id: responseData.payment_id || responseData.id,
          order_id: responseData.order_id || responseData.orderId
        },
        message: result.message || 'Payment request created successfully'
      };

    } catch (error) {
      console.error('Payment request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment request failed',
        message: 'Failed to create payment request'
      };
    }
  }

  /**
   * Create wallet top-up payment request with simple API call
   */
  async createWalletTopUpRequest(
    amount: number,
    userId: string,
    userDetails?: {
      name?: string;
      email?: string;
      phone?: string;
    }
  ): Promise<PaymentResponse> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const payload = {
        amount: amount,
        mode_of_payment: "Online",
        order_note: "Lender Investment",
        product_or_service: "68d3f6fb262b4bc5964b6a68",
        paying_user: userId,
        receiving_user: userId
      };

      console.log('Creating wallet top-up request with payload:', payload);

      const response = await fetch(`${API_BASE_URL}/payment_request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Payment API error (${response.status}):`, errorText);
        throw new Error(`Payment API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Payment request result:', result);

      return {
        success: true,
        data: result,
        message: 'Payment request created successfully'
      };

    } catch (error) {
      console.error('Error creating wallet top-up request:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create wallet top-up request',
        message: 'Wallet top-up request failed'
      };
    }
  }

  /**
   * Handle payment return/callback
   */
  async handlePaymentCallback(paymentData: {
    payment_id?: string;
    order_id?: string;
    status?: string;
    amount?: number;
    [key: string]: unknown;
  }): Promise<{
    success: boolean;
    amount?: number;
    transactionId?: string;
    status?: string;
    message?: string;
  }> {
    try {
      console.log('Handling payment callback:', paymentData);

      // Process the payment callback data
      // Your API might provide specific callback handling

      return {
        success: paymentData.status === 'SUCCESS' || paymentData.status === 'success',
        amount: paymentData.amount,
        transactionId: paymentData.payment_id || paymentData.order_id,
        status: paymentData.status as string,
        message: paymentData.status === 'SUCCESS' ? 'Payment completed successfully' : 'Payment failed'
      };

    } catch (error) {
      console.error('Error handling payment callback:', error);
      return {
        success: false,
        message: 'Failed to process payment callback'
      };
    }
  }

  /**
   * Get payment status from your API (if available)
   */
  async getPaymentStatus(paymentId: string): Promise<{
    success: boolean;
    status?: string;
    amount?: number;
    message?: string;
  }> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // If you have an endpoint to check payment status, use it here
      // This is a placeholder - adjust according to your API
      const response = await fetch(`${API_BASE_URL}/payment_status/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get payment status: ${response.status}`);
      }

      const result = await response.json();

      return {
        success: true,
        status: result.status,
        amount: result.amount,
        message: result.message
      };

    } catch (error) {
      console.error('Error getting payment status:', error);
      return {
        success: false,
        message: 'Failed to get payment status'
      };
    }
  }

  /**
   * Check if service is properly configured
   */
  isConfigured(): boolean {
    // Since we're using your existing API, check if auth token exists
    const token = getAuthToken();
    return !!token;
  }

  /**
   * Get service configuration status
   */
  getConfig() {
    return {
      apiUrl: API_BASE_URL,
      isConfigured: this.isConfigured(),
      hasAuthToken: !!getAuthToken()
    };
  }
}

// Export singleton instance
export const paymentApiService = PaymentApiService.getInstance();
export type { PaymentRequest, PaymentResponse };
export default paymentApiService;