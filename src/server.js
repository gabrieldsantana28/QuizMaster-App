import 'dotenv/config';
import app from './app.js';

// Import sequelize and models so tables are registered
import sequelize from './config/database.js';
import './modules/user/user.model.js';

const PORT = process.env.PORT || 3000;

// In development, ensure DB tables are created automatically (non-destructive)
if (process.env.NODE_ENV !== 'production') {
  sequelize.sync()
    .then(() => {
      console.log('Database synchronized (tables created if not present).');
      app.listen(PORT, () => {
        console.log(`🚀 QuizMaster rodando em http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to sync database:', err);
      process.exit(1);
    });
} else {
  app.listen(PORT, () => {
    console.log(`🚀 QuizMaster rodando em http://localhost:${PORT}`);
  });
}