import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Trip from '../models/Trip.js';
import Activity from '../models/Activity.js';
import PackingItem from '../models/PackingItem.js';
import { connectDB, disconnectDB } from '../config/db.js';

export const seedDemoData = async (clearExisting = false) => {
  try {
    if (clearExisting) {
      await Promise.all([
        User.deleteMany({}),
        Trip.deleteMany({}),
        Activity.deleteMany({}),
        PackingItem.deleteMany({}),
      ]);
    }

    // 1. Create Users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123!', salt);

    const alex = await User.create({
      name: 'Alex Rivera',
      email: 'alex@tripmate.io',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop',
    });

    const sarah = await User.create({
      name: 'Sarah Chen',
      email: 'sarah@tripmate.io',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop',
    });

    const marcus = await User.create({
      name: 'Marcus Vance',
      email: 'marcus@tripmate.io',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop',
    });

    // 2. Create Trips
    const kyotoStartDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const kyotoEndDate = new Date(Date.now() + 17 * 24 * 60 * 60 * 1000);

    const kyotoTrip = await Trip.create({
      ownerId: alex._id,
      title: 'Kyoto Autumn Serenade',
      destination: 'Kyoto, Japan',
      startDate: kyotoStartDate,
      endDate: kyotoEndDate,
      currency: 'USD',
      budget: 2500,
      coverUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&auto=format&fit=crop',
      collaborators: [
        { user: sarah._id, role: 'editor', addedAt: new Date() },
        { user: marcus._id, role: 'viewer', addedAt: new Date() },
      ],
      isPublic: true,
      shareToken: 'kyoto-autumn-2026',
    });

    const amalfiStartDate = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000);
    const amalfiEndDate = new Date(Date.now() + 50 * 24 * 60 * 60 * 1000);

    await Trip.create({
      ownerId: sarah._id,
      title: 'Amalfi Coast Summer Voyage',
      destination: 'Amalfi, Italy',
      startDate: amalfiStartDate,
      endDate: amalfiEndDate,
      currency: 'EUR',
      budget: 3200,
      coverUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&auto=format&fit=crop',
      collaborators: [{ user: alex._id, role: 'editor', addedAt: new Date() }],
      shareToken: 'amalfi-coast-2026',
      isPublic: false,
    });

    // 3. Create Activities for Kyoto Trip
    const kyotoActivities = [
      {
        tripId: kyotoTrip._id,
        dayNumber: 1,
        order: 0,
        title: 'Check-in at Ryokan Gion',
        category: 'Accommodation',
        time: '14:00',
        location: { name: 'Gion District, Kyoto', lat: 35.0037, lng: 135.7772 },
        cost: 380,
        notes: 'Traditional Japanese inn with hot spring onsen and evening Kaiseki dinner included.',
      },
      {
        tripId: kyotoTrip._id,
        dayNumber: 1,
        order: 1,
        title: 'Fushimi Inari Sunset Hike',
        category: 'Sightseeing',
        time: '16:30',
        location: { name: 'Fushimi Inari Shrine', lat: 34.9671, lng: 135.7727 },
        cost: 0,
        notes: 'Walk through thousands of vibrant vermilion Torii gates during the golden hour.',
      },
      {
        tripId: kyotoTrip._id,
        dayNumber: 1,
        order: 2,
        title: 'Dinner at Pontocho Alley',
        category: 'Food',
        time: '19:30',
        location: { name: 'Pontocho Alley', lat: 35.0061, lng: 135.7711 },
        cost: 85,
        notes: 'Try authentic wagyu sukiyaki and matcha craft beer overlooking the Kamogawa River.',
      },
      {
        tripId: kyotoTrip._id,
        dayNumber: 2,
        order: 0,
        title: 'Arashiyama Bamboo Grove Walk',
        category: 'Sightseeing',
        time: '08:00',
        location: { name: 'Arashiyama Bamboo Grove', lat: 35.0169, lng: 135.6713 },
        cost: 0,
        notes: 'Visit early in the morning before crowds arrive for serene photography.',
      },
      {
        tripId: kyotoTrip._id,
        dayNumber: 2,
        order: 1,
        title: 'Tenryu-ji Temple & Zen Garden',
        category: 'Sightseeing',
        time: '10:30',
        location: { name: 'Tenryu-ji Temple', lat: 35.0158, lng: 135.6777 },
        cost: 15,
        notes: 'UNESCO World Heritage site with stunning pond reflection.',
      },
      {
        tripId: kyotoTrip._id,
        dayNumber: 2,
        order: 2,
        title: 'Traditional Matcha Ceremony',
        category: 'Entertainment',
        time: '14:00',
        location: { name: 'Camellia Tea House Kyoto', lat: 34.9983, lng: 135.7818 },
        cost: 45,
        notes: 'Private tea master workshop explaining historical tea preparation rituals.',
      },
      {
        tripId: kyotoTrip._id,
        dayNumber: 3,
        order: 0,
        title: 'Kinkaku-ji (Golden Pavilion)',
        category: 'Sightseeing',
        time: '09:00',
        location: { name: 'Kinkaku-ji', lat: 35.0394, lng: 135.7292 },
        cost: 10,
        notes: 'Top two floors completely covered in gold leaf.',
      },
      {
        tripId: kyotoTrip._id,
        dayNumber: 3,
        order: 1,
        title: 'Nishiki Market Street Food Tour',
        category: 'Food',
        time: '12:30',
        location: { name: 'Nishiki Market', lat: 35.0051, lng: 135.7649 },
        cost: 50,
        notes: 'Known as "Kyoto\'s Kitchen". Sample fresh takoyaki, dango, and pickled seafood.',
      },
      {
        tripId: kyotoTrip._id,
        dayNumber: 3,
        order: 2,
        title: 'Shinkansen Bullet Train Tickets',
        category: 'Transportation',
        time: '18:00',
        location: { name: 'Kyoto Station', lat: 34.9858, lng: 135.7588 },
        cost: 140,
        notes: 'Reserved seats on Tokaido-Sanyo Shinkansen line.',
      },
      {
        tripId: kyotoTrip._id,
        dayNumber: 4,
        order: 0,
        title: 'Kiyomizu-dera Morning Visit',
        category: 'Sightseeing',
        time: '08:30',
        location: { name: 'Kiyomizu-dera', lat: 34.9949, lng: 135.7850 },
        cost: 12,
        notes: 'Historic wooden terrace with sweeping panoramic views of Kyoto.',
      },
      {
        tripId: kyotoTrip._id,
        dayNumber: 4,
        order: 1,
        title: 'Souvenir Shopping at Sannenzaka',
        category: 'Shopping',
        time: '11:00',
        location: { name: 'Sannenzaka & Ninenzaka', lat: 34.9972, lng: 135.7820 },
        cost: 120,
        notes: 'Handmade Kyoto ceramics, incense, and local sweets.',
      },
    ];

    await Activity.insertMany(kyotoActivities);

    // 4. Create Packing Items
    const kyotoPacking = [
      { tripId: kyotoTrip._id, label: 'Passport & Japan Rail Pass', category: 'Documents', isPacked: true },
      { tripId: kyotoTrip._id, label: 'Universal Power Adapter (Type A)', category: 'Electronics', isPacked: true },
      { tripId: kyotoTrip._id, label: 'Comfortable Walking Shoes', category: 'Clothing', isPacked: true },
      { tripId: kyotoTrip._id, label: 'Light Rain Jacket', category: 'Clothing', isPacked: false },
      { tripId: kyotoTrip._id, label: 'Pocket Wi-Fi / eSIM', category: 'Electronics', isPacked: true },
      { tripId: kyotoTrip._id, label: 'Slip-on shoes for temple entry', category: 'Clothing', isPacked: false },
      { tripId: kyotoTrip._id, label: 'Cash in JPY for street markets', category: 'Documents', isPacked: false },
      { tripId: kyotoTrip._id, label: 'Camera & extra memory cards', category: 'Electronics', isPacked: true },
    ];

    await PackingItem.insertMany(kyotoPacking);
    console.log('Demo data successfully seeded.');
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

// If run from command line directly
const isDirectRun = process.argv[1]?.includes('seed.js');
if (isDirectRun) {
  connectDB().then(async () => {
    await seedDemoData(true);
    await disconnectDB();
    process.exit(0);
  });
}
