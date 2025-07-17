# GrowthTracker

A comprehensive savings calculator application built with Next.js and React that allows users to create multiple savings accounts, set financial goals, visualize compound interest growth, and manage their savings portfolio.

## 🎯 Features

### Account Management
- Create and manage multiple savings accounts
- Set account details including name, starting balance, interest rate, and compound frequency
- Track current balance and account performance
- Delete or edit existing accounts

### Goal Setting
- **Target Amount**: Set a specific dollar goal to reach
- **Target Date**: Choose a future date to achieve your savings goal
- **Default Timeline**: Automatic 36-month projection if no goal is specified
- Real-time calculations based on compound interest formulas

### Data Visualization
- Interactive charts powered by Recharts:
  - Growth chart: Track account balance over time
  - Comparison chart: Compare multiple accounts side-by-side
  - Portfolio chart: View distribution of your savings portfolio
- Responsive design that works on desktop and mobile

### Import/Export Functionality
- **Import**: Upload account data from CSV or Excel files
- **Export**: Download account data and projections as Excel files
- **Template**: Download a CSV template to get started quickly

### Settings & Customization
- Currency formatting options
- Customizable display preferences
- Local storage for data persistence

## 🛠 Technical Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for responsive design
- **UI Components**: Headless UI for accessible components
- **Icons**: Heroicons for consistent iconography
- **Charts**: Recharts for interactive data visualization
- **File Processing**: ExcelJS and PapaParse for import/export
- **State Management**: React Context API with custom hooks

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd savings_calc/webapp
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Start the development server:

3. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📱 Usage

### Creating Your First Account
1. Click "Add Account" to create a new savings account
2. Fill in the account details:
   - Account name
   - Starting balance
   - Annual interest rate (%)
   - Compound frequency (daily, monthly, quarterly, yearly)
   - Goal type (target amount, target date, or default)
3. Click "Save Account" to add it to your portfolio

### Setting Goals
- **Target Amount**: Enter the amount you want to save
- **Target Date**: Select when you want to reach your goal
- **Monthly Contributions**: Add optional recurring deposits

### Viewing Charts
- Navigate between different chart views to visualize your savings growth
- Compare multiple accounts to see which performs better
- View your portfolio distribution across all accounts

### Importing Data
1. Click "Import Accounts" 
2. Download the CSV template or use your own file
3. Upload CSV or Excel files with account data
4. Review and confirm the import

### Exporting Data
- Click "Export" to download your account data as an Excel file
- Includes account details, projections, and goal progress

## 🏗 Project Structure

```
webapp/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── layout.tsx         # Root layout component
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── AccountCard.tsx    # Individual account display
│   │   ├── AccountForm.tsx    # Account creation/editing
│   │   ├── AccountList.tsx    # Account list container
│   │   ├── ExportButton.tsx   # Data export functionality
│   │   ├── SettingsModal.tsx  # App settings
│   │   ├── Charts/            # Data visualization components
│   │   └── Import/            # Data import components
│   ├── lib/                   # Utility functions and logic
│   │   ├── calculations.ts    # Compound interest calculations
│   │   ├── types.ts          # TypeScript type definitions
│   │   ├── context/          # React Context providers
│   │   ├── hooks/            # Custom React hooks
│   │   ├── import/           # File parsing and validation
│   │   └── utils/            # Helper functions
│   └── public/               # Static assets
│       └── templates/        # CSV templates for import
└── package.json             # Dependencies and scripts
```

## 🔧 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📊 Calculations

The application uses compound interest formulas:

**Compound Interest**: A = P(1 + r/n)^(nt)
- P = Principal amount (starting balance)
- r = Annual interest rate (as decimal)
- n = Number of times interest compounds per year
- t = Time in years

**With Monthly Contributions**: Future value includes regular deposits compounded over time.

## 🎨 Customization

### Currency
- Configurable currency formatting
- Support for different locales and currencies

### Settings
- Customize display preferences
- Export/import settings

## 📝 Data Storage

- **Local Storage**: All data is stored locally in your browser
- **No Server Required**: Fully client-side application
- **Data Persistence**: Your accounts and settings are saved between sessions
- **Privacy**: Your financial data never leaves your device

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For questions or issues:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information

## 🔗 Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [React Documentation](https://react.dev) - Learn React fundamentals
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS framework
- [Recharts](https://recharts.org/) - React charting library

## 🚀 Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details on deployment options.
