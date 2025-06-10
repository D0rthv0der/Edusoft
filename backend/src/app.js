const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { criarTabelas } = require('./database/migrations');
const disciplinaRoutes = require('./routes/disciplinaRoutes');
const professoresRoutes = require('./routes/professoresRoutes');
const salasRoutes = require('./routes/salasRoutes');
const turmaRoutes = require('./routes/turmaRoutes');
const alunosRoutes = require('./routes/alunosRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/disciplinas', disciplinaRoutes);
app.use('/api/professores', professoresRoutes);
app.use('/api/salas', salasRoutes);
app.use('/api/turmas', turmaRoutes);
app.use('/api/alunos', alunosRoutes);

// Rota de teste
app.get('/', (req, res) => {
    res.json({ mensagem: 'API do Edusoft funcionando!' });
});

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ mensagem: 'Erro interno do servidor', erro: err.message });
});

// Inicialização do servidor
const iniciarServidor = async () => {
    try {
        // Criar tabelas antes de iniciar o servidor
        await criarTabelas();
        
        const PORT = process.env.PORT || 3001;
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });
    } catch (error) {
        console.error('Erro ao iniciar o servidor:', error);
        process.exit(1);
    }
};

iniciarServidor(); 