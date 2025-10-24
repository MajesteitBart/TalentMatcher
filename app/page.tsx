export default function Home() {
  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-sans">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Talent Matcher Agent</h1>
          <p className="text-lg mb-6">
            AI-powered system for automatically matching rejected candidates to alternative open positions.
          </p>
          
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">System Overview</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Next.js 14 with TypeScript</li>
              <li>Supabase (PostgreSQL + pgvector)</li>
              <li>Gemini AI for CV parsing and analysis</li>
              <li>LangGraph for workflow orchestration</li>
              <li>BullMQ for background job processing</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Set up Supabase database (see migration.sql in docs)</li>
              <li>Configure environment variables (.env.local)</li>
              <li>Start Redis: <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">docker-compose up -d</code></li>
              <li>Run workers: <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">npm run worker:workflow</code></li>
              <li>Start dev server: <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">npm run dev</code></li>
            </ol>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">API Endpoints</h2>
            <ul className="space-y-2">
              <li><strong>POST /api/candidates/reject</strong> - Reject candidate and trigger matching</li>
              <li><strong>GET /api/workflow/status/[id]</strong> - Check workflow status</li>
              <li><strong>POST /api/jobs/index</strong> - Index jobs for vector search</li>
            </ul>
          </div>
        </div>
      </main>
      
      <footer className="mt-16 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>Talent Matcher Agent v1.0.0 - Built with Next.js, Supabase, and Gemini AI</p>
      </footer>
    </div>
  );
}
