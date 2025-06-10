const { pool } = require('../config/database');

// Validação de dados
const validarDisciplina = async (disciplina, id = null) => {
    const erros = [];
    
    // Validação do nome
    if (!disciplina.nome || disciplina.nome.trim().length < 3) {
        erros.push('Nome deve ter pelo menos 3 caracteres');
    }

    // Validação do código
    if (!disciplina.codigo) {
        erros.push('Código é obrigatório');
    } else {
        // Verifica se o código já existe
        const query = id 
            ? 'SELECT id FROM disciplinas WHERE codigo = $1 AND id != $2 AND status = true'
            : 'SELECT id FROM disciplinas WHERE codigo = $1 AND status = true';
        const params = id ? [disciplina.codigo, id] : [disciplina.codigo];
        const result = await pool.query(query, params);
        if (result.rows.length > 0) {
            erros.push('Código já cadastrado');
        }
    }

    // Validação do período
    if (!disciplina.periodo) {
        erros.push('Período é obrigatório');
    } else {
        // Remove o caractere "º" para validar o número
        const periodoNumero = disciplina.periodo.replace('º', '');
        if (!['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].includes(periodoNumero)) {
            erros.push('Período deve ser um número entre 1º e 10º');
        }
    }

    return erros;
};

// Listar disciplinas
const listarDisciplinas = async (req, res) => {
    try {
        const { pagina = 1, limite = 10, busca = '', status = true, orderBy = 'nome', orderDirection = 'asc' } = req.query;
        const offset = (pagina - 1) * limite;

        // Validação dos campos de ordenação
        const camposPermitidos = ['nome', 'periodo'];
        const direcoesPermitidas = ['asc', 'desc'];
        
        const campoOrdenacao = camposPermitidos.includes(orderBy) ? orderBy : 'nome';
        const direcaoOrdenacao = direcoesPermitidas.includes(orderDirection.toLowerCase()) ? orderDirection : 'asc';

        let query = `
            SELECT * FROM disciplinas 
            WHERE status = $1
        `;
        const params = [status];

        if (busca) {
            query += ` AND (
                nome ILIKE $2 OR 
                codigo ILIKE $2 OR 
                periodo ILIKE $2
            )`;
            params.push(`%${busca}%`);
        }

        // Adiciona ordenação
        query += ` ORDER BY ${campoOrdenacao} ${direcaoOrdenacao}`;
        
        // Adiciona paginação
        query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limite, offset);

        const result = await pool.query(query, params);
        
        // Conta total de registros para paginação
        const countQuery = `
            SELECT COUNT(*) FROM disciplinas 
            WHERE status = $1
            ${busca ? `AND (
                nome ILIKE $2 OR 
                codigo ILIKE $2 OR 
                periodo ILIKE $2
            )` : ''}
        `;
        const countResult = await pool.query(countQuery, busca ? [status, `%${busca}%`] : [status]);
        const total = parseInt(countResult.rows[0].count);

        res.json({
            disciplinas: result.rows,
            paginacao: {
                total,
                pagina: parseInt(pagina),
                limite: parseInt(limite),
                totalPaginas: Math.ceil(total / limite)
            }
        });
    } catch (error) {
        console.error('Erro ao listar disciplinas:', error);
        res.status(500).json({ mensagem: 'Erro ao listar disciplinas', erro: error.message });
    }
};

// Criar nova disciplina
const criarDisciplina = async (req, res) => {
    try {
        const { nome, codigo, periodo } = req.body;
        
        const erros = await validarDisciplina({ nome, codigo, periodo });
        if (erros.length > 0) {
            return res.status(400).json({ mensagem: 'Dados inválidos', erros });
        }

        const result = await pool.query(
            'INSERT INTO disciplinas (nome, codigo, periodo, status) VALUES ($1, $2, $3, true) RETURNING *',
            [nome.trim(), codigo.trim(), periodo.trim()]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar disciplina:', error);
        res.status(500).json({ mensagem: 'Erro ao criar disciplina', erro: error.message });
    }
};

// Buscar disciplina por ID
const buscarDisciplinaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM disciplinas WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Disciplina não encontrada' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao buscar disciplina:', error);
        res.status(500).json({ mensagem: 'Erro ao buscar disciplina', erro: error.message });
    }
};

// Atualizar disciplina
const atualizarDisciplina = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, codigo, periodo } = req.body;
        
        console.log('Dados recebidos para atualização:', { id, nome, codigo, periodo });
        
        // Se estiver apenas ativando/desativando
        if (Object.keys(req.body).length === 1 && 'status' in req.body) {
            const result = await pool.query(
                'UPDATE disciplinas SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
                [req.body.status, id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ mensagem: 'Disciplina não encontrada' });
            }
            
            return res.json(result.rows[0]);
        }
        
        // Se estiver atualizando outros campos
        const erros = await validarDisciplina({ nome, codigo, periodo }, id);
        if (erros.length > 0) {
            console.log('Erros de validação:', erros);
            return res.status(400).json({ mensagem: 'Dados inválidos', erros });
        }

        const query = `
            UPDATE disciplinas 
            SET nome = $1, 
                codigo = $2, 
                periodo = $3, 
                updated_at = CURRENT_TIMESTAMP 
            WHERE id = $4 
            RETURNING *
        `;
        
        const params = [
            nome.trim(), 
            codigo.trim(), 
            periodo.trim(), 
            id
        ];
        
        console.log('Query:', query);
        console.log('Parâmetros:', params);
        
        const result = await pool.query(query, params);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Disciplina não encontrada' });
        }
        
        console.log('Disciplina atualizada:', result.rows[0]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar disciplina:', error);
        res.status(500).json({ mensagem: 'Erro ao atualizar disciplina', erro: error.message });
    }
};

// Excluir disciplina (soft delete)
const excluirDisciplina = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'UPDATE disciplinas SET status = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Disciplina não encontrada' });
        }
        
        res.json({ mensagem: 'Disciplina excluída com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir disciplina:', error);
        res.status(500).json({ mensagem: 'Erro ao excluir disciplina', erro: error.message });
    }
};

module.exports = {
    listarDisciplinas,
    criarDisciplina,
    buscarDisciplinaPorId,
    atualizarDisciplina,
    excluirDisciplina
}; 