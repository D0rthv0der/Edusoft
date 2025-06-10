const express = require('express');
const router = express.Router();
const {
    listarDisciplinas,
    criarDisciplina,
    buscarDisciplinaPorId,
    atualizarDisciplina,
    excluirDisciplina
} = require('../controllers/disciplinaController');

// Listar todas as disciplinas
router.get('/', listarDisciplinas);

// Buscar disciplina por ID
router.get('/:id', buscarDisciplinaPorId);

// Criar nova disciplina
router.post('/', criarDisciplina);

// Atualizar disciplina
router.put('/:id', atualizarDisciplina);

// Excluir disciplina (soft delete)
router.delete('/:id', excluirDisciplina);

module.exports = router; 