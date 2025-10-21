# College QR Inventory System

## Project Overview
A modern, full-stack QR code-based inventory management system designed for college computer labs. Features a beautiful gradient blue→indigo→purple design theme and comprehensive CRUD operations with Supabase integration.

## Architecture

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: Wouter (lightweight React router)
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack Query (React Query v5)
- **Forms**: React Hook Form + Zod validation
- **Notifications**: react-hot-toast with custom gradient styling

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage (QR code images)
- **QR Generation**: qrcode library
- **File Operations**: JSZip for bulk downloads

### Design System
- **Theme**: Gradient (Blue #3B82F6 → Indigo #6366F1 → Purple #8B5CF6)
- **Typography**: Inter font family
- **No Black Colors**: Uses deep purples/indigos instead
- **Components**: shadcn/ui with custom gradient variants
- **Spacing**: Consistent 4px-based system
- **Animations**: Smooth 200-300ms transitions

## Key Features

### 1. Multi-Lab Support
- Supports 7 labs: MCA, BCA, UIT, PIT, UCS, PCS, PDS
- Each lab has independent sequential ID system (e.g., MCA-001, MCA-002)

### 2. Auto QR Code Generation
- Automatic QR code generation for each system
- QR codes uploaded to Supabase Storage
- Contains system ID, lab name, configuration, and direct URL
- Auto-regeneration on system updates

### 3. Bulk Operations
- Bulk delete with confirmation dialogs
- Bulk QR code download by lab (ZIP format)
- CSV export of all system data
- Multi-select with checkboxes

### 4. Search & Filter
- Real-time search by system ID or lab name
- Filter by specific lab
- Responsive table with alternating row colors

### 5. Complete CRUD
- Create single or multiple systems at once
- View all systems with pagination-ready table
- Edit system details (regenerates QR)
- Delete with QR cleanup from storage

## Pages Structure

### Home (`/`)
- Gradient hero section with call-to-action
- Feature cards highlighting key capabilities
- Responsive layout with smooth animations

### Add System (`/add-system`)
- Lab selection dropdown
- Number of systems input (1-100)
- Default configuration with customization
- Form validation with Zod
- Toast notifications on success/error

### View All (`/view-all`)
- Searchable, filterable system table
- Bulk selection and actions
- Individual row actions (Edit, Download, Delete)
- CSV export button
- Empty state with helpful message

### Edit System (`/edit-system/:id`)
- Pre-filled form with existing data
- Lab and description editing
- QR code regeneration on save
- Back navigation to view all

### System Details (`/system/:id`)
- Complete system information display
- Full-size QR code preview
- Download QR button
- Edit button for quick access

## API Endpoints

### Systems Management
- `GET /api/systems` - Fetch all systems
- `GET /api/systems/:id` - Fetch single system
- `POST /api/systems` - Create system(s)
- `PUT /api/systems/:id` - Update system
- `DELETE /api/systems/:id` - Delete single system
- `POST /api/systems/bulk-delete` - Delete multiple systems

### Export & Download
- `GET /api/systems/export/csv` - Export to CSV
- `GET /api/systems/export/qr/:labName` - Bulk QR ZIP download

## Database Schema

```sql
CREATE TABLE systems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_code VARCHAR(20) UNIQUE NOT NULL,
    lab_name VARCHAR(10) NOT NULL,
    description TEXT DEFAULT 'INTEL CORE 2 DUO 2.90 GHZ, 4GB RAM, 360GB HDD, LED MONITOR, KB & MOUSE',
    qr_image_url TEXT,
    qr_payload TEXT,
    system_url TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
```

### Storage Bucket
- Bucket ID: `qr-codes`
- Public read access enabled
- Authenticated write/update/delete

## Environment Variables

Required secrets (configured in Replit):
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Public anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Server-side service role key
- `SESSION_SECRET` - Express session secret

## Development Workflow

### Setup
1. Supabase database created via `supabase-setup.sql`
2. Environment secrets configured
3. Dependencies auto-installed via Replit packager

### Running
- Workflow: "Start application"
- Command: `npm run dev`
- Port: 5000 (backend + frontend via Vite)

### File Structure
```
├── client/
│   └── src/
│       ├── components/     # Navigation, UI components
│       ├── pages/          # Route pages
│       ├── lib/            # Utilities (queryClient, toast)
│       └── App.tsx         # Main app with routing
├── server/
│   ├── routes.ts           # All API endpoints
│   ├── storage.ts          # In-memory storage interface
│   ├── supabase.ts         # Supabase client & helpers
│   └── qr-generator.ts     # QR code generation logic
├── shared/
│   └── schema.ts           # Shared TypeScript types
└── supabase-setup.sql      # Database initialization
```

## User Preferences

### Design Preferences
- No black colors anywhere in the UI
- Gradient theme must flow blue → indigo → purple
- High contrast for accessibility
- Smooth 200-300ms transitions on all interactions
- Toast notifications for all CRUD operations

### Technical Preferences
- TypeScript for type safety
- React Query for data fetching
- Form validation with Zod
- Responsive design (mobile-first)
- Empty states with helpful messaging

## Recent Changes

### 2025-01-21
- Initial project setup with complete architecture
- Implemented all frontend pages with gradient design system
- Created backend API with Supabase integration
- Added QR code generation and storage upload
- Implemented bulk operations (delete, ZIP download)
- Added CSV export functionality
- Integrated toast notifications throughout
- Created comprehensive documentation

## Notes
- QR codes are stored in Supabase Storage with public read access
- Sequential IDs are maintained per lab (auto-incremented)
- QR codes are regenerated when systems are updated
- Bulk downloads require systems from a single lab
- CSV export includes all system data with proper escaping
