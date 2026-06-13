import type { ReactNode } from 'react';
import { PillIcon } from '../components/icons';
import { APP_VERSION } from '../version';

/** Centered, minimal layout for the login / sign-up screens. */
export default function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50/40 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-sm shadow-teal-600/20">
            <PillIcon className="h-7 w-7" weight="bold" />
          </span>
          <h1 className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
            Pharmacy Toolbox
          </h1>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-5">{children}</div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          For authorised clinical pharmacy staff only · v{APP_VERSION}
        </p>
      </div>
    </div>
  );
}

export const authInputCls =
  'block w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/25';
