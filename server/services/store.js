const usersByEmail = new Map();
const verificationTokens = new Map();
const chatsByUser = new Map();

export function upsertUser(user) {
  const existing = usersByEmail.get(user.email) ?? { history: [] };
  const merged = { ...existing, ...user };
  usersByEmail.set(user.email, merged);
  return merged;
}

export function getUser(email) {
  return usersByEmail.get(email);
}

export function createVerificationToken(email, token, expiresAt) {
  verificationTokens.set(token, { email, expiresAt });
}

export function consumeVerificationToken(token) {
  const record = verificationTokens.get(token);
  if (!record) return null;
  verificationTokens.delete(token);
  if (record.expiresAt < Date.now()) return null;
  return record;
}

export function saveChat(email, entry) {
  const history = chatsByUser.get(email) ?? [];
  history.unshift(entry);
  chatsByUser.set(email, history.slice(0, 50));
}

export function getChats(email) {
  return chatsByUser.get(email) ?? [];
}
