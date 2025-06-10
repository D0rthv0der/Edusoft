const { pool } = require('../config/database');

const criarTabelas = async () => {
  try {
    // Dropar as tabelas na ordem correta (por causa das dependências)
    await pool.query('DROP TABLE IF EXISTS turma_alunos CASCADE');
    await pool.query('DROP TABLE IF EXISTS turmas CASCADE');
    await pool.query('DROP TABLE IF EXISTS disciplinas CASCADE');
    await pool.query('DROP TABLE IF EXISTS professores CASCADE');
    await pool.query('DROP TABLE IF EXISTS salas CASCADE');
    await pool.query('DROP TABLE IF EXISTS alunos CASCADE');

    // Criar tabela de alunos
    await pool.query(`
      CREATE TABLE alunos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        matricula VARCHAR(20) NOT NULL UNIQUE,
        status BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de disciplinas
    await pool.query(`
      CREATE TABLE disciplinas (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        codigo VARCHAR(20) UNIQUE NOT NULL,
        periodo VARCHAR(10) NOT NULL,
        status BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de professores
    await pool.query(`
      CREATE TABLE professores (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        cpf VARCHAR(14) UNIQUE NOT NULL,
        titulacao VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        telefone VARCHAR(20),
        status BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de salas
    await pool.query(`
      CREATE TABLE salas (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(50) NOT NULL UNIQUE,
        local VARCHAR(100) NOT NULL,
        capacidade INTEGER NOT NULL,
        status BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de turmas
    await pool.query(`
      CREATE TABLE turmas (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        disciplina_id INTEGER REFERENCES disciplinas(id),
        professor_id INTEGER REFERENCES professores(id),
        sala_id INTEGER REFERENCES salas(id),
        dia_semana VARCHAR(20) NOT NULL,
        horario_inicio TIME NOT NULL,
        horario_termino TIME NOT NULL,
        status BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de relacionamento turma_alunos
    await pool.query(`
      CREATE TABLE turma_alunos (
        id SERIAL PRIMARY KEY,
        turma_id INTEGER REFERENCES turmas(id) ON DELETE CASCADE,
        aluno_id INTEGER REFERENCES alunos(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(turma_id, aluno_id)
      )
    `);

    console.log('Tabelas criadas com sucesso!');
  } catch (error) {
    console.error('Erro ao criar tabelas:', error);
    throw error;
  }
};

module.exports = {
  criarTabelas
}; 