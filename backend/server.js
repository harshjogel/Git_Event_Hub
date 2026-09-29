// server.js - Express server and REST API for Git Club Event Hub
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for cross-origin frontend requests
app.use(express.json()); // Parse JSON request bodies

// Helper function to format an event row for the frontend
function formatEvent(row, regCount = 0) {
  let learn = [];
  let schedule = [];
  try {
    learn = row.learn ? JSON.parse(row.learn) : [];
  } catch (e) {
    learn = [];
  }
  try {
    schedule = row.schedule ? JSON.parse(row.schedule) : [];
  } catch (e) {
    schedule = [];
  }

  const attendeeCount = (row.initial_attendees || 0) + (regCount || 0);

  return {
    id: row.id,
    name: row.name,
    title: row.name, // Alias for frontend compatibility
    slug: row.slug || `event-${row.id}`,
    category: row.category,
    date: row.date,
    dateLabel: row.date, // Alias for frontend compatibility
    time: row.time,
    venue: row.venue,
    description: row.description,
    full_description: row.full_description,
    about: row.full_description, // Alias for frontend compatibility
    image: row.image || '',
    capacity: row.capacity,
    organizer: row.organizer,
    is_past: row.is_past,
    past: Boolean(row.is_past), // Boolean alias for frontend compatibility
    tagline: row.tagline || '',
    attendance: row.attendance || 'Open to all students.',
    visual: row.visual || 'branch',
    featured: Boolean(row.featured),
    attendeeCount: attendeeCount,
    learn: learn,
    schedule: schedule
  };
}

// -------------------------------------------------------------
// REST API Endpoints
// -------------------------------------------------------------

// Root endpoint - Health check / Info
app.get('/', (req, res) => {
  res.json({
    message: 'Git Club Event Hub API is running!',
    endpoints: [
      'GET /api/events',
      'GET /api/events/:id',
      'GET /api/events/:id/registrations/count',
      'POST /api/registrations'
    ]
  });
});

// 1. GET /api/events
// Fetch all events with optional filters (category, search, past)
app.get('/api/events', (req, res) => {
  const { category, search, past } = req.query;

  let query = 'SELECT * FROM events WHERE 1=1';
  const params = [];

  // Filter by category
  if (category && category !== 'All') {
    query += ' AND LOWER(category) = LOWER(?)';
    params.push(category);
  }

  // Filter by past or upcoming
  if (past !== undefined) {
    const isPastVal = (past === 'true' || past === '1') ? 1 : 0;
    query += ' AND is_past = ?';
    params.push(isPastVal);
  }

  // Filter by search keyword (searches name, description, venue, and category)
  if (search && search.trim() !== '') {
    const needle = `%${search.trim().toLowerCase()}%`;
    query += ' AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(venue) LIKE ? OR LOWER(category) LIKE ?)';
    params.push(needle, needle, needle, needle);
  }

  query += ' ORDER BY id ASC';

  // Execute events query
  db.all(query, params, (err, events) => {
    if (err) {
      console.error('Database error fetching events:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve events' });
    }

    // Get registration counts for all events to display up-to-date attendee numbers
    db.all('SELECT event_id, COUNT(*) as count FROM registrations GROUP BY event_id', [], (countErr, countRows) => {
      const countsMap = {};
      if (!countErr && countRows) {
        countRows.forEach((r) => {
          countsMap[r.event_id] = r.count;
        });
      }

      const formattedEvents = events.map((ev) => formatEvent(ev, countsMap[ev.id] || 0));
      res.json(formattedEvents);
    });
  });
});

// 2. GET /api/events/:id
// Get single event details by numeric ID or by slug
app.get('/api/events/:id', (req, res) => {
  const param = req.params.id;
  const isNumeric = /^\d+$/.test(param);

  let query = '';
  let params = [];

  if (isNumeric) {
    query = 'SELECT * FROM events WHERE id = ?';
    params = [Number(param)];
  } else {
    query = 'SELECT * FROM events WHERE slug = ?';
    params = [param];
  }

  db.get(query, params, (err, row) => {
    if (err) {
      console.error('Database error fetching event:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve event' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Fetch registration count for this event
    db.get('SELECT COUNT(*) as count FROM registrations WHERE event_id = ?', [row.id], (countErr, countRow) => {
      const regCount = (!countErr && countRow) ? countRow.count : 0;
      res.json(formatEvent(row, regCount));
    });
  });
});

// 3. GET /api/events/:id/registrations/count
// Get participant registration count for an event
app.get('/api/events/:id/registrations/count', (req, res) => {
  const param = req.params.id;
  const isNumeric = /^\d+$/.test(param);

  const query = isNumeric
    ? 'SELECT id, initial_attendees FROM events WHERE id = ?'
    : 'SELECT id, initial_attendees FROM events WHERE slug = ?';

  db.get(query, [param], (err, eventRow) => {
    if (err || !eventRow) {
      return res.status(404).json({ error: 'Event not found' });
    }

    db.get('SELECT COUNT(*) as count FROM registrations WHERE event_id = ?', [eventRow.id], (countErr, countRow) => {
      if (countErr) {
        return res.status(500).json({ error: 'Failed to count registrations' });
      }

      const totalCount = (eventRow.initial_attendees || 0) + (countRow ? countRow.count : 0);
      res.json({
        event_id: eventRow.id,
        count: totalCount
      });
    });
  });
});

// 4. POST /api/registrations
// Register a student for an event
app.post('/api/registrations', (req, res) => {
  const { event_id, name, email, college } = req.body;

  // Validation: Name is required
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Name is required' });
  }

  // Validation: Email is required and must be valid
  if (!email || typeof email !== 'string' || email.trim() === '') {
    return res.status(400).json({ error: 'Email is required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  // Validation: Event ID is required
  if (!event_id) {
    return res.status(400).json({ error: 'Event ID is required' });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanCollege = college ? college.trim() : 'CHARUSAT';

  // Step 1: Check if the event exists
  db.get('SELECT id, name, capacity, is_past FROM events WHERE id = ?', [event_id], (err, event) => {
    if (err) {
      console.error('Error verifying event:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!event) {
      return res.status(404).json({ error: 'Event does not exist' });
    }

    if (event.is_past) {
      return res.status(400).json({ error: 'Cannot register for past events' });
    }

    // Step 2: Prevent duplicate registrations with the same email for the same event
    db.get(
      'SELECT id FROM registrations WHERE event_id = ? AND LOWER(email) = ?',
      [event_id, cleanEmail],
      (dupErr, existingReg) => {
        if (dupErr) {
          console.error('Error checking duplicate registration:', dupErr.message);
          return res.status(500).json({ error: 'Database error' });
        }

        if (existingReg) {
          return res.status(400).json({
            error: 'You are already registered for this event with this email address'
          });
        }

        // Step 3: Insert the new registration into the database
        const insertSql = `
          INSERT INTO registrations (event_id, name, email, college)
          VALUES (?, ?, ?, ?)
        `;

        db.run(insertSql, [event_id, cleanName, cleanEmail, cleanCollege], function (insertErr) {
          if (insertErr) {
            console.error('Error inserting registration:', insertErr.message);
            return res.status(500).json({ error: 'Failed to complete registration' });
          }

          console.log(`[Registration] New registration #${this.lastID} for event "${event.name}" by ${cleanName} (${cleanEmail})`);

          return res.status(201).json({
            success: true,
            message: 'Registration successful'
          });
        });
      }
    );
  });
});

// Start the server (when running standalone)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` Git Club Event Hub Backend running on port ${PORT}`);
    console.log(` Local URL: http://localhost:${PORT}`);
    console.log(` Events API: http://localhost:${PORT}/api/events`);
    console.log(`===============================================`);
  });
}

module.exports = app;
