const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const { configurePassport } = require('./auth/passportConfig');
const { connectToDatabase } = require('./db/mongoClient');
const authRoutes = require('./routes/authRoutes');
const skillsRoutes = require('./routes/skillsRoutes');
const swapRequestsRoutes = require('./routes/swapRequestsRoutes');
const sessionsRoutes = require('./routes/sessionsRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const port = process.env.PORT || 3000;

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

configurePassport();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'development-secret-change-before-deployment',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/requests', swapRequestsRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/stats', statsRoutes);

const clientBuildPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientBuildPath));

app.get('*', (request, response) => {
  if (request.path.startsWith('/api')) {
    return response.status(404).json({ message: 'API route not found.' });
  }

  return response.sendFile(path.join(clientBuildPath, 'index.html'));
});

connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`SkillSwap Hub server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Could not connect to MongoDB.', error);
    process.exit(1);
  });
