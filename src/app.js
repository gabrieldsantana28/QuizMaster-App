import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import session from 'express-session';
import flash from 'connect-flash';
import expressLayouts from 'express-ejs-layouts';

import userRoutes from './modules/user/user.routes.js';

const app = express();

const isTest = process.env.NODE_ENV === 'test';

// Views
app.set('views', path.join(process.cwd(), 'src/views/pages'));
app.set('layout', path.join(process.cwd(), 'src/views/layouts/main'));
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Middlewares base
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), 'src/public')));

// Sessão (compatível com teste)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'test-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

// Flash
app.use(flash());

// Locals globais
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  res.locals.user = req.session.user || null;
  res.locals.title = 'QuizMaster';
  next();
});

// ROTAS (ESSENCIAL)
app.use(userRoutes);

// Home
app.get('/', (req, res) => {
  res.render('index', { title: 'QuizMaster' });
});

// 404
app.use((req, res) => {
  res.status(404).render('error');
});

export default app;