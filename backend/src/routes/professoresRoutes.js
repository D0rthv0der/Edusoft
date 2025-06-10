const express = require('express');
const router = express.Router();
const {
    listarProfessores,
    buscarProfessorPorId,
    criarProfessor,
    atualizarProfessor,
    deletarProfessor
} = require('../controllers/professoresController');

// Rotas para professores
router.get('/', listarProfessores);
router.get('/:id', buscarProfessorPorId);
router.post('/', criarProfessor);
router.put('/:id', atualizarProfessor);
router.delete('/:id', deletarProfessor);

module.exports = router; 