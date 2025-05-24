# IELTS Exam Generator - Frontend

## Overview

This is the frontend application for the IELTS Exam Generator project, built with [Next.js](https://nextjs.org) and [Tailwind CSS](https://tailwindcss.com/). The frontend provides a user-friendly interface for uploading PDFs, configuring exam parameters, and taking the generated reading comprehension exams.

## Features

- **Modern UI**: Clean, responsive interface built with Tailwind CSS
- **Interactive Exam Experience**: Simulates the real IELTS/TOEIC exam environment
- **PDF Upload**: Simple drag-and-drop interface for uploading academic papers
- **Exam Configuration**: Customize exam type, difficulty, and passage preferences
- **Real-time Feedback**: Instant scoring and detailed answer explanations
- **Progress Tracking**: Monitor your performance across multiple exams

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── app/            # Next.js App Router
│   │   ├── create/     # Exam creation page
│   │   ├── exam/[id]/  # Exam taking interface
│   │   └── page.tsx    # Home page
│   ├── components/     # Reusable UI components
│   ├── config/         # Configuration files
│   ├── hooks/          # Custom React hooks
│   ├── styles/         # Global styles
│   └── types/          # TypeScript type definitions
├── tailwind.config.js  # Tailwind CSS configuration
└── next.config.js      # Next.js configuration
```

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm, yarn, or pnpm

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Building for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

Then start the production server:

```bash
npm start
# or
yarn start
# or
pnpm start
```

## API Integration

The frontend communicates with the backend server through RESTful API endpoints defined in `src/config/api.ts`. Make sure the backend server is running before using the application.

## Technologies Used

- **Next.js**: React framework for server-rendered applications
- **React**: JavaScript library for building user interfaces
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Typed superset of JavaScript
- **Axios**: Promise-based HTTP client
- **React Markdown**: Markdown renderer for React
- **GSAP**: Animation library for interactive elements

## Browser Support

The application is optimized for modern browsers including:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
