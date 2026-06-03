export const isAuthenticated = (req, res, next) => {
  if (req.session.user) return next();
  req.flash('error', 'Você precisa estar logado para acessar esta página.');
  res.redirect('/login');
};

export default isAuthenticated;
EOF

cat > /home/claude/QM_FINAL/src/server.js << 'EOF'
import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 QuizMaster rodando em http://localhost:${PORT}`);
});