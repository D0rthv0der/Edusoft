const { pool } = require('../config/database');

// Função para validar os dados da turma
const validarTurma = async (turma) => {
    const erros = [];
    
    if (!turma.nome || turma.nome.trim() === '') {
        erros.push('Nome da turma é obrigatório');
    }
    
    if (!turma.disciplina_id) {
        erros.push('Disciplina é obrigatória');
    }
    
    if (!turma.professor_id) {
        erros.push('Professor é obrigatório');
    }
    
    if (!turma.sala_id) {
        erros.push('Sala é obrigatória');
    }
    
    if (!turma.dia_semana) {
        erros.push('Dia da semana é obrigatório');
    } else if (!['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].includes(turma.dia_semana)) {
        erros.push('Dia da semana inválido');
    }
    
    if (!turma.horario_inicio || !turma.horario_termino) {
        erros.push('Horário de início e término são obrigatórios');
    }
    
    if (turma.horario_inicio && turma.horario_termino) {
        const inicio = new Date(`2000-01-01T${turma.horario_inicio}`);
        const fim = new Date(`2000-01-01T${turma.horario_termino}`);
        
        if (inicio >= fim) {
            erros.push('Horário de início deve ser anterior ao horário de término');
        }
    }
    
    // Verificar se a disciplina existe e está ativa
    if (turma.disciplina_id) {
        const disciplina = await pool.query(
            'SELECT * FROM disciplinas WHERE id = $1 AND status = true',
            [turma.disciplina_id]
        );
        
        if (disciplina.rows.length === 0) {
            erros.push('Disciplina não encontrada ou inativa');
        }
    }
    
    // Verificar se o professor existe e está ativo
    if (turma.professor_id) {
        const professor = await pool.query(
            'SELECT * FROM professores WHERE id = $1 AND status = true',
            [turma.professor_id]
        );
        
        if (professor.rows.length === 0) {
            erros.push('Professor não encontrado ou inativo');
        }
    }

    // Verificar se a sala existe e está ativa
    if (turma.sala_id) {
        const sala = await pool.query(
            'SELECT * FROM salas WHERE id = $1 AND status = true',
            [turma.sala_id]
        );
        
        if (sala.rows.length === 0) {
            erros.push('Sala não encontrada ou inativa');
        }
    }
    
    return erros;
};

// Verificar conflitos de horário
const verificarConflitosHorario = async (turma) => {
    const { sala_id, professor_id, dia_semana, horario_inicio, horario_termino, id } = turma;
    
    // Verificar conflitos de sala
    const conflitosSala = await pool.query(
        `SELECT * FROM turmas 
         WHERE sala_id = $1 
         AND dia_semana = $2
         AND status = true 
         AND id != $3
         AND (
             (horario_inicio <= $4 AND horario_termino > $4)
             OR (horario_inicio < $5 AND horario_termino >= $5)
             OR (horario_inicio >= $4 AND horario_termino <= $5)
         )`,
        [sala_id, dia_semana, id || 0, horario_inicio, horario_termino]
    );
    
    if (conflitosSala.rows.length > 0) {
        return 'A sala já está ocupada neste horário';
    }
    
    // Verificar conflitos de professor
    const conflitosProfessor = await pool.query(
        `SELECT * FROM turmas 
         WHERE professor_id = $1 
         AND dia_semana = $2
         AND status = true 
         AND id != $3
         AND (
             (horario_inicio <= $4 AND horario_termino > $4)
             OR (horario_inicio < $5 AND horario_termino >= $5)
             OR (horario_inicio >= $4 AND horario_termino <= $5)
         )`,
        [professor_id, dia_semana, id || 0, horario_inicio, horario_termino]
    );
    
    if (conflitosProfessor.rows.length > 0) {
        return 'O professor já tem aula neste horário';
    }
    
    return null;
};

// Listar turmas
const listarTurmas = async (req, res) => {
    try {
        const { pagina = 1, limite = 10, busca = '', status = true, orderBy = 'nome', orderDirection = 'asc' } = req.query;
        const offset = (pagina - 1) * limite;

        // Validação dos campos de ordenação
        const camposPermitidos = ['nome', 'ano', 'semestre'];
        const direcoesPermitidas = ['asc', 'desc'];
        
        const campoOrdenacao = camposPermitidos.includes(orderBy) ? orderBy : 'nome';
        const direcaoOrdenacao = direcoesPermitidas.includes(orderDirection.toLowerCase()) ? orderDirection : 'asc';

        let query = `
            SELECT * FROM turmas 
            WHERE status = $1
        `;
        const params = [status];

        if (busca) {
            query += ` AND (
                nome ILIKE $2 OR 
                CAST(ano AS TEXT) ILIKE $2 OR 
                CAST(semestre AS TEXT) ILIKE $2
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
            SELECT COUNT(*) FROM turmas 
            WHERE status = $1
            ${busca ? `AND (
                nome ILIKE $2 OR 
                CAST(ano AS TEXT) ILIKE $2 OR 
                CAST(semestre AS TEXT) ILIKE $2
            )` : ''}
        `;
        const countResult = await pool.query(countQuery, busca ? [status, `%${busca}%`] : [status]);
        const total = parseInt(countResult.rows[0].count);

        res.json({
            turmas: result.rows,
            paginacao: {
                total,
                pagina: parseInt(pagina),
                limite: parseInt(limite),
                totalPaginas: Math.ceil(total / limite)
            }
        });
    } catch (error) {
        console.error('Erro ao listar turmas:', error);
        res.status(500).json({ mensagem: 'Erro ao listar turmas', erro: error.message });
    }
};

// Buscar turma por ID
const buscarTurmaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT t.*, 
                    d.nome as disciplina_nome,
                    p.nome as professor_nome,
                    s.nome as sala_nome
             FROM turmas t
             LEFT JOIN disciplinas d ON t.disciplina_id = d.id
             LEFT JOIN professores p ON t.professor_id = p.id
             LEFT JOIN salas s ON t.sala_id = s.id
             WHERE t.id = $1`,
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Turma não encontrada' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao buscar turma:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// Criar nova turma
const criarTurma = async (req, res) => {
    try {
        const { nome, disciplina_id, professor_id, sala_id, dia_semana, horario_inicio, horario_termino, status = true } = req.body;
        
        // Validar dados
        const erros = await validarTurma({ nome, disciplina_id, professor_id, sala_id, dia_semana, horario_inicio, horario_termino });
        if (erros.length > 0) {
            return res.status(400).json({ mensagem: 'Dados inválidos', erros });
        }
        
        // Verificar conflitos de horário
        const conflito = await verificarConflitosHorario({ sala_id, professor_id, dia_semana, horario_inicio, horario_termino });
        if (conflito) {
            return res.status(400).json({ mensagem: 'Conflito de horário', erro: conflito });
        }
        
        // Inserir turma
        const result = await pool.query(
            `INSERT INTO turmas (nome, disciplina_id, professor_id, sala_id, dia_semana, horario_inicio, horario_termino, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [nome.trim(), disciplina_id, professor_id, sala_id, dia_semana, horario_inicio, horario_termino, status]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar turma:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// Atualizar turma
const atualizarTurma = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('Dados recebidos para atualização:', { id, body: req.body });
        
        // Se estiver apenas ativando/desativando
        if (Object.keys(req.body).length === 1 && 'status' in req.body) {
            console.log('Atualizando apenas status para:', req.body.status);
            const result = await pool.query(
                'UPDATE turmas SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
                [req.body.status, id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ mensagem: 'Turma não encontrada' });
            }
            
            console.log('Status da turma atualizado com sucesso:', result.rows[0]);
            return res.json(result.rows[0]);
        }
        
        // Se estiver atualizando outros campos
        const { nome, disciplina_id, professor_id, sala_id, dia_semana, horario_inicio, horario_termino } = req.body;
        
        // Validar dados
        const erros = await validarTurma({ nome, disciplina_id, professor_id, sala_id, dia_semana, horario_inicio, horario_termino }, id);
        if (erros.length > 0) {
            console.log('Erros de validação:', erros);
            return res.status(400).json({ mensagem: 'Dados inválidos', erros });
        }

        // Verificar conflitos de horário (excluindo a própria turma)
        const conflito = await verificarConflitosHorario({ sala_id, professor_id, dia_semana, horario_inicio, horario_termino, id });
        if (conflito) {
            return res.status(400).json({ mensagem: 'Conflito de horário', erro: conflito });
        }

        // Buscar o status atual da turma para preservá-lo
        const statusAtual = await pool.query('SELECT status FROM turmas WHERE id = $1', [id]);
        if (statusAtual.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Turma não encontrada' });
        }

        const query = `
            UPDATE turmas 
            SET nome = $1, 
                disciplina_id = $2, 
                professor_id = $3, 
                sala_id = $4, 
                dia_semana = $5, 
                horario_inicio = $6, 
                horario_termino = $7, 
                status = $8,
                updated_at = CURRENT_TIMESTAMP 
            WHERE id = $9 
            RETURNING *
        `;
        
        const params = [
            nome.trim(), 
            disciplina_id, 
            professor_id, 
            sala_id,
            dia_semana,
            horario_inicio,
            horario_termino,
            statusAtual.rows[0].status, // Preserva o status atual
            id
        ];
        
        console.log('Query:', query);
        console.log('Parâmetros:', params);
        
        const result = await pool.query(query, params);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Turma não encontrada' });
        }
        
        console.log('Turma atualizada:', result.rows[0]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar turma:', error);
        res.status(500).json({ mensagem: 'Erro ao atualizar turma', erro: error.message });
    }
};

// Excluir turma (soft delete)
const excluirTurma = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'UPDATE turmas SET status = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Turma não encontrada' });
        }
        
        res.json({ mensagem: 'Turma excluída com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir turma:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// Adicionar aluno à turma (com validação de capacidade)
const adicionarAlunoTurma = async (req, res) => {
    try {
        const { turmaId } = req.params;
        const { alunoId } = req.body;
        
        // Verificar se a turma existe
        const turma = await pool.query('SELECT * FROM turmas WHERE id = $1 AND status = true', [turmaId]);
        if (turma.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Turma não encontrada' });
        }
        
        // Verificar se o aluno existe e está ativo
        const aluno = await pool.query('SELECT * FROM alunos WHERE id = $1 AND status = true', [alunoId]);
        if (aluno.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Aluno não encontrado ou inativo' });
        }
        
        // Verificar se o aluno já está na turma
        const alunoJaNaTurma = await pool.query(
            'SELECT * FROM turma_alunos WHERE turma_id = $1 AND aluno_id = $2',
            [turmaId, alunoId]
        );
        if (alunoJaNaTurma.rows.length > 0) {
            return res.status(400).json({ mensagem: 'Aluno já está matriculado nesta turma' });
        }
        
        // Buscar capacidade da sala
        const salaCapacidade = await pool.query(
            'SELECT s.capacidade FROM salas s JOIN turmas t ON s.id = t.sala_id WHERE t.id = $1',
            [turmaId]
        );
        
        if (salaCapacidade.rows.length === 0) {
            return res.status(400).json({ mensagem: 'Sala da turma não encontrada' });
        }
        
        const capacidade = salaCapacidade.rows[0].capacidade;
        
        // Contar quantos alunos já estão na turma
        const alunosNaTurma = await pool.query(
            'SELECT COUNT(*) FROM turma_alunos WHERE turma_id = $1',
            [turmaId]
        );
        
        const quantidadeAtual = parseInt(alunosNaTurma.rows[0].count);
        
        // Verificar se ainda há vaga
        if (quantidadeAtual >= capacidade) {
            return res.status(400).json({ 
                mensagem: `Turma lotada. Capacidade máxima: ${capacidade} alunos` 
            });
        }
        
        // Adicionar aluno à turma
        await pool.query(
            'INSERT INTO turma_alunos (turma_id, aluno_id) VALUES ($1, $2)',
            [turmaId, alunoId]
        );
        
        res.status(201).json({ 
            mensagem: 'Aluno adicionado à turma com sucesso',
            vagas: {
                ocupadas: quantidadeAtual + 1,
                total: capacidade,
                disponiveis: capacidade - (quantidadeAtual + 1)
            }
        });
    } catch (error) {
        console.error('Erro ao adicionar aluno à turma:', error);
        res.status(500).json({ mensagem: 'Erro interno do servidor', erro: error.message });
    }
};

// Remover aluno da turma
const removerAlunoTurma = async (req, res) => {
    try {
        const { turmaId, alunoId } = req.params;
        
        const result = await pool.query(
            'DELETE FROM turma_alunos WHERE turma_id = $1 AND aluno_id = $2',
            [turmaId, alunoId]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({ mensagem: 'Aluno não está matriculado nesta turma' });
        }
        
        res.json({ mensagem: 'Aluno removido da turma com sucesso' });
    } catch (error) {
        console.error('Erro ao remover aluno da turma:', error);
        res.status(500).json({ mensagem: 'Erro interno do servidor', erro: error.message });
    }
};

// Listar alunos de uma turma
const listarAlunosTurma = async (req, res) => {
    try {
        const { turmaId } = req.params;
        
        const result = await pool.query(`
            SELECT a.id, a.nome, a.matricula, ta.created_at as data_matricula
            FROM alunos a
            JOIN turma_alunos ta ON a.id = ta.aluno_id
            WHERE ta.turma_id = $1 AND a.status = true
            ORDER BY a.nome
        `, [turmaId]);
        
        // Buscar informações da turma e capacidade
        const turmaInfo = await pool.query(`
            SELECT t.nome as turma_nome, s.capacidade, s.nome as sala_nome
            FROM turmas t
            JOIN salas s ON t.sala_id = s.id
            WHERE t.id = $1
        `, [turmaId]);
        
        const capacidade = turmaInfo.rows[0]?.capacidade || 0;
        const quantidadeAlunos = result.rows.length;
        
        res.json({
            alunos: result.rows,
            turma: turmaInfo.rows[0],
            vagas: {
                ocupadas: quantidadeAlunos,
                total: capacidade,
                disponiveis: capacidade - quantidadeAlunos
            }
        });
    } catch (error) {
        console.error('Erro ao listar alunos da turma:', error);
        res.status(500).json({ mensagem: 'Erro interno do servidor', erro: error.message });
    }
};

// Listar alunos disponíveis para adicionar à turma
const listarAlunosDisponiveis = async (req, res) => {
    try {
        const { turmaId } = req.params;
        
        const result = await pool.query(`
            SELECT a.id, a.nome, a.matricula
            FROM alunos a
            WHERE a.status = true
            AND a.id NOT IN (
                SELECT aluno_id FROM turma_alunos WHERE turma_id = $1
            )
            ORDER BY a.nome
        `, [turmaId]);
        
        res.json({ alunos: result.rows });
    } catch (error) {
        console.error('Erro ao listar alunos disponíveis:', error);
        res.status(500).json({ mensagem: 'Erro interno do servidor', erro: error.message });
    }
};

module.exports = {
    listarTurmas,
    criarTurma,
    buscarTurmaPorId,
    atualizarTurma,
    excluirTurma,
    adicionarAlunoTurma,
    removerAlunoTurma,
    listarAlunosTurma,
    listarAlunosDisponiveis
}; 