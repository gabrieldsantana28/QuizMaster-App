import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Questao = sequelize.define('Questao', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  quizId: { type: DataTypes.INTEGER, allowNull: false, field: 'quiz_id' },
  enunciado: { type: DataTypes.TEXT, allowNull: false },
  opcaoA: { type: DataTypes.STRING(255), allowNull: false, field: 'opcao_a' },
  opcaoB: { type: DataTypes.STRING(255), allowNull: false, field: 'opcao_b' },
  opcaoC: { type: DataTypes.STRING(255), allowNull: true, field: 'opcao_c' },
  opcaoD: { type: DataTypes.STRING(255), allowNull: true, field: 'opcao_d' },
  respostaCorreta: { type: DataTypes.ENUM('a','b','c','d'), allowNull: false, field: 'resposta_correta' },
  ordem: { type: DataTypes.INTEGER, defaultValue: 1 }
}, { tableName: 'questoes', timestamps: true, underscored: true });

export default Questao;