import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyEmail } from '../services/api.js';

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('Verifying your email...');

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setStatus('Missing verification token.');
      return;
    }
    verifyEmail(token)
      .then(() => setStatus('Email verified. You can return to chat.'))
      .catch((e) => setStatus(`Verification failed: ${e.message}`));
  }, [params]);

  return (
    <div className="mx-auto mt-24 max-w-xl rounded-2xl bg-slate-900/70 p-8 text-center">
      <p className="mb-4">{status}</p>
      <Link className="rounded-lg bg-indigo-500 px-4 py-2" to="/">Back to chat</Link>
    </div>
  );
}
