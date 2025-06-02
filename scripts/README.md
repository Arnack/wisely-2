# Data Generation Scripts

This directory contains scripts to generate sample data for your ConsultPro platform.

## 🚀 Quick Start

### 1. Set up Environment Variables

First, make sure you have the required environment variables in your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Important:** You'll need to add the `SUPABASE_SERVICE_ROLE_KEY` to your `.env.local` file. This key can be found in your Supabase dashboard under Settings > API > Service Role Key.

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 3. Run the Data Generation Script

```bash
npm run generate-data
```

## 📊 What Gets Generated

The script will create:

### Regular Users (50)
- Diverse names and email addresses
- Random avatar URLs using DiceBear API
- All set as `role: "user"`

### Expert Users (30)
- Expert-specific email addresses (prefixed with "expert.")
- Unique avatar URLs
- All set as `role: "expert"`
- Each expert gets a detailed profile including:

### Expert Profiles
- **Titles:** 20 different professional titles (Software Engineer, Product Manager, UX Designer, etc.)
- **Descriptions:** Detailed professional descriptions for each expertise area
- **Expertise Areas:** Relevant skill tags for each profession
- **Hourly Rates:** Random rates between $50-$300/hour
- **Subscription Types:** Mix of "free" and "premium" accounts (70% premium)
- **Availability:** 90% of experts are available for bookings
- **Ratings:** Realistic ratings between 3.5-5.0 stars
- **Review Counts:** Random review counts between 5-150

### Availability Slots
- **Time Range:** 30 days of future availability
- **Schedule:** Business hours (9 AM - 6 PM) with some weekend availability
- **Slot Duration:** 1-hour time slots
- **Booking Status:** 20% of slots are pre-booked to simulate realistic usage

## 📋 Expert Categories

The generated experts cover diverse professional areas:

- **Technology:** Software Engineers, Data Scientists, DevOps Engineers, AI Researchers
- **Business:** Product Managers, Business Consultants, Sales Directors, Operations Managers  
- **Creative:** UX Designers, Content Strategists, Brand Managers
- **Professional Services:** Legal Advisors, Financial Advisors, HR Consultants
- **Marketing:** Digital Marketing Specialists, Marketing Directors
- **Project Management:** Project Managers, Scrum Masters

## 🎯 Sample Expert Data

Each expert will have realistic data like:

```javascript
{
  title: "Senior Software Engineer",
  description: "Passionate about helping teams build scalable web applications and mentoring junior developers.",
  expertise_areas: ["JavaScript", "React", "Node.js", "TypeScript"],
  hourly_rate: 150,
  subscription_type: "premium",
  rating: 4.7,
  total_reviews: 89
}
```

## 🔧 Customization

You can easily customize the generated data by modifying the arrays in `generate-sample-data.js`:

- `expertTitles`: Add or modify professional titles
- `expertiseAreas`: Update skill categories and tags
- `descriptions`: Change professional descriptions
- `firstNames` / `lastNames`: Modify the name pools
- Generation counts: Change the number of users/experts created

## ⚠️ Important Notes

1. **Database Permissions:** The script uses the Supabase service role key, which has admin privileges. Keep this key secure and never commit it to version control.

2. **Data Cleanup:** If you need to remove generated data, you can delete records from the Supabase dashboard or create a cleanup script.

3. **Realistic Emails:** All generated emails use `@example.com` domain to avoid conflicts with real email addresses.

4. **Avatar URLs:** The script uses DiceBear API to generate consistent, unique avatars for each user.

## 🚨 Troubleshooting

### Common Issues:

1. **"Error inserting users" / Database errors:**
   - Check your Supabase connection
   - Verify your service role key is correct
   - Ensure your database tables exist and have the correct schema

2. **"SUPABASE_SERVICE_ROLE_KEY is not defined":**
   - Add the service role key to your `.env.local` file
   - Make sure the file is in your project root

3. **Network/Connection errors:**
   - Check your internet connection
   - Verify your Supabase URL is correct
   - Ensure Supabase is accessible from your network

### Getting Help:

If you encounter issues:
1. Check the console output for specific error messages
2. Verify your Supabase dashboard for any issues
3. Ensure all environment variables are properly set
4. Try running the script again (it will skip existing emails)

## 🎉 Next Steps

After running the script successfully:

1. **Browse Experts:** Visit `/experts` to see all generated expert profiles
2. **Test Booking:** Try booking consultations with different experts
3. **Check Dashboard:** Log in as different user types to test the experience
4. **Customize Further:** Modify the script to generate additional data like appointments or messages

Happy coding! 🚀 