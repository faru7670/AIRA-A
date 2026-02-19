import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { sessionMiddleware } from './middleware/session.js';
import { chatRouter } from './routes/chat.js';
import { authRouter } from './routes/auth.js';

const app = express();

app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(sessionMiddleware);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'AIRA-AI server' });
});

app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);

app.use((err, _req, res, _next) => {
  res.status(500).json({ error: err.message || 'Unhandled server error.' });
});

app.listen(env.port, () => {
  console.log(`AIRA-AI server running on http://localhost:${env.port}`);
});
