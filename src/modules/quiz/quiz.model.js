import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Quiz = sequelize.define('Quiz', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  titulo: { type: DataTypes.STRING(150), allowNull: false },
  descricao: { type: DataTypes.TEXT, allowNull: true },
  temaId: { type: DataTypes.INTEGER, allowNull: false, field: 'tema_id' },
  autorId: { type: DataTypes.INTEGER, allowNull: false, field: 'autor_id' },
  dificuldade: { type: DataTypes.ENUM('facil','medio','dificil'), defaultValue: 'medio' },
  ativo: { type: DataTypes.BOOLEAN, defaultValue: true },
  totalParticipantes: { type: DataTypes.INTEGER, defaultValue: 0, field: 'total_participantes' }
}, { tableName: 'quizzes', timestamps: true, underscored: true });

export default Quiz;