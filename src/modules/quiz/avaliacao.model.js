import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Avaliacao = sequelize.define('Avaliacao', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  quizId: { type: DataTypes.INTEGER, allowNull: false, field: 'quiz_id' },
  nota: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  comentario: { type: DataTypes.TEXT, allowNull: true }
}, { tableName: 'avaliacoes', timestamps: true, underscored: true });

export default Avaliacao;