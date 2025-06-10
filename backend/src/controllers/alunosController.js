const { pool } = require('../config/database');

// Listar todos os alunos
const listarAlunos = async (req, res) => {
    try {
        const { pagina = 1, limite = 10, busca = '', status = true } = req.query;
        const offset = (pagina - 1) * limite;

        let query = 'SELECT * FROM alunos WHERE status = $1';
        const params = [status];

        if (busca) {
            query += ' AND (nome ILIKE $2 OR matricula ILIKE $2)';
            params.push(`%${busca}%`);
        }

        query += ' ORDER BY nome LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
        params.push(limite, offset);

        const result = await pool.query(query, params);
        const totalResult = await pool.query('SELECT COUNT(*) FROM alunos WHERE status = $1', [status]);

        res.json({
            alunos: result.rows,
            paginacao: {
                total: parseInt(totalResult.rows[0].count),
                totalPaginas: Math.ceil(totalResult.rows[0].count / limite),
                paginaAtual: parseInt(pagina)
            }
        });
    } catch (error) {
        console.error('Erro ao listar alunos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// Buscar aluno por ID
const buscarAlunoPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM alunos WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Aluno não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao buscar aluno:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// Criar novo aluno
const criarAluno = async (req, res) => {
    const { nome, matricula, status = true } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO alunos (nome, matricula, status) VALUES ($1, $2, $3) RETURNING *',
            [nome, matricula, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar aluno:', error);
        if (error.code === '23505') { // Código de erro para violação de unicidade
            res.status(400).json({ error: 'Matrícula já cadastrada' });
        } else {
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
};

// Atualizar aluno
const atualizarAluno = async (req, res) => {
    const { id } = req.params;
    const { nome, matricula, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE alunos SET nome = $1, matricula = $2, status = $3 WHERE id = $4 RETURNING *',
            [nome, matricula, status, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Aluno não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar aluno:', error);
        if (error.code === '23505') {
            res.status(400).json({ error: 'Matrícula já cadastrada' });
        } else {
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
};

// Deletar aluno (soft delete)
const deletarAluno = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'UPDATE alunos SET status = false WHERE id = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Aluno não encontrado' });
        }
        res.json({ message: 'Aluno removido com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar aluno:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

module.exports = {
    listarAlunos,
    buscarAlunoPorId,
    criarAluno,
    atualizarAluno,
    deletarAluno
}; 