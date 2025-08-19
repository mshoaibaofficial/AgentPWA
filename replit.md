# Overview

Care Manager Co-pilot is a healthcare management application that serves as an AI assistant for healthcare professionals. The application provides a chat-based interface for managing patient care, accessing requirements, and streamlining healthcare tasks. Built as a Progressive Web App (PWA), it features user authentication, conversation management, and real-time messaging capabilities designed specifically for healthcare workflows.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built using React with TypeScript and follows a modern component-based architecture:

- **UI Framework**: React 18 with TypeScript for type safety and developer experience
- **Styling**: Tailwind CSS with a comprehensive design system including custom healthcare-themed color variables
- **Component Library**: Radix UI primitives with shadcn/ui components for consistent, accessible UI patterns
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (TanStack Query) for server state management with custom query client configuration
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **PWA Features**: Service worker implementation for offline capabilities and app-like experience

## Backend Architecture
The backend uses a Node.js/Express.js RESTful API architecture:

- **Runtime**: Node.js with TypeScript and ES modules
- **Framework**: Express.js with custom middleware for logging and error handling
- **Database ORM**: Drizzle ORM configured for PostgreSQL with type-safe database operations
- **Authentication**: Simple email/password authentication with in-memory storage (development mode)
- **API Design**: RESTful endpoints following conventional patterns for auth, conversations, and messages

## Data Storage Solutions
The application uses a relational database approach:

- **Database**: PostgreSQL (configured via Drizzle) with Neon Database serverless driver
- **Schema**: Well-defined tables for users, conversations, and messages with proper foreign key relationships
- **Development Storage**: In-memory storage implementation for development/testing purposes
- **Migrations**: Drizzle Kit for database schema management and migrations

## Authentication and Authorization
Basic authentication system with plans for production enhancement:

- **Current Implementation**: Email/password authentication with localStorage persistence
- **Password Security**: Bcrypt-style hashing (mock implementation in development)
- **Session Management**: Client-side token storage with user context provider
- **Authorization**: Simple user-based access control for conversations and messages

## Development and Build System
Modern development toolchain optimized for full-stack TypeScript:

- **Build Tool**: Vite for fast development and optimized production builds
- **Development**: Hot module replacement with error overlay for enhanced developer experience
- **Production Build**: ESBuild for server bundling and Vite for client bundling
- **Type Checking**: Comprehensive TypeScript configuration with path mapping for clean imports
- **Code Quality**: ESLint and proper module resolution for consistent code standards

# External Dependencies

## Database and Storage
- **Neon Database**: Serverless PostgreSQL database service via `@neondatabase/serverless`
- **Drizzle ORM**: Type-safe database toolkit for PostgreSQL operations and schema management

## UI and Styling
- **Radix UI**: Comprehensive primitive component library for accessible UI components
- **Tailwind CSS**: Utility-first CSS framework with PostCSS for processing
- **Lucide React**: Icon library for consistent iconography throughout the application

## Development and Tooling
- **React Query**: Server state management and caching library from TanStack
- **React Hook Form**: Form handling with Zod schema validation
- **Wouter**: Lightweight routing library for React applications
- **Date-fns**: Date manipulation and formatting utilities

## Infrastructure
- **Express.js**: Web application framework for Node.js API development
- **Vite**: Next-generation frontend build tool with TypeScript support
- **PWA Support**: Service worker and manifest configuration for progressive web app features

## Healthcare-Specific Features
The application includes specialized features for healthcare management including patient care workflows, requirement tracking, and care team collaboration tools through the chat interface.