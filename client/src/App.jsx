import { Route, Routes } from 'react-router-dom';
import { ChatPage } from './pages/ChatPage.jsx';
import { VerifyEmailPage } from './pages/VerifyEmailPage.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Routes>
        <Route path="/" element={<ChatPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/auth/success" element={<ChatPage />} />
        <Route path="/auth/error" element={<ChatPage />} />
      </Routes>
    </div>
  );
}
