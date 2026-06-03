import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Tema = sequelize.define('Tema', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  descricao: { type: DataTypes.STRING(255), allowNull: true },
  icone: { type: DataTypes.STRING(10), allowNull: true, defaultValue: '📚' }
}, { tableName: 'temas', timestamps: true, underscored: true });

export default Tema;