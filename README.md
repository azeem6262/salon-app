# Salon Booking PWA

A mobile-first Progressive Web App (PWA) designed for small salon and clinic owners to manage daily bookings, customers, and stylists. 

Built with a focus on simplicity, offline support, and speed, without unnecessary platform bloat.

## Features

- **Mobile-First PWA:** Installable via browser "Add to Home Screen", offering a native-app feel and offline capabilities for the current day's data.
- **Onboarding & Auth:** Compulsory Google Sign-in to keep things simple. A seamless first-time user flow for choosing "Clinic" or "Salon" and setting the organization name.
- **Custom Services & Stylists:** Salons and clinics can define their own fully custom services, default prices, and stylists. Prices can be overridden per booking.
- **Day & Week Appointment Views:** Easy navigation between today's tasks and a broader week overview.
- **Analytics Dashboard:** Keep track of total sales, total clients, total bookings, and no-shows with Day/Week/Month and custom date range filters.
- **Customer Management:** Maintain a list of customers, their booking history, and visit stats.

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS (Clean, minimal aesthetic)
- **Backend & Auth:** Supabase (PostgreSQL, Row Level Security, Google OAuth)
- **PWA Layer:** `next-pwa` + Workbox
- **Forms:** React Hook Form + Zod
- **State Management:** React Query (Server State), Zustand/Context (UI State)
- **Dates:** `date-fns`
- **Deployment:** Vercel

## Local Development

*Instructions on how to set up the environment locally will be added here once the foundation sprint is completed.*

## License

This project is licensed under the MIT License.
