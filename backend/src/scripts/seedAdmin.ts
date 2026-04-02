import dotenv from 'dotenv';
dotenv.config();

import { clerkClient } from '../config/clerk';

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  
  if (!adminEmail) {
    console.error('ADMIN_EMAIL environment variable is required');
    process.exit(1);
  }

  try {
    // Find user by email
    const users = await clerkClient.users.getUserList({
      emailAddress: [adminEmail],
    });

    if (users.data.length === 0) {
      console.error(`No user found with email: ${adminEmail}`);
      console.log('Please sign up first, then run this script.');
      process.exit(1);
    }

    const user = users.data[0];

    // Update user metadata to admin
    await clerkClient.users.updateUserMetadata(user.id, {
      publicMetadata: { role: 'admin' },
    });

    console.log(`Successfully set admin role for: ${adminEmail}`);
    console.log(`Clerk User ID: ${user.id}`);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
