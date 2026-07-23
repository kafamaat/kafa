# Mr. Kafa Signature System

A elegant and highly functional signature tracking system featuring signature records, daily trends, document analytics, backup/restore, and voice integration.

## Features

- **Signature Records** - Track and manage signature entries
- **Daily Trends** - Visualize signature trends over time
- **Document Analytics** - Analyze document processing data
- **Backup & Restore** - Export and import data for safety
- **Voice Integration** - Voice-powered input support
- **PDF Export** - Generate PDF reports with `jsPDF`

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS 4
- **Build:** Vite
- **Charts:** Recharts
- **AI:** Google Gemini API (`@google/genai`)

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set the `GEMINI_API_KEY` in `.env` to your Gemini API key:
   ```bash
   cp .env.example .env
   # Edit .env and add your API key
   ```
3. Run the app:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000`.

## Build

```bash
npm run build
```

The production build will be output to the `dist/` directory.

## Deployment

This project is configured with GitHub Actions for automatic deployment to GitHub Pages. Every push to the `main` branch triggers a build and deploy workflow.

## License

Private project.
