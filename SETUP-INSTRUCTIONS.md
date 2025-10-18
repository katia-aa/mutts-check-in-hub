# Mutts Check-In Hub - Setup Instructions

## Overview
Your Mutts Check-In Hub has been updated with a simplified check-in flow! The new system:
- Collects first name, last name, and email
- Asks if attendees are bringing a dog
- If yes, requires confirmation of 3 vaccinations via checkboxes (DA2PP, Rabies, Bordetella)
- Requires everyone to sign the waiver
- Displays all data in the admin dashboard

## Setup Steps

### 1. Run the Database Migration

**IMPORTANT:** You must run the SQL migration to create the database table in your new Supabase project.

1. Go to your Supabase dashboard: https://plukqfeodxnsypzilsmu.supabase.co
2. Navigate to the **SQL Editor** in the left sidebar
3. Open the file `supabase-migration.sql` in this project directory
4. Copy all the SQL code from that file
5. Paste it into the Supabase SQL Editor
6. Click **Run** to execute the migration

This will create the `attendees` table with all the necessary columns.

### 2. Install Dependencies & Start the Application

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

### 3. Test the Check-In Flow

1. Go to the home page
2. Fill in first name, last name, and email
3. Check "I'm bringing a dog to this event"
4. Confirm all 3 vaccination checkboxes (required)
5. Sign the waiver
6. Complete check-in

### 4. Access the Admin Dashboard

Navigate to: `http://localhost:5173/#/admin-dashboard`

The admin dashboard displays:
- Name and email of all attendees
- Whether they have a dog (Yes/No)
- Vaccination status (DA2PP, Rabies, Bordetella) - only shown if they have a dog
- Waiver signature status

## What Changed

### Database Schema
- **New simplified `attendees` table** with:
  - `first_name`, `last_name`, `email`
  - `has_dog` (boolean)
  - `da2pp_vaccine`, `rabies_vaccine`, `bordetella_vaccine` (booleans)
  - `signature_svg` (waiver signature)

- **Removed `dogs` table** - no longer tracking individual dogs
- **Removed vaccine file uploads** - replaced with checkbox attestations

### Check-In Flow
- **Before:** Form → Waiver → Vaccine Upload → Complete (3 steps)
- **After:** Form → Waiver → Complete (2 steps)

### New Features
- 3 required vaccination checkboxes for dog owners
- Simplified 2-step check-in process
- Cleaner admin dashboard showing vaccination status

## Environment Variables

Your `.env` file has been updated with the new Supabase project credentials:

```
VITE_SUPABASE_PROJECT_ID="plukqfeodxnsypzilsmu"
VITE_SUPABASE_URL="https://plukqfeodxnsypzilsmu.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="[your-key]"
```

## Optional Cleanup

The following files are no longer used but are safe to leave in the codebase:
- `src/pages/UploadVaccine.tsx`
- `src/components/UploadVaccine.tsx`
- `src/components/vaccine/` (entire directory)
- `src/hooks/useVaccineUpload.ts`
- `src/hooks/useMultiFileUpload.ts`
- `src/hooks/useDogManagement.ts`
- `src/components/attendee-table/useDogsFetcher.tsx`
- `src/components/attendee-table/VaccineFileCell.tsx`
- `src/components/attendee-table/DogBadge.tsx`
- `src/types/dog.ts`
- `src/types/vaccineUpload.ts`
- `supabase/functions/upload-vaccine/` (entire directory)

You can delete these files if you want to keep your codebase clean, but they won't affect the application.

## Troubleshooting

### "Error: relation 'attendees' does not exist"
- You need to run the SQL migration (see step 1 above)

### Data not showing in admin dashboard
- Make sure you've completed at least one check-in
- Check the browser console for any errors
- Verify the Supabase credentials in `.env` are correct

### Checkboxes not validating
- All 3 vaccination checkboxes are required if "I'm bringing a dog" is checked
- You must check the dog checkbox first to see the vaccination options

## Need Help?

If you encounter any issues, check:
1. Supabase project is active at https://plukqfeodxnsypzilsmu.supabase.co
2. SQL migration was run successfully
3. `.env` file has the correct credentials
4. Dependencies are installed (`npm install`)

---

**Your check-in system is now ready to use!** 🐕
