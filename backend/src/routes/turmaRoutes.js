const express = require('express');
const router = express.Router();
const turmaController = require('../controllers/turmaController');

// Listar todas as turmas
router.get('/', turmaController.listarTurmas);

// Buscar turma por ID
router.get('/:id', turmaController.buscarTurmaPorId);

// Criar nova turma
router.post('/', turmaController.criarTurma);

// Atualizar turma
router.put('/:id', turmaController.atualizarTurma);

// Excluir turma (soft delete)
router.delete('/:id', turmaController.excluirTurma);

// Rotas para gerenciar alunos nas turmas
router.get('/:turmaId/alunos', turmaController.listarAlunosTurma);
router.get('/:turmaId/alunos-disponiveis', turmaController.listarAlunosDisponiveis);
router.post('/:turmaId/alunos', turmaController.adicionarAlunoTurma);
router.delete('/:turmaId/alunos/:alunoId', turmaController.removerAlunoTurma);

module.exports = router; 