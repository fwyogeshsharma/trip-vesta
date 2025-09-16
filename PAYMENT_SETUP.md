# Payment Gateway Setup Guide

This guide explains how to set up the Razorpay payment gateway for production use.

## 🚀 Production Setup

### 1. Razorpay Account Setup

1. **Create Razorpay Account**
   - Go to [https://dashboard.razorpay.com/](https://dashboard.razorpay.com/)
   - Sign up and complete KYC verification
   - Get your live API keys from the dashboard

2. **Get API Keys**
   - **Key ID**: `rzp_live_xxxxxxxxxx` (for production)
   - **Key Secret**: `xxxxxxxxxx` (keep this secret!)

### 2. Environment Configuration

1. **Copy Environment File**
   ```bash
   cp .env.example .env
   ```

2. **Update Environment Variables**
   ```env
   VITE_RAZORPAY_KEY_ID=rzp_live_your_key_id_here
   RAZORPAY_KEY_SECRET=your_secret_key_here
   VITE_API_URL=https://your-api-domain.com/api
   NODE_ENV=production
   ```

### 3. Backend Implementation Required

The current implementation uses simulated backend calls. For production, you MUST implement:

#### Create Order Endpoint
```javascript
// POST /api/payments/create-order
app.post('/api/payments/create-order', async (req, res) => {
  const { amount, currency } = req.body;

  const options = {
    amount: amount * 100, // amount in paisa
    currency: currency,
    receipt: `receipt_${Date.now()}`
  };

  const order = await razorpay.orders.create(options);
  res.json(order);
});
```

#### Verify Payment Endpoint (CRITICAL)
```javascript
// POST /api/payments/verify
app.post('/api/payments/verify', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  const isSignatureValid = expectedSignature === razorpay_signature;

  if (isSignatureValid) {
    // Save to database and update wallet balance
    res.json({ success: true, message: 'Payment verified' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid signature' });
  }
});
```

### 4. Security Considerations

#### Frontend Security
- ✅ Never store Razorpay Key Secret in frontend
- ✅ Only use Key ID in frontend
- ✅ Validate amounts on both frontend and backend
- ✅ Implement rate limiting for payment attempts

#### Backend Security
- ✅ Always verify payment signatures on backend
- ✅ Use HTTPS for all API calls
- ✅ Implement proper authentication
- ✅ Log all transactions for audit
- ✅ Validate webhook signatures from Razorpay

### 5. Database Schema

Create tables for transaction tracking:

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  payment_id VARCHAR(255) UNIQUE NOT NULL,
  order_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  status VARCHAR(20) NOT NULL,
  type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wallet_balances (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL,
  balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. Testing

#### Test Mode
- Use test API keys: `rzp_test_xxxxxxxxxx`
- Test cards provided by Razorpay
- No real money transactions

#### Production Testing
- Test with small amounts first
- Verify webhook integration
- Test payment failures
- Test refund process

### 7. Webhooks (Recommended)

Set up webhooks for payment status updates:

```javascript
app.post('/api/webhooks/razorpay', (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  const isSignatureValid = validateWebhookSignature(req.body, signature, secret);

  if (isSignatureValid) {
    // Process webhook event
    const event = req.body.event;
    const payment = req.body.payload.payment.entity;

    // Update transaction status in database
  }

  res.status(200).send('OK');
});
```

### 8. Error Handling

Implement comprehensive error handling for:
- Network failures
- Payment gateway errors
- Invalid signatures
- Duplicate transactions
- Failed verifications

### 9. Monitoring & Analytics

- Track payment success rates
- Monitor failed payments
- Set up alerts for payment issues
- Generate financial reports

### 10. Compliance

- PCI DSS compliance
- Data protection regulations
- Financial regulations in your region
- Tax reporting requirements

## 🔧 Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| API Keys | Test keys | Live keys |
| Verification | Simulated | Real backend |
| HTTPS | Optional | Required |
| Webhooks | Optional | Required |
| Logging | Console | Database + Files |
| Error Handling | Basic | Comprehensive |

## 📞 Support

- **Razorpay Docs**: [https://razorpay.com/docs/](https://razorpay.com/docs/)
- **Integration Guide**: [https://razorpay.com/docs/payments/payment-gateway/web-integration/](https://razorpay.com/docs/payments/payment-gateway/web-integration/)
- **Test Cards**: [https://razorpay.com/docs/payments/payments/test-card-details/](https://razorpay.com/docs/payments/payments/test-card-details/)

## ⚠️ Important Notes

1. **Never commit API secrets** to version control
2. **Always verify payments** on backend before updating balances
3. **Implement proper logging** for all payment activities
4. **Set up monitoring** for payment failures
5. **Test thoroughly** before going live
6. **Have a rollback plan** ready