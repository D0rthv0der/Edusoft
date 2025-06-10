const { pool } = require('../config/database');

// Listar todos os professores
const listarProfessores = async (req, res) => {
    try {
        const { pagina = 1, limite = 10, busca = '', status = true, orderBy = 'nome', orderDirection = 'asc' } = req.query;
        const offset = (pagina - 1) * limite;

        let query = 'SELECT * FROM professores WHERE status = $1';
        const params = [status];

        if (busca) {
            query += ' AND (nome ILIKE $2 OR cpf ILIKE $2 OR email ILIKE $2)';
            params.push(`%${busca}%`);
        }

        // Adiciona ordenação
        query += ` ORDER BY ${orderBy} ${orderDirection}`;
        
        // Adiciona paginação
        query += ' LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
        params.push(limite, offset);

        const result = await pool.query(query, params);
        const totalResult = await pool.query('SELECT COUNT(*) FROM professores WHERE status = $1', [status]);

        res.json({
            professores: result.rows,
            paginacao: {
                total: parseInt(totalResult.rows[0].count),
                totalPaginas: Math.ceil(totalResult.rows[0].count / limite),
                paginaAtual: parseInt(pagina)
            }
        });
    } catch (error) {
        console.error('Erro ao listar professores:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// Buscar professor por ID
const buscarProfessorPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM professores WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Professor não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao buscar professor:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// Criar novo professor
const criarProfessor = async (req, res) => {
    const { nome, cpf, titulacao, email, telefone, status = true } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO professores (nome, cpf, titulacao, email, telefone, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [nome, cpf, titulacao, email, telefone, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar professor:', error);
        if (error.code === '23505') { // Código de erro para violação de unicidade
            res.status(400).json({ error: 'CPF ou email já cadastrado' });
        } else {
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
};

// Atualizar professor
const atualizarProfessor = async (req, res) => {
    const { id } = req.params;
    
    try {
        console.log('Dados recebidos para atualização:', { id, body: req.body });
        
        // Se estiver apenas ativando/desativando
        if (Object.keys(req.body).length === 1 && 'status' in req.body) {
            console.log('Atualizando apenas status para:', req.body.status);
            const result = await pool.query(
                'UPDATE professores SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
                [req.body.status, id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ mensagem: 'Professor não encontrado' });
            }
            
            console.log('Status atualizado com sucesso:', result.rows[0]);
            return res.json(result.rows[0]);
        }
        
        // Se estiver atualizando outros campos
        const { nome, cpf, titulacao, email, telefone } = req.body;
        
        // Buscar o status atual do professor para preservá-lo
        const statusAtual = await pool.query('SELECT status FROM professores WHERE id = $1', [id]);
        if (statusAtual.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Professor não encontrado' });
        }
        
        const result = await pool.query(
            'UPDATE professores SET nome = $1, cpf = $2, titulacao = $3, email = $4, telefone = $5, status = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
            [nome, cpf, titulacao, email, telefone, statusAtual.rows[0].status, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Professor não encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar professor:', error);
        if (error.code === '23505') {
            res.status(400).json({ mensagem: 'CPF ou email já cadastrado' });
        } else {
            res.status(500).json({ mensagem: 'Erro interno do servidor', erro: error.message });
        }
    }
};

// Deletar professor (soft delete)
const deletarProfessor = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'UPDATE professores SET status = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Professor não encontrado' });
        }
        res.json({ mensagem: 'Professor excluído com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir professor:', error);
        res.status(500).json({ mensagem: 'Erro interno do servidor', erro: error.message });
    }
};

module.exports = {
    listarProfessores,
    buscarProfessorPorId,
    criarProfessor,
    atualizarProfessor,
    deletarProfessor
}; 