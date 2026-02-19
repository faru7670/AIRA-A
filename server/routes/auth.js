import express from 'express';
import { nanoid } from 'nanoid';
import { env } from '../config/env.js';
import { consumeVerificationToken, createVerificationToken, getChats, getUser, upsertUser } from '../services/store.js';
import { getGoogleAuthUrl, getGoogleProfileFromCode } from '../services/googleOAuthService.js';
import { sendVerificationEmail } from '../services/emailService.js';

export const authRouter = express.Router();

authRouter.get('/google/url', (req, res) => {
  try {
    const url = getGoogleAuthUrl();
    res.json({ url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

authRouter.get('/google/callback', async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).json({ error: 'Missing OAuth code.' });

    const profile = await getGoogleProfileFromCode(code);
    const user = upsertUser({
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
      verified: false
    });

    const token = nanoid(48);
    createVerificationToken(user.email, token, Date.now() + 1000 * 60 * 30);
    const verificationLink = `${env.clientOrigin}/verify-email?token=${token}`;
    await sendVerificationEmail(user.email, verificationLink);

    req.session.user = { email: user.email, name: user.name, picture: user.picture, verified: user.verified };
    res.redirect(`${env.clientOrigin}/auth/success?pendingVerification=true`);
  } catch (error) {
    res.redirect(`${env.clientOrigin}/auth/error?message=${encodeURIComponent(error.message)}`);
  }
});

authRouter.post('/verify-email', express.json(), (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Verification token is required.' });

  const record = consumeVerificationToken(token);
  if (!record) return res.status(400).json({ error: 'Token is invalid or expired.' });

  const user = getUser(record.email);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const updated = upsertUser({ ...user, verified: true });
  req.session.user = { email: updated.email, name: updated.name, picture: updated.picture, verified: true };
  res.json({ ok: true, user: req.session.user });
});

authRouter.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('aira.sid');
    res.json({ ok: true });
  });
});

authRouter.get('/session', (req, res) => {
  const user = req.session.user;
  if (!user) return res.json({ user: null, history: [] });
  const history = user.verified ? getChats(user.email) : [];
  res.json({ user, history });
});
