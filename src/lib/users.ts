// This file contains mock user data for authentication purposes.
// In a real-world application, this data would be stored in a secure database
// and passwords would be hashed using a strong algorithm like bcrypt.

export const MOCK_USERS = [
  {
    id: 'user-1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123', // Plain text for demonstration purposes only.
    role: 'admin' as const,
  },
  {
    id: 'user-2',
    name: 'Viewer User',
    email: 'viewer@example.com',
    password: 'password123',
    role: 'viewer' as const,
  },
];
