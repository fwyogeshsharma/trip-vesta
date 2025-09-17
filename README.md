# Trip Vesta - Investment Platform

A comprehensive trip investment platform that allows users to browse available investment opportunities, make informed investment decisions, and track their portfolio performance through an intuitive and modern interface.

## 🌟 Project Overview

Trip Vesta is a modern web application built for managing trip investments with features including:

- **Investment Marketplace**: Browse and filter available trip investment opportunities
- **Portfolio Management**: Track your investments with real-time progress updates
- **Wallet Integration**: Manage your investment balance and transactions
- **Real-time Data**: Excel-based data integration with live updates
- **Responsive Design**: Optimized for both desktop and mobile devices

## 🚀 Features

### Investment Platform
- **Available Trips**: Discover and invest in various trip opportunities
- **Advanced Filtering**: Filter by status, route, duration, dates, and more
- **Bulk Investment**: Select and invest in multiple trips simultaneously
- **Trip Locking**: Automatic reservation system to prevent double-booking
- **Real-time Progress**: Live tracking of investment progress

### Portfolio Management
- **My Investments**: Track all your active and completed investments
- **Milestone Tracking**: Visual progress indicators for each investment phase
- **Performance Analytics**: Monitor returns and investment outcomes
- **Investment History**: Complete transaction and progress history

### User Experience
- **Intuitive Interface**: Modern, clean design with shadcn-ui components
- **Responsive Layout**: Seamless experience across all devices
- **Real-time Updates**: Live data synchronization and progress tracking
- **Smart Validation**: Input validation and error handling

## 🛠️ Technologies Used

This project is built with modern web technologies:

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **UI Components**: shadcn-ui with Radix UI primitives
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React Query for server state management
- **Routing**: React Router for navigation
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React for consistent iconography

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Getting Started

1. **Clone the repository**
   ```sh
   git clone <repository-url>
   cd trip-vesta
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Start the development server**
   ```sh
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to view the application

### Available Scripts

```sh
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build in development mode
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

## 📁 Project Structure

```
trip-vesta/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React contexts (Wallet, etc.)
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── services/       # Business logic and API services
│   ├── utils/          # Utility functions
│   └── App.tsx         # Main application component
├── public/             # Static assets
└── package.json        # Project dependencies and scripts
```

## 🎯 Key Features in Detail

### Available Trips
- Browse investment opportunities with comprehensive filtering
- Real-time availability checking and trip locking
- Bulk selection and investment capabilities
- Progress tracking and milestone visualization

### My Investments
- Portfolio overview with performance metrics
- Detailed milestone tracking with visual progress indicators
- Investment history and transaction details
- Filter and search your investment portfolio

### Wallet Management
- Real-time balance tracking
- Transaction history
- Secure payment processing integration

## 🔧 Configuration

The application uses various configuration files:

- `tailwind.config.js` - Tailwind CSS configuration
- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - ESLint rules and settings

## 📱 Responsive Design

Trip Vesta is fully responsive and provides an optimal experience across:
- **Desktop**: Full-featured interface with multi-column layouts
- **Tablet**: Adaptive layouts with touch-friendly interactions
- **Mobile**: Optimized single-column layout with mobile-first design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For questions or support, please contact the development team or refer to the project documentation.
