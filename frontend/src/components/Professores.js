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
    Grid,
    Alert,
    Snackbar
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Search as SearchIcon, Restore as RestoreIcon } from '@mui/icons-material';
import axios from 'axios';

const Professores = () => {
    const [professores, setProfessores] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingProfessor, setEditingProfessor] = useState(null);
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        cpf: '',
        titulacao: ''
    });
    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [busca, setBusca] = useState('');
    const [status, setStatus] = useState(true);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [orderBy, setOrderBy] = useState('nome');
    const [orderDirection, setOrderDirection] = useState('asc');

    const handleSort = (field) => {
        const isAsc = orderBy === field && orderDirection === 'asc';
        setOrderDirection(isAsc ? 'desc' : 'asc');
        setOrderBy(field);
    };

    const carregarProfessores = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/professores?pagina=${pagina}&limite=10&busca=${busca}&status=${status}&orderBy=${orderBy}&orderDirection=${orderDirection}`);
            setProfessores(response.data.professores);
            setTotalPaginas(response.data.paginacao.totalPaginas);
        } catch (error) {
            console.error('Erro ao carregar professores:', error);
            showSnackbar('Erro ao carregar professores', 'error');
        }
    };

    useEffect(() => {
        carregarProfessores();
    }, [pagina, busca, status, orderBy, orderDirection]);

    const handleOpen = (professor = null) => {
        if (professor) {
            setEditingProfessor(professor);
            setFormData({
                nome: professor.nome || '',
                email: professor.email || '',
                telefone: professor.telefone || '',
                cpf: professor.cpf || '',
                titulacao: professor.titulacao || '',
                status: professor.status
            });
        } else {
            setEditingProfessor(null);
            setFormData({
                nome: '',
                email: '',
                telefone: '',
                cpf: '',
                titulacao: '',
                status: true
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingProfessor(null);
        setFormData({
            nome: '',
            email: '',
            telefone: '',
            cpf: '',
            titulacao: '',
            status: true
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProfessor) {
                await axios.put(`http://localhost:3001/api/professores/${editingProfessor.id}`, formData);
                showSnackbar('Professor atualizado com sucesso!');
            } else {
                await axios.post('http://localhost:3001/api/professores', formData);
                showSnackbar('Professor criado com sucesso!');
            }
            handleClose();
            carregarProfessores();
        } catch (error) {
            console.error('Erro ao salvar professor:', error);
            const mensagem = error.response?.data?.mensagem || 'Erro ao salvar professor';
            const erros = error.response?.data?.erros || [];
            showSnackbar(`${mensagem}: ${erros.join(', ')}`, 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este professor?')) {
            try {
                await axios.delete(`http://localhost:3001/api/professores/${id}`);
                showSnackbar('Professor excluído com sucesso!');
                carregarProfessores();
            } catch (error) {
                console.error('Erro ao excluir professor:', error);
                showSnackbar('Erro ao excluir professor', 'error');
            }
        }
    };

    const handleRestore = async (id) => {
        try {
            await axios.put(`http://localhost:3001/api/professores/${id}`, { status: true });
            showSnackbar('Professor ativado com sucesso!');
            carregarProfessores();
        } catch (error) {
            console.error('Erro ao ativar professor:', error);
            showSnackbar('Erro ao ativar professor', 'error');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const formatarCPF = (cpf) => {
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
    };

    const TableHeader = ({ field, label }) => (
        <TableCell 
            onClick={() => handleSort(field)}
            style={{ cursor: 'pointer' }}
        >
            <Box display="flex" alignItems="center">
                {label}
                {orderBy === field && (
                    <Box component="span" ml={1}>
                        {orderDirection === 'asc' ? '↑' : '↓'}
                    </Box>
                )}
            </Box>
        </TableCell>
    );

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" component="h2">
                        Professores
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpen()}
                    >
                        Novo Professor
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
                                <TableHeader field="nome" label="Nome" />
                                <TableHeader field="titulacao" label="Titulação" />
                                <TableCell>Email</TableCell>
                                <TableCell>Telefone</TableCell>
                                <TableCell>CPF</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {professores.map((professor) => (
                                <TableRow key={professor.id}>
                                    <TableCell>{professor.nome}</TableCell>
                                    <TableCell>{professor.titulacao}</TableCell>
                                    <TableCell>{professor.email}</TableCell>
                                    <TableCell>{professor.telefone}</TableCell>
                                    <TableCell>{formatarCPF(professor.cpf)}</TableCell>
                                    <TableCell>{professor.status ? 'Ativo' : 'Inativo'}</TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleOpen(professor)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        {professor.status ? (
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDelete(professor.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        ) : (
                                            <IconButton
                                                color="success"
                                                onClick={() => handleRestore(professor.id)}
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
                    {editingProfessor ? 'Editar Professor' : 'Novo Professor'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Nome"
                            name="nome"
                            value={formData.nome}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Telefone"
                            name="telefone"
                            value={formData.telefone}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                        <TextField
                            label="CPF"
                            name="cpf"
                            value={formData.cpf}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                        <FormControl fullWidth required>
                            <InputLabel>Titulação</InputLabel>
                            <Select
                                name="titulacao"
                                value={formData.titulacao}
                                onChange={handleChange}
                                label="Titulação"
                            >
                                <MenuItem value="Graduação">Graduação</MenuItem>
                                <MenuItem value="Especialização">Especialização</MenuItem>
                                <MenuItem value="Mestrado">Mestrado</MenuItem>
                                <MenuItem value="Doutorado">Doutorado</MenuItem>
                                <MenuItem value="Pós-Doutorado">Pós-Doutorado</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        Salvar
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={!!snackbarMessage}
                autoHideDuration={6000}
                onClose={() => setSnackbarMessage('')}
            >
                <Alert onClose={() => setSnackbarMessage('')} severity={snackbarSeverity}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Professores; 