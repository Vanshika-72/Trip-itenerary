import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import Trip from '../models/Trip.js';
import Activity from '../models/Activity.js';
import PackingItem from '../models/PackingItem.js';
import Invitation from '../models/Invitation.js';

let ownerToken = '';
let editorToken = '';
let strangerToken = '';
let ownerUser, editorUser, strangerUser;
let tripId = '';
let activity1Id = '';
let activity2Id = '';
let shareToken = '';

test.before(async () => {
  process.env.NODE_ENV = 'test';
  await connectDB();
  await Promise.all([
    User.deleteMany({}),
    Trip.deleteMany({}),
    Activity.deleteMany({}),
    PackingItem.deleteMany({}),
    Invitation.deleteMany({}),
  ]);

  // Create Owner
  const ownerRes = await request(app).post('/api/auth/register').send({
    name: 'Alice Owner',
    email: 'alice@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  });
  ownerToken = ownerRes.body.token;
  ownerUser = ownerRes.body.user;

  // Create Editor
  const editorRes = await request(app).post('/api/auth/register').send({
    name: 'Bob Editor',
    email: 'bob@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  });
  editorToken = editorRes.body.token;
  editorUser = editorRes.body.user;

  // Create Stranger (No membership)
  const strangerRes = await request(app).post('/api/auth/register').send({
    name: 'Charlie Stranger',
    email: 'charlie@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  });
  strangerToken = strangerRes.body.token;
  strangerUser = strangerRes.body.user;
});

test.after(async () => {
  await disconnectDB();
});

test('Trip & Collaboration System Tests', async (t) => {
  await t.test('POST /api/trips should create a trip and compute days correctly', async () => {
    const res = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        title: 'Swiss Alps Expedition',
        destination: 'Interlaken, Switzerland',
        startDate: '2026-07-10',
        endDate: '2026-07-13', // 4 inclusive days
        currency: 'CHF',
        budget: 2000,
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.trip.title, 'Swiss Alps Expedition');
    assert.equal(res.body.trip.totalDays, 4);
    assert.equal(res.body.trip.days.length, 4);
    assert.equal(res.body.trip.userRole, 'owner');
    tripId = res.body.trip._id;
  });

  await t.test('GET /api/trips should list trips owned by user', async () => {
    const res = await request(app)
      .get('/api/trips')
      .set('Authorization', `Bearer ${ownerToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.count, 1);
    assert.equal(res.body.trips[0]._id, tripId);
  });

  await t.test('GET /api/trips/:id should reject unauthorized user (IDOR protection)', async () => {
    const res = await request(app)
      .get(`/api/trips/${tripId}`)
      .set('Authorization', `Bearer ${strangerToken}`);

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });

  await t.test('POST /api/trips/:id/invites should allow owner to invite collaborator', async () => {
    const res = await request(app)
      .post(`/api/trips/${tripId}/invites`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        email: 'bob@example.com',
        role: 'editor',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.invitation.token);

    // Accept invite as Bob
    const acceptRes = await request(app)
      .post(`/api/invites/${res.body.invitation.token}/accept`)
      .set('Authorization', `Bearer ${editorToken}`);

    assert.equal(acceptRes.status, 200);
    assert.equal(acceptRes.body.success, true);
  });

  await t.test('Bob (Editor) should now have access to the trip', async () => {
    const res = await request(app)
      .get(`/api/trips/${tripId}`)
      .set('Authorization', `Bearer ${editorToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.trip.userRole, 'editor');
  });

  await t.test('Bob (Editor) should NOT be allowed to delete the trip (Owner only)', async () => {
    const res = await request(app)
      .delete(`/api/trips/${tripId}`)
      .set('Authorization', `Bearer ${editorToken}`);

    assert.equal(res.status, 403);
  });

  await t.test('Bob (Editor) can add activities', async () => {
    const res1 = await request(app)
      .post(`/api/trips/${tripId}/activities`)
      .set('Authorization', `Bearer ${editorToken}`)
      .send({
        dayNumber: 1,
        title: 'Arrive in Interlaken',
        category: 'Transportation',
        time: '11:00',
        location: { name: 'Interlaken Ost Station', lat: 46.6908, lng: 7.8688 },
        cost: 60,
        notes: 'Take scenic train from Zurich',
      });

    assert.equal(res1.status, 201);
    assert.equal(res1.body.activity.order, 0);
    activity1Id = res1.body.activity._id;

    const res2 = await request(app)
      .post(`/api/trips/${tripId}/activities`)
      .set('Authorization', `Bearer ${editorToken}`)
      .send({
        dayNumber: 1,
        title: 'Lake Brienz Cruise',
        category: 'Sightseeing',
        time: '15:00',
        location: { name: 'Lake Brienz', lat: 46.7167, lng: 7.9667 },
        cost: 45,
      });

    assert.equal(res2.status, 201);
    assert.equal(res2.body.activity.order, 1);
    activity2Id = res2.body.activity._id;
  });

  await t.test('PATCH /api/trips/:id/activities/reorder should reorder activities within the day', async () => {
    const res = await request(app)
      .patch(`/api/trips/${tripId}/activities/reorder`)
      .set('Authorization', `Bearer ${editorToken}`)
      .send({
        activityId: activity2Id,
        targetDay: 1,
        targetPosition: 0,
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    
    // Check orders
    const act2 = res.body.activities.find((a) => a._id === activity2Id);
    const act1 = res.body.activities.find((a) => a._id === activity1Id);
    assert.equal(act2.order, 0);
    assert.equal(act1.order, 1);
  });

  await t.test('PATCH /api/trips/:id/activities/reorder should move activity across days', async () => {
    const res = await request(app)
      .patch(`/api/trips/${tripId}/activities/reorder`)
      .set('Authorization', `Bearer ${editorToken}`)
      .send({
        activityId: activity1Id,
        targetDay: 2,
        targetPosition: 0,
      });

    assert.equal(res.status, 200);
    const act1 = res.body.activities.find((a) => a._id === activity1Id);
    assert.equal(act1.dayNumber, 2);
    assert.equal(act1.order, 0);
  });

  await t.test('GET /api/trips/:id/budget should return accurate budget aggregations', async () => {
    const res = await request(app)
      .get(`/api/trips/${tripId}/budget`)
      .set('Authorization', `Bearer ${editorToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.budget.totalBudget, 2000);
    assert.equal(res.body.budget.totalPlannedCost, 105); // 60 + 45
    assert.equal(res.body.budget.remainingBudget, 1895);
    assert.equal(res.body.budget.currency, 'CHF');
  });

  await t.test('Packing item CRUD operations', async () => {
    // Add item
    const addRes = await request(app)
      .post(`/api/trips/${tripId}/packing`)
      .set('Authorization', `Bearer ${editorToken}`)
      .send({
        label: 'Hiking Boots',
        category: 'Clothing',
      });

    assert.equal(addRes.status, 201);
    const itemId = addRes.body.item._id;

    // Toggle packed
    const updateRes = await request(app)
      .patch(`/api/trips/${tripId}/packing/${itemId}`)
      .set('Authorization', `Bearer ${editorToken}`)
      .send({ isPacked: true });

    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.body.item.isPacked, true);

    // Get list
    const listRes = await request(app)
      .get(`/api/trips/${tripId}/packing`)
      .set('Authorization', `Bearer ${editorToken}`);

    assert.equal(listRes.status, 200);
    assert.equal(listRes.body.stats.total, 1);
    assert.equal(listRes.body.stats.packed, 1);
    assert.equal(listRes.body.stats.percentage, 100);
  });

  await t.test('Public sharing: toggle ON, access public page, then toggle OFF and verify revocation', async () => {
    // Toggle ON
    const shareOnRes = await request(app)
      .patch(`/api/trips/${tripId}/share`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ isPublic: true });

    assert.equal(shareOnRes.status, 200);
    assert.equal(shareOnRes.body.isPublic, true);
    assert.ok(shareOnRes.body.shareToken);
    shareToken = shareOnRes.body.shareToken;

    // Access public endpoint without auth
    const publicGetRes = await request(app).get(`/api/public/trips/${shareToken}`);
    assert.equal(publicGetRes.status, 200);
    assert.equal(publicGetRes.body.trip.title, 'Swiss Alps Expedition');
    assert.ok(publicGetRes.body.trip.activities.length > 0);

    // Toggle OFF
    const shareOffRes = await request(app)
      .patch(`/api/trips/${tripId}/share`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ isPublic: false });

    assert.equal(shareOffRes.status, 200);

    // Access public endpoint should now fail 404
    const publicFailRes = await request(app).get(`/api/public/trips/${shareToken}`);
    assert.equal(publicFailRes.status, 404);
  });

  await t.test('GET /api/trips/:id/itinerary.pdf should stream a valid PDF document', async () => {
    const res = await request(app)
      .get(`/api/trips/${tripId}/itinerary.pdf`)
      .set('Authorization', `Bearer ${ownerToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.headers['content-type'], 'application/pdf');
    assert.ok(res.body);
  });
});
