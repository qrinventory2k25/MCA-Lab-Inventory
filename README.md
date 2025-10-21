# College QR Inventory System

A modern QR code-based inventory management system for college computer labs with beautiful gradient blue→indigo→purple theming.

## Features

- 🎯 **Auto QR Generation**: Automatically generate unique QR codes for each system
- 🏢 **Multi-Lab Support**: Manage systems across MCA, BCA, UIT, PIT, UCS, PCS, and PDS labs
- 📊 **Sequential ID System**: Auto-generated sequential IDs per lab (e.g., MCA-001, MCA-002)
- 💾 **Cloud Storage**: QR codes stored securely in Supabase Storage
- 📥 **Bulk Operations**: Bulk delete, CSV export, and ZIP download of QR codes
- 🎨 **Beautiful UI**: Gradient design system with smooth transitions
- 📱 **Responsive**: Works perfectly on mobile, tablet, and desktop

## Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express.js
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **QR Generation**: qrcode library

## Setup Instructions

### 1. Supabase Configuration

First, set up your Supabase database by running the SQL in `supabase-setup.sql`:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-setup.sql`
4. Run the query to create the table and storage bucket

### 2. Environment Variables

The following environment variables are already configured in Replit Secrets:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Public anon key for client-side operations
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for server-side operations
- `SESSION_SECRET`: Session secret for Express

### 3. Install Dependencies

Dependencies are automatically installed via Replit's packager system.

### 4. Run the Application

The application runs automatically on Replit. The workflow executes:

```bash
npm run dev
```

This starts both the Express backend (port 5000) and Vite frontend.

### 5. Access the Application

Once running, navigate to your Replit URL to access the application.

## Usage Guide

### Adding Systems

1. Navigate to **Add System** page
2. Select a lab from the dropdown (MCA, BCA, UIT, PIT, UCS, PCS, PDS)
3. Enter the number of systems to add (1-100)
4. Optionally customize the system configuration
5. Click **Add System(s)**
6. QR codes will be automatically generated and uploaded

### Viewing Systems

1. Navigate to **View All** page
2. Use the search bar to find systems by ID or lab name
3. Filter by specific lab using the dropdown
4. View QR code thumbnails in the table
5. Click on individual actions (Edit, Download, Delete)

### Managing Systems

- **Edit**: Click the edit icon to modify lab or configuration
- **Delete**: Click the delete icon to remove a single system
- **Bulk Delete**: Select multiple systems and use the bulk delete button
- **Download QR**: Click download to get individual QR codes
- **Export CSV**: Export all system data to CSV format
- **Bulk QR Download**: Download all QR codes for a specific lab as ZIP

### System Details

Click on any system ID to view:
- Complete system information
- Full-size QR code
- System URL for direct access
- Creation timestamp

## API Endpoints

### Systems

- `GET /api/systems` - Get all systems
- `GET /api/systems/:id` - Get system by ID
- `POST /api/systems` - Create system(s)
- `PUT /api/systems/:id` - Update system
- `DELETE /api/systems/:id` - Delete system
- `POST /api/systems/bulk-delete` - Bulk delete systems

### Export

- `GET /api/systems/export/csv` - Export all systems to CSV
- `GET /api/systems/export/qr/:labName` - Download QR codes ZIP for a lab

## QR Code Format

Each QR code contains JSON data:

```json
{
  "idCode": "MCA-001",
  "labName": "MCA",
  "description": "System configuration details",
  "systemUrl": "https://your-app.replit.dev/system/uuid"
}
```

## Design System

The application uses a custom gradient design system:

- **Primary Gradient**: Blue (#3B82F6) → Indigo (#6366F1) → Purple (#8B5CF6)
- **Typography**: Inter font family
- **Spacing**: Consistent 4px-based spacing system
- **Components**: shadcn/ui with custom gradient variants
- **Transitions**: Smooth 200-300ms animations

## Project Structure

```
├── client/
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Page components
│       ├── lib/            # Utilities and configurations
│       └── App.tsx         # Main app with routing
├── server/
│   ├── routes.ts           # API routes
│   ├── storage.ts          # In-memory storage interface
│   ├── supabase.ts         # Supabase client
│   └── qr-generator.ts     # QR code generation logic
├── shared/
│   └── schema.ts           # Shared TypeScript types
└── supabase-setup.sql      # Database setup script
```

## Contributing

This is a college project. For improvements or bug fixes, please create an issue or pull request.

## License

MIT License - feel free to use this project for educational purposes.
