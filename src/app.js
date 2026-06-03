import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import session from 'express-session';
import flash from 'connect-flash';
import expressLayouts from 'express-ejs-layouts';

import userRoutes from './modules/user/user.routes.js';
import quizRoutes from './modules/quiz/quiz.routes.js';
import favoritoRoutes from './modules/favorito/favorito.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

const app = express();

// Views
app.set('views', path.join(process.cwd(), 'src/views/pages'));
app.set('layout', path.join(process.cwd(), 'src/views/layouts/main'));
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), 'src/public')));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'quizmaster-secret-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// Flash
app.use(flash());

// Locals globais para todas as views
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  res.locals.user = req.session.user || null;
  res.locals.title = 'QuizMaster';
  next();
});

// Rotas
app.use(userRoutes);
app.use(quizRoutes);
app.use(favoritoRoutes);
app.use(adminRoutes);

// Home — redireciona se logado
app.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/feed');
  res.render('index', { title: 'QuizMaster — Plataforma de Quizzes' });
});

// 404
app.use((req, res) => {
  res.status(404).render('error');
});

export default app;