const { pool } = require('../config/database');

// Listar todas as salas
const listarSalas = async (req, res) => {
    try {
        const { pagina = 1, limite = 10, busca = '', status = true, orderBy = 'nome', orderDirection = 'asc' } = req.query;
        const offset = (pagina - 1) * limite;

        let query = 'SELECT * FROM salas WHERE status = $1';
        const params = [status];

        if (busca) {
            query += ' AND (nome ILIKE $2 OR local ILIKE $2)';
            params.push(`%${busca}%`);
        }

        // Adiciona ordenação
        query += ` ORDER BY ${orderBy} ${orderDirection}`;
        
        // Adiciona paginação
        query += ' LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
        params.push(limite, offset);

        const result = await pool.query(query, params);
        const totalResult = await pool.query('SELECT COUNT(*) FROM salas WHERE status = $1', [status]);

        res.json({
            salas: result.rows,
            paginacao: {
                total: parseInt(totalResult.rows[0].count),
                totalPaginas: Math.ceil(totalResult.rows[0].count / limite),
                paginaAtual: parseInt(pagina)
            }
        });
    } catch (error) {
        console.error('Erro ao listar salas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// Buscar sala por ID
const buscarSalaPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM salas WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Sala não encontrada' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao buscar sala:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// Criar nova sala
const criarSala = async (req, res) => {
    const { nome, local, capacidade, status = true } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO salas (nome, local, capacidade, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [nome, local, capacidade, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar sala:', error);
        if (error.code === '23505') { // Código de erro para violação de unicidade
            res.status(400).json({ error: 'Nome da sala já cadastrado' });
        } else {
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
};

// Atualizar sala
const atualizarSala = async (req, res) => {
    const { id } = req.params;
    
    try {
        console.log('Dados recebidos para atualização:', { id, body: req.body });
        
        // Se estiver apenas ativando/desativando
        if (Object.keys(req.body).length === 1 && 'status' in req.body) {
            console.log('Atualizando apenas status para:', req.body.status);
            const result = await pool.query(
                'UPDATE salas SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
                [req.body.status, id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ mensagem: 'Sala não encontrada' });
            }
            
            console.log('Status da sala atualizado com sucesso:', result.rows[0]);
            return res.json(result.rows[0]);
        }
        
        // Se estiver atualizando outros campos
        const { nome, local, capacidade } = req.body;
        
        // Buscar o status atual da sala para preservá-lo
        const statusAtual = await pool.query('SELECT status FROM salas WHERE id = $1', [id]);
        if (statusAtual.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Sala não encontrada' });
        }
        
        const result = await pool.query(
            'UPDATE salas SET nome = $1, local = $2, capacidade = $3, status = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
            [nome, local, parseInt(capacidade), statusAtual.rows[0].status, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Sala não encontrada' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar sala:', error);
        if (error.code === '23505') {
            res.status(400).json({ mensagem: 'Nome da sala já cadastrado' });
        } else {
            res.status(500).json({ mensagem: 'Erro interno do servidor', erro: error.message });
        }
    }
};

// Deletar sala (soft delete)
const deletarSala = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'UPDATE salas SET status = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Sala não encontrada' });
        }
        res.json({ mensagem: 'Sala excluída com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir sala:', error);
        res.status(500).json({ mensagem: 'Erro interno do servidor', erro: error.message });
    }
};

module.exports = {
    listarSalas,
    buscarSalaPorId,
    criarSala,
    atualizarSala,
    deletarSala
}; 