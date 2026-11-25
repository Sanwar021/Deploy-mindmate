import crypto from 'node:crypto';

export const PASSKEYS = {
  student: process.env.STUDENT_PASSKEY || '1234',
  admin: process.env.ADMIN_PASSKEY || '3400',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function constantTimeMatch(input, expected) {
  const a = Buffer.from(String(input), 'utf8');
  const b = Buffer.from(String(expected), 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Validates a role-based passkey and resolves the matching portal user.
 */
export function authenticatePasskey({ role, passkey, users }) {
  const normalizedRole = String(role || '').trim().toLowerCase();
  const normalizedKey = String(passkey || '').trim();

  if (normalizedRole !== 'student' && normalizedRole !== 'admin') {
    return { ok: false, status: 400, error: 'Please select Student or Admin access.' };
  }
  if (!normalizedKey) {
    return { ok: false, status: 400, error: 'Please enter your 4-digit passkey.' };
  }
  if (!constantTimeMatch(normalizedKey, PASSKEYS[normalizedRole])) {
    const label = normalizedRole === 'admin' ? 'Admin' : 'Student';
    return { ok: false, status: 401, error: `Invalid passkey for ${label} access.` };
  }

  const preferredId = normalizedRole === 'admin' ? 'admin-demo' : 'student-demo';
  const user =
    users.find(u => u.id === preferredId) ||
    users.find(u => u.role === normalizedRole);

  if (!user) {
    return { ok: false, status: 404, error: 'Portal account is not configured.' };
  }
  return { ok: true, user };
}

/**
 * Validates registration input for creating a new Student or Admin account.
 */
export function validateRegistration({
  name,
  email,
  password,
  confirmPassword,
  consent,
  role = 'student',
  adminPasskey,
  users = [],
}) {
  const cleanName = String(name || '').trim().replace(/\s+/g, ' ');
  const cleanEmail = String(email || '').trim().toLowerCase();
  const rawPassword = String(password || '');
  const requestedRole = String(role || 'student').trim().toLowerCase();

  if (requestedRole !== 'student' && requestedRole !== 'admin') {
    return { ok: false, status: 400, error: 'Please choose a valid account role.' };
  }
  if (cleanName.length < 2) {
    return { ok: false, status: 400, error: 'Please enter your full name (at least 2 characters).' };
  }
  if (!EMAIL_RE.test(cleanEmail)) {
    return { ok: false, status: 400, error: 'Please enter a valid email address.' };
  }
  if (rawPassword.length < 8) {
    return { ok: false, status: 400, error: 'Password must be at least 8 characters long.' };
  }
  if (confirmPassword !== undefined && rawPassword !== String(confirmPassword)) {
    return { ok: false, status: 400, error: 'Passwords do not match.' };
  }
  if (!consent) {
    return { ok: false, status: 400, error: 'Please confirm that you understand this is a research prototype, not medical care.' };
  }
  if (requestedRole === 'admin' && !constantTimeMatch(String(adminPasskey || '').trim(), PASSKEYS.admin)) {
    return { ok: false, status: 401, error: 'Valid Admin passkey is required to create an Admin account.' };
  }
  if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
    return { ok: false, status: 409, error: 'An account with this email already exists. Please sign in.' };
  }

  return {
    ok: true,
    data: {
      name: cleanName,
      email: cleanEmail,
      password: rawPassword,
      role: requestedRole,
      consent: true,
    },
  };
}
