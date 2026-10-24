const express = require('express');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const PORT = Number(process.env.PORT || 3000);
// Configure ADMIN_CODE=1917 et un JWT_SECRET long dans les variables d'environnement Render.
const ADMIN_CODE = process.env.ADMIN_CODE || '1917';
const JWT_SECRET = process.env.JWT_SECRET;

app.get('/health', (_req, res) => res.json({ ok: true, service: 'ambre-3724-admin-server' }));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { ok: false, error: 'Trop de tentatives. Réessaie plus tard.' }
});

app.post('/api/admin/login', loginLimiter, (req, res) => {
  if (!JWT_SECRET) {
    return res.status(503).json({ ok: false, error: 'Le serveur doit être configuré avec JWT_SECRET.' });
  }
  const code = String(req.body?.code ?? '');
  if (code !== ADMIN_CODE) return res.status(401).json({ ok: false, error: 'Code incorrect.' });
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '2h', issuer: 'ambre-3724' });
  return res.json({ ok: true, token, expiresIn: 7200 });
});

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || '';
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match || !JWT_SECRET) return res.status(401).json({ ok: false, error: 'Authentification admin requise.' });
  try {
    const payload = jwt.verify(match[1], JWT_SECRET, { issuer: 'ambre-3724' });
    if (payload.role !== 'admin') throw new Error('not admin');
    req.admin = payload;
    return next();
  } catch {
    return res.status(401).json({ ok: false, error: 'Session admin invalide ou expirée.' });
  }
}

app.get('/api/admin/status', requireAdmin, (_req, res) => res.json({ ok: true, role: 'admin' }));

app.get('/api', (_req, res) => res.json({
  service: 'Ambre 3724 Admin API',
  endpoints: ['GET /health', 'POST /api/admin/login', 'GET /api/admin/status']
}));

app.listen(PORT, '0.0.0.0', () => console.log(`Ambre 3724 admin server listening on ${PORT}`));
