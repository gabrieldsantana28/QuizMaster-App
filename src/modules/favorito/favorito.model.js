import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Favorito = sequelize.define('Favorito', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  quizId: { type: DataTypes.INTEGER, allowNull: false, field: 'quiz_id' }
}, { tableName: 'favoritos', timestamps: true, underscored: true });

export default Favorito;