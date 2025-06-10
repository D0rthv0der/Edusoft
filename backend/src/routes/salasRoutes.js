const express = require('express');
const router = express.Router();
const {
    listarSalas,
    buscarSalaPorId,
    criarSala,
    atualizarSala,
    deletarSala
} = require('../controllers/salasController');

// Rotas para salas
router.get('/', listarSalas);
router.get('/:id', buscarSalaPorId);
router.post('/', criarSala);
router.put('/:id', atualizarSala);
router.delete('/:id', deletarSala);

module.exports = router; 