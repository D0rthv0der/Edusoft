const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'edusoft',
    password: 'postgres',
    port: 5432,
});

async function testarConexao() {
    try {
        console.log('Tentando conectar ao banco de dados...');
        const client = await pool.connect();
        console.log('Conexão estabelecida com sucesso!');
        
        // Testar uma query simples
        const result = await client.query('SELECT NOW()');
        console.log('Data/hora do banco:', result.rows[0].now);
        
        client.release();
    } catch (error) {
        console.error('Erro ao conectar:', error);
    } finally {
        await pool.end();
    }
}

testarConexao(); 