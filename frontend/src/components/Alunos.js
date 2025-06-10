import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Typography,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Pagination,
    Grid
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Search as SearchIcon, Restore as RestoreIcon } from '@mui/icons-material';
import axios from 'axios';

const Alunos = () => {
    const [alunos, setAlunos] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingAluno, setEditingAluno] = useState(null);
    const [formData, setFormData] = useState({
        nome: '',
        matricula: ''
    });
    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [busca, setBusca] = useState('');
    const [status, setStatus] = useState(true);

    const carregarAlunos = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/alunos?pagina=${pagina}&limite=10&busca=${busca}&status=${status}`);
            setAlunos(response.data.alunos);
            setTotalPaginas(response.data.paginacao.totalPaginas);
        } catch (error) {
            console.error('Erro ao carregar alunos:', error);
        }
    };

    useEffect(() => {
        carregarAlunos();
    }, [pagina, busca, status]);

    const handleOpen = (aluno = null) => {
        if (aluno) {
            setEditingAluno(aluno);
            setFormData({
                nome: aluno.nome,
                matricula: aluno.matricula
            });
        } else {
            setEditingAluno(null);
            setFormData({
                nome: '',
                matricula: ''
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingAluno(null);
        setFormData({
            nome: '',
            matricula: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAluno) {
                await axios.put(`http://localhost:3001/api/alunos/${editingAluno.id}`, {
                    ...formData,
                    status: editingAluno.status
                });
            } else {
                await axios.post('http://localhost:3001/api/alunos', { ...formData, status: true });
            }
            handleClose();
            carregarAlunos();
        } catch (error) {
            console.error('Erro ao salvar aluno:', error);
            alert('Erro ao salvar aluno. Verifique o console para mais detalhes.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este aluno?')) {
            try {
                await axios.delete(`http://localhost:3001/api/alunos/${id}`);
                carregarAlunos();
            } catch (error) {
                console.error('Erro ao excluir aluno:', error);
            }
        }
    };

    const handleReativar = async (id) => {
        if (window.confirm('Tem certeza que deseja reativar este aluno?')) {
            try {
                // Busca os dados completos do aluno
                const alunoResponse = await axios.get(`http://localhost:3001/api/alunos/${id}`);
                const alunoCompleto = alunoResponse.data;
                
                // Atualiza com todos os dados e status = true
                await axios.put(`http://localhost:3001/api/alunos/${id}`, {
                    nome: alunoCompleto.nome,
                    matricula: alunoCompleto.matricula,
                    status: true
                });
                carregarAlunos();
            } catch (error) {
                console.error('Erro ao reativar aluno:', error);
                alert('Erro ao reativar aluno. Verifique o console para mais detalhes.');
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" component="h2">
                        Alunos
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpen()}
                    >
                        Novo Aluno
                    </Button>
                </Box>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Buscar"
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1 }} />
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={status}
                                label="Status"
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <MenuItem value={true}>Ativos</MenuItem>
                                <MenuItem value={false}>Inativos</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nome</TableCell>
                                <TableCell>Matrícula</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {alunos.map((aluno) => (
                                <TableRow key={aluno.id}>
                                    <TableCell>{aluno.nome}</TableCell>
                                    <TableCell>{aluno.matricula}</TableCell>
                                    <TableCell>{aluno.status ? 'Ativo' : 'Inativo'}</TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleOpen(aluno)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        {aluno.status ? (
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDelete(aluno.id)}
                                                title="Excluir aluno"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        ) : (
                                            <IconButton
                                                color="success"
                                                onClick={() => handleReativar(aluno.id)}
                                                title="Reativar aluno"
                                            >
                                                <RestoreIcon />
                                            </IconButton>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Pagination
                        count={totalPaginas}
                        page={pagina}
                        onChange={(e, value) => setPagina(value)}
                        color="primary"
                    />
                </Box>
            </Paper>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingAluno ? 'Editar Aluno' : 'Novo Aluno'}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Nome"
                            name="nome"
                            value={formData.nome}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Matrícula"
                            name="matricula"
                            value={formData.matricula}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancelar</Button>
                        <Button type="submit" variant="contained" color="primary">
                            Salvar
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
};

export default Alunos; 