const express = require('express');
const router = express.Router();
const {
    listarAlunos,
    buscarAlunoPorId,
    criarAluno,
    atualizarAluno,
    deletarAluno
} = require('../controllers/alunosController');

// Rotas para alunos
router.get('/', listarAlunos);
router.get('/:id', buscarAlunoPorId);
router.post('/', criarAluno);
router.put('/:id', atualizarAluno);
router.delete('/:id', deletarAluno);

module.exports = router; 