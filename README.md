# Door Measurement PWA

A production-ready Progressive Web App for collecting door measurements on construction sites and generating professional PDF reports.

## Features

- 📱 **Progressive Web App** - Install on mobile devices and work offline
- 🏗️ **Hierarchical Data Model** - Person → Site → Building → Flat → Measurements
- 📏 **Three Door Types** - Bedroom, Bathroom, and Main Entry doors
- 📊 **PDF Reports** - Generate professional measurement reports per building
- 💾 **MongoDB Database** - Persistent data storage with Mongoose
- 🚀 **Next.js 14 App Router** - Modern React framework with server components
- 🎨 **Tailwind CSS** - Professional, utilitarian design for field workers

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** MongoDB Atlas with Mongoose
- **PDF Generation:** pdf-lib
- **Styling:** Tailwind CSS v4
- **Components:** shadcn/ui
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free tier works)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Database Setup

The app uses MongoDB with the following schema:

- **Person** - Client or project owner
- **Site** - Construction site location
- **Building** - Individual building at a site
- **Flat** - Individual unit in a building
- **Measurement** - Door measurements (unique per flat + door type)

## Usage

1. **Select/Add Person** - Choose existing or create new person
2. **Select/Add Site** - Choose site for the person
3. **Select/Add Building** - Choose building at the site
4. **Select/Add Flat** - Choose flat in the building
5. **Enter Measurements** - Input length and breadth for each door type
6. **Download PDF** - Generate report with all measurements for the building

## API Routes

- `GET/POST /api/person` - Manage persons
- `GET/POST /api/site` - Manage sites (filtered by personId)
- `GET/POST /api/building` - Manage buildings (filtered by siteId)
- `GET/POST /api/flat` - Manage flats (filtered by buildingId)
- `GET/POST /api/measurement` - Manage measurements (unique per flatId + doorType)
- `POST /api/report/pdf` - Generate PDF report for a building

## PWA Features

- Installable on mobile devices
- Offline support with service worker caching
- App-like experience with standalone display mode
- Optimized for construction site use

## Deployment

Deploy to Vercel with one click:

1. Push code to GitHub
2. Import project in Vercel
3. Add `MONGODB_URI` environment variable
4. Deploy

## License

MIT
