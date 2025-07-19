// This file is no longer used for fetching user data.
// User data is now fetched from MongoDB.
// You can populate your MongoDB `users` collection with this data.

export const MOCK_USERS_TO_SEED = [
  {
    id: 'user-1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123', // In a real app, hash this before seeding.
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
