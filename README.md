# Tourminded - Connect with Expert Local Guides

Tourminded is a high-performance, multilingual (Arabic and English) Next.js web application that connects travelers directly with expert local guides in the Holy Land. This platform allows guides to manage their profiles and tours via a dedicated dashboard, while users can browse, filter, and book tours based on their preferences.

## Features

- **Multilingual Support**: Full support for English and Arabic languages
- **User Authentication**: Secure login and registration system
- **Tour Search & Filtering**: Advanced search with multiple filters (dates, travelers, languages, expertise, locations)
- **Guide Profiles**: Detailed guide profiles with ratings, reviews, and expertise areas
- **Location Exploration**: Browse tours by location with detailed information
- **Personalized Quiz**: Get tour recommendations based on your preferences
- **Responsive Design**: Mobile-first approach for all screen sizes
- **Admin Dashboard**: Comprehensive management tools for administrators
- **Guide Dashboard**: Tools for guides to manage their profiles and tours

## Tech Stack

- **Frontend**: Next.js (App Router), React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, NextAuth.js
- **Image Storage**: Cloudinary
- **Internationalization**: next-intl
- **Form Handling**: React Hook Form
- **Icons**: React Icons
- **UI Components**: Custom components built with TailwindCSS

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- MongoDB database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tourminded.git
   cd tourminded
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with the following variables (see `.env.local.example` for reference):
   ```
   # MongoDB
   MONGODB_URI=your_mongodb_connection_string

   # JWT
   JWT_SECRET=your_jwt_secret_key

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `/app`: Next.js app router pages and API routes
- `/components`: Reusable React components
- `/lib`: Utility functions and helpers
- `/models`: MongoDB schema models
- `/public`: Static assets
- `/messages`: Internationalization message files

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Next.js team for the amazing framework
- TailwindCSS for the utility-first CSS framework
- MongoDB for the flexible document database
- All contributors who have helped shape this project
#   t o u r m i n d e d  
 