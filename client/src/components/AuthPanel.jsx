export function AuthPanel({ user, onGoogleLogin, onGuest, onLogout }) {
  return (
    <div className="glass mb-4 flex items-center justify-between rounded-2xl p-4">
      <div>
        <h1 className="text-2xl font-semibold">AIRA-AI</h1>
        <p className="text-sm text-slate-300">Multimodal assistant with real API intelligence</p>
      </div>
      <div className="flex items-center gap-2">
        {user ? (
          <>
            <p className="text-sm">{user.name} {user.verified ? '✅' : '⚠️ verify email'}</p>
            <button onClick={onLogout} className="rounded-lg bg-slate-700 px-3 py-2">Logout</button>
          </>
        ) : (
          <>
            <button onClick={onGoogleLogin} className="rounded-lg bg-red-500 px-3 py-2">Login with Google</button>
            <button onClick={onGuest} className="rounded-lg bg-slate-700 px-3 py-2">Try without login</button>
          </>
        )}
      </div>
    </div>
  );
}
