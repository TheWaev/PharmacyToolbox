import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import AuthLayout, { authInputCls } from '../auth/AuthLayout';
import { authDevBypass } from '../lib/supabase';
import { EmailIcon, LockIcon, SignInIcon, SpinnerIcon, AlertIcon } from '../components/icons';

export default function Login() {
  const { session, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (authDevBypass || session) return <Navigate to="/" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) setError(error);
    else navigate('/', { replace: true });
  }

  return (
    <AuthLayout title="Sign in" subtitle="Welcome back. Sign in to access the tools.">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && (
          <p className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-sm text-red-700">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" weight="fill" />
            {error}
          </p>
        )}

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <div className="relative mt-1">
            <EmailIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@nhs.net"
              className={authInputCls}
            />
          </div>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <div className="relative mt-1">
            <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={authInputCls}
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? (
            <SpinnerIcon className="h-4 w-4 animate-spin" weight="bold" />
          ) : (
            <SignInIcon className="h-4 w-4" weight="bold" />
          )}
          Sign in
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        No account?{' '}
        <Link to="/signup" className="font-medium text-teal-700 hover:text-teal-900">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
