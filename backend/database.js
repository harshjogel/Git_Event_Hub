// database.js - SQLite database setup and initialization for Git Club Event Hub
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Path to SQLite database file
const dbPath = path.join(__dirname, 'database.sqlite');

// Initialize database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    initDatabase();
  }
});

// Create tables and seed data if not present
function initDatabase() {
  db.serialize(() => {
    // 1. Create events table
    db.run(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        venue TEXT NOT NULL,
        description TEXT,
        full_description TEXT,
        image TEXT,
        capacity INTEGER DEFAULT 100,
        organizer TEXT DEFAULT 'Git Club',
        is_past INTEGER DEFAULT 0,
        slug TEXT,
        tagline TEXT,
        learn TEXT,
        schedule TEXT,
        attendance TEXT,
        visual TEXT,
        featured INTEGER DEFAULT 0,
        initial_attendees INTEGER DEFAULT 0
      )
    `);

    // 2. Create registrations table
    db.run(`
      CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        college TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events (id)
      )
    `);

    // 3. Check if events table needs seeding
    db.get('SELECT COUNT(*) AS count FROM events', (err, row) => {
      if (err) {
        console.error('Error checking events count:', err.message);
        return;
      }

      if (row.count === 0) {
        console.log('Events table is empty. Seeding realistic Git Club events...');
        seedEvents();
      } else {
        console.log(`Database already has ${row.count} events loaded.`);
      }
    });
  });
}

// Seed the 10 realistic Git Club events
function seedEvents() {
  const eventsData = [
    {
      name: 'Git & GitHub Bootcamp',
      slug: 'git-github-bootcamp',
      tagline: 'Build confidence from your first commit to your first pull request.',
      category: 'Workshop',
      date: 'October 8, 2026',
      time: '10:00 AM – 1:00 PM',
      venue: 'Computer Lab 2',
      description: 'Learn Git fundamentals, branching, merging, pull requests, and collaborative workflows through hands-on exercises.',
      full_description: 'Start with a clean working tree and leave with a workflow you can use in every class, club, and side project. This guided bootcamp turns the vocabulary of Git into practical habits through small challenges, pair work, and a friendly merge-conflict lab.',
      image: '',
      capacity: 100,
      organizer: 'Git Club',
      is_past: 0,
      learn: JSON.stringify(['Git fundamentals', 'Branching and merging', 'Pull requests', 'Team collaboration', 'Hands-on challenges']),
      schedule: JSON.stringify([
        { time: '10:00 AM', label: 'Introduction', detail: 'Meet the room and understand the version-control workflow.' },
        { time: '10:30 AM', label: 'Git Basics', detail: 'Make commits, inspect history, and sync with a remote repository.' },
        { time: '11:15 AM', label: 'Hands-on Challenge', detail: 'Work through branches and resolve a friendly merge conflict.' },
        { time: '12:15 PM', label: 'Team Activity', detail: 'Open a pull request and practice giving useful review feedback.' },
        { time: '1:00 PM', label: 'Closing', detail: 'Take your questions, notes, and next Git experiment with you.' }
      ]),
      attendance: 'Open to all students interested in software development. No prior Git experience needed.',
      visual: 'branch',
      featured: 1,
      initial_attendees: 34
    },
    {
      name: 'CodeRush',
      slug: 'coderush',
      tagline: 'Think fast, pair up, and make the cleanest solution win.',
      category: 'Competition',
      date: 'October 15, 2026',
      time: '2:00 PM – 5:00 PM',
      venue: 'Seminar Hall',
      description: 'A friendly coding competition built around creative problem-solving, teamwork, and a little time pressure.',
      full_description: 'CodeRush brings short, focused challenges to a room full of curious builders. Work solo or with a teammate, compare approaches, and learn how small improvements in clarity can make a big difference when the clock is running.',
      image: '',
      capacity: 80,
      organizer: 'Git Club',
      is_past: 0,
      learn: JSON.stringify(['Problem decomposition', 'Readable solutions', 'Collaborating under pressure', 'Fast feedback loops']),
      schedule: JSON.stringify([
        { time: '2:00 PM', label: 'Challenge briefing', detail: 'Meet the format, scoring, and problem set.' },
        { time: '2:20 PM', label: 'Round one', detail: 'Warm up with a problem designed to get everyone moving.' },
        { time: '3:15 PM', label: 'Round two', detail: 'Take on a deeper challenge with optional pair programming.' },
        { time: '4:30 PM', label: 'Review + awards', detail: 'Walk through the best ideas and celebrate the room.' }
      ]),
      attendance: 'Beginner-friendly. Teams of one or two students are welcome.',
      visual: 'sprint',
      featured: 0,
      initial_attendees: 52
    },
    {
      name: 'HackForge 2026',
      slug: 'hackforge-2026',
      tagline: 'Two days to turn a rough idea into something real.',
      category: 'Hackathon',
      date: 'October 24–25, 2026',
      time: '9:00 AM onward',
      venue: 'Innovation Lab',
      description: 'A weekend hackathon for teams who want to build, learn, and demo something useful.',
      full_description: 'Bring a campus pain point, a half-formed idea, or simply the curiosity to build with new people. HackForge gives you the runway, mentors, and community to make a prototype worth showing on Sunday.',
      image: '',
      capacity: 150,
      organizer: 'Git Club',
      is_past: 0,
      learn: JSON.stringify(['Scoping a realistic MVP', 'Fast collaboration rituals', 'Working with unfamiliar tools', 'Telling a clear demo story']),
      schedule: JSON.stringify([
        { time: 'Sat 9:00 AM', label: 'Opening + ideas', detail: 'Find a problem, pitch an idea, and form a team.' },
        { time: 'Sat 11:00 AM', label: 'Build day', detail: 'Focused making with mentors circulating between tables.' },
        { time: 'Sun 11:00 AM', label: 'Demo clinic', detail: 'Sharpen your story and prepare the final walkthrough.' },
        { time: 'Sun 3:00 PM', label: 'Final demos', detail: 'Share what you made with the club and judging panel.' }
      ]),
      attendance: 'Open to all students. Teams of 2–5; meals and materials included.',
      visual: 'rocket',
      featured: 0,
      initial_attendees: 86
    },
    {
      name: 'Open Source Saturday',
      slug: 'open-source-saturday',
      tagline: 'Find your corner of the internet and leave it better.',
      category: 'Community',
      date: 'November 1, 2026',
      time: '11:00 AM – 2:00 PM',
      venue: 'Git Club Lab',
      description: 'A guided contribution session with good first issues, friendly maintainers, and plenty of room for questions.',
      full_description: 'We will demystify the open-source contribution loop, from finding a project that fits to writing a useful issue comment and opening a thoughtful pull request. Bring a laptop or just bring questions.',
      image: '',
      capacity: 60,
      organizer: 'Git Club',
      is_past: 0,
      learn: JSON.stringify(['Finding a good first issue', 'Reading a new codebase', 'Writing contribution context', 'Opening a thoughtful pull request']),
      schedule: JSON.stringify([
        { time: '11:00 AM', label: 'Project fair', detail: 'Browse friendly projects looking for contributors.' },
        { time: '11:30 AM', label: 'Contribution walkthrough', detail: 'Follow a real issue from discovery to pull request.' },
        { time: '12:15 PM', label: 'Contribution lab', detail: 'Pick an issue and get hands-on support.' },
        { time: '1:45 PM', label: 'Share-outs', detail: 'Swap progress, questions, and next steps.' }
      ]),
      attendance: 'Open to all students. GitHub account and laptop recommended.',
      visual: 'terminal',
      featured: 0,
      initial_attendees: 28
    },
    {
      name: 'Dev Connect',
      slug: 'dev-connect',
      tagline: 'Meet the people behind the projects.',
      category: 'Social',
      date: 'November 7, 2026',
      time: '4:00 PM – 6:00 PM',
      venue: 'Student Activity Center',
      description: 'A low-pressure evening for meeting collaborators, sharing what you are learning, and finding your next room.',
      full_description: 'No slides, no pitches, and no assumed background. Dev Connect is a warm social hour with conversation prompts, student project demos, and enough time to find someone you would like to build with.',
      image: '',
      capacity: 80,
      organizer: 'Git Club',
      is_past: 0,
      learn: JSON.stringify(['Who is in the room', 'What is happening this term', 'Where you might plug in']),
      schedule: JSON.stringify([
        { time: '4:00 PM', label: 'Open doors', detail: 'Grab a name tag and find your first conversation.' },
        { time: '4:30 PM', label: 'Lightning demos', detail: 'See what students are making across campus.' },
        { time: '5:00 PM', label: 'Table rounds', detail: 'Swap stories, tools, and project ideas.' },
        { time: '5:45 PM', label: 'Open mingle', detail: 'Stay for the conversation or make a plan to meet again.' }
      ]),
      attendance: 'Everyone is welcome, including people who have never attended a Git Club event.',
      visual: 'social',
      featured: 0,
      initial_attendees: 43
    },
    {
      name: 'WebSprint',
      slug: 'websprint',
      tagline: 'A friendly race from blank canvas to working web page.',
      category: 'Competition',
      date: 'November 14, 2026',
      time: '10:00 AM – 1:00 PM',
      venue: 'Computer Lab 1',
      description: 'A fast-paced frontend competition where thoughtful ideas and working details matter more than flashy jargon.',
      full_description: 'WebSprint is a timed build challenge for students who want to practice turning a prompt into a clear, responsive interface. Bring your favorite tools, borrow a teammate, and leave with a small project you can keep iterating on.',
      image: '',
      capacity: 60,
      organizer: 'Git Club',
      is_past: 0,
      learn: JSON.stringify(['Rapid UI planning', 'Responsive layout thinking', 'Frontend collaboration', 'Presenting a working prototype']),
      schedule: JSON.stringify([
        { time: '10:00 AM', label: 'Prompt drop', detail: 'Get the brief, choose your approach, and make a plan.' },
        { time: '10:30 AM', label: 'Build sprint', detail: 'Three focused hours with mentor check-ins.' },
        { time: '12:30 PM', label: 'Demo prep', detail: 'Polish the important details and prepare your walkthrough.' },
        { time: '1:00 PM', label: 'Showcase', detail: 'Share the work and celebrate the best solutions.' }
      ]),
      attendance: 'Open to all experience levels. Teams of one or two are welcome.',
      visual: 'sprint',
      featured: 0,
      initial_attendees: 36
    },
    {
      name: 'Open Source Week 2026',
      slug: 'open-source-week-2026',
      tagline: 'A week of small contributions with a campus-wide ripple.',
      category: 'Community',
      date: 'August 17–21, 2026',
      time: 'Multiple sessions',
      venue: 'Across campus',
      description: 'A week-long celebration of the people and projects that make open source feel accessible.',
      full_description: 'Students joined maintainers, campus teams, and one another for a week of contribution workshops, project tours, and small wins.',
      image: '',
      capacity: 150,
      organizer: 'Git Club',
      is_past: 1,
      learn: JSON.stringify(['Open-source pathways', 'Project collaboration', 'Community contribution']),
      schedule: JSON.stringify([
        { time: 'Week', label: 'A week of sessions', detail: 'Workshops and project rooms ran across campus.' }
      ]),
      attendance: '120+ students joined across the week.',
      visual: 'terminal',
      featured: 0,
      initial_attendees: 120
    },
    {
      name: 'GitFest 2026',
      slug: 'gitfest-2026',
      tagline: 'A full day of tools, talks, and people worth learning from.',
      category: 'Workshop',
      date: 'July 25, 2026',
      time: '10:00 AM – 4:00 PM',
      venue: 'Main Auditorium',
      description: 'Our third annual GitFest brought the wider developer community to campus for a day of practical learning.',
      full_description: 'From first commits to production workflows, GitFest made room for beginner questions, honest stories, and useful talks from people building in the real world.',
      image: '',
      capacity: 300,
      organizer: 'Git Club',
      is_past: 1,
      learn: JSON.stringify(['Developer workflows', 'Open-source stories', 'Practical collaboration']),
      schedule: JSON.stringify([
        { time: 'Day', label: 'Talks + workshops', detail: 'A full day of learning, making, and meeting the community.' }
      ]),
      attendance: 'Open to all students and community members.',
      visual: 'branch',
      featured: 0,
      initial_attendees: 240
    },
    {
      name: 'Code & Coffee',
      slug: 'code-and-coffee',
      tagline: 'Small fixes, strong coffee, better Mondays.',
      category: 'Social',
      date: 'June 13, 2026',
      time: '9:00 AM – 12:00 PM',
      venue: 'North Quad Café',
      description: 'A relaxed co-working morning for shipping the little thing you keep putting off.',
      full_description: 'Students brought bugs, READMEs, half-finished portfolios, and simple curiosity. The morning made space for focused work and low-pressure peer feedback.',
      image: '',
      capacity: 80,
      organizer: 'Git Club',
      is_past: 1,
      learn: JSON.stringify(['A focused work ritual', 'Peer feedback', 'A few new names on campus']),
      schedule: JSON.stringify([
        { time: 'Morning', label: 'Coffee + commits', detail: 'A few focused work sprints with a friendly room around you.' }
      ]),
      attendance: 'No laptop? No problem. Come for the conversation.',
      visual: 'social',
      featured: 0,
      initial_attendees: 78
    },
    {
      name: 'HackSprint 2025',
      slug: 'hacksprint-2025',
      tagline: 'A weekend of ideas that made it out of the notebook.',
      category: 'Hackathon',
      date: 'November 15–16, 2025',
      time: '9:00 AM onward',
      venue: 'Innovation Lab',
      description: 'A two-day student hackathon focused on useful prototypes, new teammates, and momentum over polish.',
      full_description: 'The first edition of HackSprint brought together students from across campus to prototype tools for everyday student life.',
      image: '',
      capacity: 200,
      organizer: 'Git Club',
      is_past: 1,
      learn: JSON.stringify(['Finding a real problem', 'Building a small MVP', 'Demo storytelling']),
      schedule: JSON.stringify([
        { time: 'Weekend', label: 'Build + demo', detail: 'Two days of focused making, mentoring, and sharing.' }
      ]),
      attendance: 'Teams of 2–5 students.',
      visual: 'rocket',
      featured: 0,
      initial_attendees: 180
    }
  ];

  const insertSql = `
    INSERT INTO events (
      name, slug, tagline, category, date, time, venue,
      description, full_description, image, capacity, organizer,
      is_past, learn, schedule, attendance, visual, featured, initial_attendees
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const stmt = db.prepare(insertSql);
  for (const ev of eventsData) {
    stmt.run(
      ev.name, ev.slug, ev.tagline, ev.category, ev.date, ev.time, ev.venue,
      ev.description, ev.full_description, ev.image, ev.capacity, ev.organizer,
      ev.is_past, ev.learn, ev.schedule, ev.attendance, ev.visual, ev.featured, ev.initial_attendees
    );
  }
  stmt.finalize((err) => {
    if (err) {
      console.error('Error finalizing seed statement:', err.message);
    } else {
      console.log('Successfully seeded 10 realistic Git Club events!');
    }
  });
}

module.exports = db;
