const { Pool } = require('pg');

// Verifica se está rodando no Docker ou localmente
const isDocker = process.env.NODE_ENV === 'production';

const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    host: isDocker ? 'postgres' : 'localhost', // Usa 'postgres' no Docker e 'localhost' localmente
    database: process.env.POSTGRES_DB || 'edusoft',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    port: process.env.POSTGRES_PORT || 5432,
    connectionTimeoutMillis: 10000, // 10 segundos
    idleTimeoutMillis: 30000, // 30 segundos
    max: 20, // máximo de conexões
    maxUses: 7500, // número máximo de vezes que uma conexão pode ser reutilizada
});

// Evento de erro na conexão
pool.on('error', (err) => {
    console.error('Erro inesperado no pool de conexões:', err);
});

// Evento de conexão
pool.on('connect', () => {
    console.log('Conectado ao banco de dados PostgreSQL');
});

// Evento de remoção de cliente
pool.on('remove', (client) => {
    console.log('Cliente removido do pool');
});

// Função para testar a conexão
const testarConexao = async () => {
    try {
        const client = await pool.connect();
        console.log('Conectado ao banco de dados PostgreSQL');
        client.release();
    } catch (error) {
        console.error('Erro ao conectar com o banco de dados:', error);
        throw error;
    }
};

// Testar conexão ao iniciar
testarConexao();

module.exports = {
    pool,
    testarConexao
}; 