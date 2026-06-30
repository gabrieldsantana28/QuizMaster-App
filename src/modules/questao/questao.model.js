import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Questao = sequelize.define('Questao', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  enunciado: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  alternativas: {
    type: DataTypes.TEXT, // JSON serializado
    allowNull: false,
  },
  alternativaCorreta: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  dica: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  quizId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  autorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'questoes',
  timestamps: true,
});

export default Questao;
