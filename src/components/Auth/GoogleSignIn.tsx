import { LogIn, Zap } from 'lucide-react';

interface Props {
  onSignIn: () => void;
}

export function GoogleSignIn({ onSignIn }: Props) {
  const hasCreds = true;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Run For Startups
            </h1>
            <p className="mt-1 text-sm text-brand-300">CRM &amp; Pipeline Management</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20 p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-white">Sign in to continue</h2>
            <p className="mt-1.5 text-sm text-brand-300">
              Connect your Google account to access and sync your CRM data
            </p>
          </div>

          {!hasCreds && (
            <div className="mb-4 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-300">
              <strong>Setup required:</strong> Add{' '}
              <code className="rounded bg-black/20 px-1">VITE_GOOGLE_CLIENT_ID</code> to your{' '}
              <code className="rounded bg-black/20 px-1">.env</code> file to enable Google OAuth.
            </div>
          )}

          <button
            onClick={onSignIn}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50 hover:shadow active:scale-[0.98] disabled:opacity-50"
            disabled={!hasCreds}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <LogIn className="h-4 w-4" />
            Sign in with Google
          </button>

          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="text-center text-xs text-brand-400">
              Requires access to Google Sheets and Google Calendar
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-brand-500">
          Your data stays in your Google account. We never store credentials.
        </p>
      </div>
    </div>
  );
}
