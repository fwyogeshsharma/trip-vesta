# Local Database Integration for Wallet Management

## Overview

A comprehensive local IndexedDB database system has been implemented parallel to the existing wallet functionality. This browser-compatible system maintains account transactions and syncs with the application's existing API without affecting current operations.

## Architecture

### Core Components

1. **IndexedDB Service** (`src/services/indexedDBService.ts`)
   - Browser-compatible IndexedDB database management
   - Object store definitions
   - CRUD operations for accounts, transactions, and wallet state

2. **Wallet Sync Service** (`src/services/walletSyncService.ts`)
   - Syncs data between API and local database
   - Handles wallet transactions recording
   - Background synchronization management

3. **Background Sync Service** (`src/services/backgroundSyncService.ts`)
   - Automated periodic syncing (every 15 minutes by default)
   - Manual sync triggering
   - Retry logic and error handling

4. **React Hooks** (`src/hooks/useBackgroundSync.ts`)
   - Integration with React components
   - Sync status management
   - Manual sync controls

5. **Database Viewer** (`src/components/DatabaseViewer.tsx`)
   - UI for viewing local database contents
   - Transaction history display
   - Account management visualization

## Database Schema

### IndexedDB Object Stores

#### 1. `bank_accounts`
```typescript
interface BankAccount {
  id?: number;                    // Auto-incremented key
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_type: string;
  is_verified: boolean;
  is_active: boolean;
  api_id?: string;               // Reference to API record
  created_date: string;
  updated_date?: string;
}
// Indexes: api_id, user_id
```

#### 2. `wallet_transactions`
```typescript
interface WalletTransaction {
  id?: number;                   // Auto-incremented key
  user_id: string;
  transaction_type: 'ADD_FUNDS' | 'WITHDRAW' | 'INVESTMENT' | 'PROFIT';
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  bank_account_id?: number;      // Reference to bank_accounts
  api_transaction_id?: string;   // Reference to API transaction
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  created_date: string;
  updated_date?: string;
}
// Indexes: user_id, transaction_type, created_date, status
```

#### 3. `local_wallet_state`
```typescript
interface LocalWalletState {
  id?: number;                   // Auto-incremented key
  user_id: string;               // Unique index
  balance: number;
  total_invested: number;
  total_withdrawn: number;
  profit_earned: number;
  last_sync_date: string;
  updated_date?: string;
}
// Indexes: user_id (unique)
```

## Features

### 1. Automatic Bank Account Syncing
- When users add bank accounts via the API, they're automatically synced to the local database
- Existing accounts are updated with new information
- All account data is maintained locally for offline access

### 2. Transaction Recording
- All wallet operations (add funds, withdraw, investments) are recorded locally
- Transaction history includes:
  - Amount and type
  - Before/after balances
  - Status tracking
  - Associated bank account
  - API transaction references

### 3. Background Synchronization
- Runs every 15 minutes (configurable)
- Syncs bank accounts from API
- Maintains up-to-date local records
- Includes retry logic for failed syncs

### 4. Manual Sync Controls
- Sync button in the wallet interface
- Real-time sync status indicators
- Manual trigger for immediate synchronization

### 5. Database Viewer
- Comprehensive view of local database contents
- Transaction history with filtering
- Account management interface
- Database statistics and monitoring

## Integration Points

### Wallet Context Enhanced
The existing `WalletContext` has been enhanced with:
- `syncToDatabase()` method for manual syncing
- Automatic sync on wallet operations
- Local database integration without breaking existing functionality

### Wallet Page Updates
- Added sync status indicators
- Manual sync button with loading states
- New "Local Database" tab for viewing stored data
- Enhanced transaction recording for all operations

## Usage

### Starting the Application
The local database is automatically initialized when the application starts. No additional setup is required.

### Viewing Local Data
1. Navigate to the Wallet page
2. Click on the "Local Database" tab
3. View transactions, bank accounts, and wallet state

### Manual Sync
1. Click the "Sync" button in the wallet header
2. Wait for sync completion (indicated by loading state)
3. Check sync status indicator for confirmation

### Configuration
Background sync can be configured by modifying:
```typescript
backgroundSyncService.start(userId, {
  syncIntervalMinutes: 15,    // Sync every 15 minutes
  maxRetries: 3,             // Retry failed syncs 3 times
  retryDelayMs: 5000        // Wait 5 seconds between retries
});
```

## Database Location
IndexedDB databases are stored in the browser's local storage. Database name: `WalletTransactionsDB`

## Technical Details

### Browser Compatibility
- **IndexedDB**: Supported in all modern browsers
- **No Dependencies**: Uses native browser APIs only
- **Offline Capable**: Full functionality without internet connection

### Performance Optimizations
- Indexed columns for faster queries
- Batch operations for bulk data sync
- Connection pooling and proper cleanup

### Error Handling
- Comprehensive try-catch blocks
- Graceful degradation if database operations fail
- Detailed logging for debugging

### Security
- Local database access only
- No sensitive data exposure
- Proper transaction isolation

## Future Enhancements

1. **Data Encryption**: Implement local database encryption for sensitive financial data
2. **Offline Mode**: Enhanced offline capabilities with conflict resolution
3. **Data Export**: Export transaction history to various formats
4. **Analytics**: Local analytics and reporting on transaction patterns
5. **Backup/Restore**: Database backup and restore functionality

## Troubleshooting

### Common Issues

1. **IndexedDB Not Available**
   - Check if browser supports IndexedDB (all modern browsers do)
   - Ensure JavaScript is enabled
   - Check if running in private/incognito mode (may have limitations)

2. **Sync Failures**
   - Check network connectivity
   - Verify authentication tokens
   - Review browser console logs for specific errors

3. **Missing Data**
   - Trigger manual sync
   - Check API connectivity
   - Verify user authentication
   - Clear browser data and re-sync if needed

### Logging
All database operations are logged to the console. Enable verbose logging by setting:
```javascript
console.log('Database operations:', { level: 'verbose' });
```

## Conclusion

This local database implementation provides a robust, scalable foundation for wallet transaction management. It operates independently of the existing API while providing seamless synchronization and enhanced offline capabilities.

The system is designed to be:
- **Non-intrusive**: Doesn't affect existing functionality
- **Reliable**: Includes comprehensive error handling and retry logic
- **Scalable**: Built with future enhancements in mind
- **User-friendly**: Provides clear feedback and control options

The implementation serves as a solid foundation for advanced wallet features while maintaining full compatibility with the existing codebase.