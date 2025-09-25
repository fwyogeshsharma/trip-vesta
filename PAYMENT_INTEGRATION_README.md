# Payment Integration with Local Database

## Overview

The wallet now integrates with your existing `payment_request` API and maintains all transaction records in the local IndexedDB database. After successful Cashfree payments, users are redirected back to the wallet page with their balance automatically updated.

## Payment Flow

### 1. **Add Funds Process**
1. User enters amount and clicks "Add Funds"
2. Transaction is recorded as PENDING in local database
3. `payment_request` API is called with wallet top-up data
4. User is redirected to Cashfree payment gateway
5. After payment completion, user returns to wallet page
6. Transaction is marked as COMPLETED and balance is updated
7. All data is stored in local IndexedDB database

### 2. **Return URL Configuration**

**IMPORTANT**: Your backend `payment_request` API needs to configure Cashfree with the correct return URL.

#### Required Return URL Format:
```
{your_domain}/wallet?payment=success&order_id={order_id}&amount={amount}&status={status}&transaction_id={transaction_id}
```

#### Example Return URLs:
- Development: `http://localhost:8082/wallet?payment=success&order_id=ORDER123&amount=1000&status=success&transaction_id=TXN456`
- Production: `https://yourdomain.com/wallet?payment=success&order_id=ORDER123&amount=1000&status=success&transaction_id=TXN456`

#### Backend Configuration:
In your `payment_request` API endpoint, when creating the Cashfree order, set:

```javascript
// Example for your backend API
const cashfreeOrderData = {
  // ... other Cashfree parameters
  order_meta: {
    return_url: `${req.headers['x-return-url'] || frontendUrl}/wallet?payment=success&order_id={order_id}&amount={amount}&status={status}&transaction_id={transaction_id}`,
    notify_url: `${backendUrl}/payment/webhook` // Your webhook URL
  }
};
```

### 3. **Frontend Payment Handling**

#### API Call Structure:
```javascript
// The frontend sends this to your payment_request API
const paymentData = {
  amount: 1000,
  mode_of_payment: "Online",
  order_note: "Wallet Top-up - Rolling Radius Services",
  product_or_service: "61422c0a1778a2a004068c63",
  paying_user: userId,
  receiving_user: "6257f1d75b42235a2ae4ab34",
  discount_offered: 0,
  return_url: `${window.location.origin}/wallet?payment=success` // Return URL hint
};
```

#### Headers Sent:
- `Authorization: Bearer {token}`
- `X-Return-URL: {current_origin}/wallet?payment=success` - Frontend origin for return URL

### 4. **Local Database Schema**

#### Transactions Table:
```typescript
interface WalletTransaction {
  id?: number;
  user_id: string;
  transaction_type: 'ADD_FUNDS' | 'WITHDRAW' | 'INVESTMENT' | 'PROFIT';
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  bank_account_id?: number;
  api_transaction_id?: string;  // Cashfree transaction ID
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  created_date: string;
  updated_date?: string;
}
```

#### Bank Accounts Table:
```typescript
interface BankAccount {
  id?: number;
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_type: string;
  is_verified: boolean;
  is_active: boolean;          // Only one account can be active at a time
  api_id?: string;
  created_date: string;
  updated_date?: string;
}
```

### 5. **Features Implemented**

#### Active Account Management:
- ✅ "Set Active" button on each bank account
- ✅ Only one account can be active at a time (enforced in database)
- ✅ Active account is stored in IndexedDB
- ✅ UI updates immediately when account is set as active

#### Transaction Recording:
- ✅ All transactions recorded in local database
- ✅ PENDING status when payment is initiated
- ✅ COMPLETED status when payment returns successfully
- ✅ Full transaction history with timestamps
- ✅ Balance tracking (before/after amounts)

#### Database Viewer:
- ✅ View all transactions in "Local Database" tab
- ✅ See bank accounts and their active status
- ✅ Database statistics and monitoring
- ✅ Test transaction button for debugging

### 6. **Payment Return Handling**

The wallet page handles multiple return URL formats:

#### Supported URL Parameters:
- `payment=success` - Payment status indicator
- `order_id={id}` - Order/payment ID from Cashfree
- `amount={amount}` - Payment amount
- `status=success` - Payment status
- `transaction_id={id}` - Cashfree transaction ID

#### URL Examples That Work:
```
/wallet?payment=success&order_id=ORDER123
/wallet?status=success&transaction_id=TXN456&amount=1000
/wallet?payment=success&order_id=ORDER123&amount=1000&status=success&transaction_id=TXN456
```

### 7. **Testing the Integration**

#### Test Transaction Recording:
1. Go to wallet page
2. Click "Local Database" tab
3. Click "Add Test Transaction" button
4. Check if transaction appears in the list

#### Test Payment Flow:
1. Go to wallet page "Manage Funds" tab
2. Enter amount and click "Add Funds"
3. Should redirect to Cashfree (or show success if no payment link)
4. Return URL should bring user back to wallet
5. Balance should be updated
6. Transaction should appear in "Local Database" tab

### 8. **Debugging**

#### Browser Console Logs:
- Payment request creation
- Return URL processing
- Transaction recording
- Database operations

#### Check Local Database:
- Open browser DevTools
- Go to Application/Storage tab
- Check IndexedDB → WalletTransactionsDB
- View tables: bank_accounts, wallet_transactions, local_wallet_state

### 9. **Backend Requirements**

Your `payment_request` API should:

1. **Accept Return URL**: Use the `X-Return-URL` header or `return_url` in body
2. **Configure Cashfree**: Set the return_url in Cashfree order creation
3. **URL Parameters**: Ensure Cashfree returns with order_id, amount, status, transaction_id
4. **CORS**: Allow requests from your frontend domain

#### Example Backend Modification:
```javascript
// In your payment_request endpoint
app.post('/payment_request', async (req, res) => {
  const returnUrl = req.headers['x-return-url'] || req.body.return_url;

  // When creating Cashfree order
  const cashfreeOrder = {
    // ... existing parameters
    order_meta: {
      return_url: `${returnUrl}&order_id={order_id}&amount={amount}&status={status}&transaction_id={transaction_id}`,
      // ... other meta
    }
  };

  // ... rest of your existing code
});
```

### 10. **Production Deployment**

1. **Update Environment**: Set production URLs in return_url configuration
2. **HTTPS Required**: Cashfree requires HTTPS for return URLs in production
3. **Domain Whitelist**: Add your domain to Cashfree dashboard
4. **Test Thoroughly**: Test complete payment flow in production environment

## Troubleshooting

### Common Issues:
1. **Transactions not showing**: Check browser console for errors, use "Add Test Transaction"
2. **Payment not redirecting back**: Verify return URL configuration in backend
3. **Balance not updating**: Check if payment return is being processed (console logs)
4. **Active account not working**: Check IndexedDB in browser DevTools

### Support:
- Check browser console for detailed logs
- Use "Local Database" tab to verify data storage
- Test with "Add Test Transaction" button
- Verify return URL format matches expected pattern