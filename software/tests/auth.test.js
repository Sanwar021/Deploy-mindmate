import test from 'node:test';
import assert from 'node:assert/strict';
import { authenticatePasskey, validateRegistration } from '../server/auth.js';

const sampleUsers = [
  { id: 'student-demo', name: 'Demo Student', email: 'student@mindmate.local', role: 'student' },
  { id: 'admin-demo', name: 'Research Admin', email: 'admin@mindmate.local', role: 'admin' },
];

test('student passkey 1234 authenticates student portal', () => {
  const res = authenticatePasskey({ role: 'student', passkey: '1234', users: sampleUsers });
  assert.equal(res.ok, true);
  assert.equal(res.user.role, 'student');
  assert.equal(res.user.id, 'student-demo');
});

test('admin passkey 3400 authenticates admin portal', () => {
  const res = authenticatePasskey({ role: 'admin', passkey: '3400', users: sampleUsers });
  assert.equal(res.ok, true);
  assert.equal(res.user.role, 'admin');
  assert.equal(res.user.id, 'admin-demo');
});

test('cross-role or invalid passkeys are rejected', () => {
  const adminWithStudentKey = authenticatePasskey({ role: 'admin', passkey: '1234', users: sampleUsers });
  assert.equal(adminWithStudentKey.ok, false);
  assert.equal(adminWithStudentKey.status, 401);

  const studentWithAdminKey = authenticatePasskey({ role: 'student', passkey: '3400', users: sampleUsers });
  assert.equal(studentWithAdminKey.ok, false);
  assert.equal(studentWithAdminKey.status, 401);

  const missingRole = authenticatePasskey({ role: 'guest', passkey: '1234', users: sampleUsers });
  assert.equal(missingRole.ok, false);
  assert.equal(missingRole.status, 400);
});

test('allows anyone to create a student account with valid details', () => {
  const res = validateRegistration({
    name: '  Amina   Rahman ',
    email: ' Amina@University.EDU ',
    password: 'StrongPassword123',
    confirmPassword: 'StrongPassword123',
    consent: true,
    users: sampleUsers,
  });
  assert.equal(res.ok, true);
  assert.equal(res.data.name, 'Amina Rahman');
  assert.equal(res.data.email, 'amina@university.edu');
  assert.equal(res.data.role, 'student');
});

test('allows admin registration only with valid admin passkey 3400', () => {
  const denied = validateRegistration({
    name: 'New Admin',
    email: 'newadmin@university.edu',
    password: 'StrongPassword123',
    confirmPassword: 'StrongPassword123',
    consent: true,
    role: 'admin',
    adminPasskey: '1234',
    users: sampleUsers,
  });
  assert.equal(denied.ok, false);
  assert.equal(denied.status, 401);

  const allowed = validateRegistration({
    name: 'New Admin',
    email: 'newadmin@university.edu',
    password: 'StrongPassword123',
    confirmPassword: 'StrongPassword123',
    consent: true,
    role: 'admin',
    adminPasskey: '3400',
    users: sampleUsers,
  });
  assert.equal(allowed.ok, true);
  assert.equal(allowed.data.role, 'admin');
});

test('rejects duplicate emails, mismatched passwords, or missing consent on registration', () => {
  const dup = validateRegistration({
    name: 'Demo',
    email: 'STUDENT@mindmate.local',
    password: 'StrongPassword123',
    consent: true,
    users: sampleUsers,
  });
  assert.equal(dup.ok, false);
  assert.equal(dup.status, 409);

  const mismatch = validateRegistration({
    name: 'Student',
    email: 'fresh@university.edu',
    password: 'StrongPassword123',
    confirmPassword: 'DifferentPassword',
    consent: true,
    users: sampleUsers,
  });
  assert.equal(mismatch.ok, false);
  assert.equal(mismatch.status, 400);

  const noConsent = validateRegistration({
    name: 'Student',
    email: 'fresh@university.edu',
    password: 'StrongPassword123',
    consent: false,
    users: sampleUsers,
  });
  assert.equal(noConsent.ok, false);
  assert.equal(noConsent.status, 400);
});
