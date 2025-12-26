# Blog App - Author Frontend

React + Vite blog app for authors with authentication and CRUD operations for posts.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm, yarn, or pnpm
- Backend API server running (default: http://localhost:3000)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd blog-app-author-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set your API URL:
```
VITE_API_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

## Available Scripts

```bash
npm run dev      # Start development server with HMR
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts and set the `VITE_API_URL` environment variable to your backend API URL

### Option 2: Deploy via Vercel Dashboard

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Go to [vercel.com](https://vercel.com) and click "New Project"
3. Import your repository
4. Add the `VITE_API_URL` environment variable in the project settings
5. Click "Deploy"

### Environment Variables

Required environment variable:
- `VITE_API_URL`: Your backend API base URL (e.g., `https://your-backend-api.vercel.app`)

## Project Structure

- `src/pages/` - Route components
- `src/utils/` - Utility functions (API helpers, auth)
- `src/App.jsx` - Main app with router configuration
- `vercel.json` - Vercel deployment configuration

## Features

- User authentication (signup/login/logout)
- Create, edit, and delete blog posts
- View post details with comments
- Comment and reply system
- Profile management

## API Integration

The app connects to a backend API. See `API_DOCS_AUTHOR.md` for complete API documentation.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
