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
    Snackbar,
    Chip
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Search as SearchIcon, Restore as RestoreIcon } from '@mui/icons-material';
import axios from 'axios';

const Disciplinas = () => {
    const [disciplinas, setDisciplinas] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingDisciplina, setEditingDisciplina] = useState(null);
    const [formData, setFormData] = useState({
        nome: '',
        codigo: '',
        periodo: ''
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

    const carregarDisciplinas = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/disciplinas?pagina=${pagina}&limite=10&busca=${busca}&status=${status}&orderBy=${orderBy}&orderDirection=${orderDirection}`);
            setDisciplinas(response.data.disciplinas);
            setTotalPaginas(response.data.paginacao.totalPaginas);
        } catch (error) {
            console.error('Erro ao carregar disciplinas:', error);
            showSnackbar('Erro ao carregar disciplinas', 'error');
        }
    };

    useEffect(() => {
        carregarDisciplinas();
    }, [pagina, busca, status, orderBy, orderDirection]);

    const handleOpen = (disciplina = null) => {
        if (disciplina) {
            setEditingDisciplina(disciplina);
            setFormData({
                nome: disciplina.nome || '',
                codigo: disciplina.codigo || '',
                periodo: disciplina.periodo || ''
            });
        } else {
            setEditingDisciplina(null);
            setFormData({
                nome: '',
                codigo: '',
                periodo: ''
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingDisciplina(null);
        setFormData({
            nome: '',
            codigo: '',
            periodo: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dadosParaEnviar = {
                ...formData,
                periodo: formData.periodo.endsWith('º') ? formData.periodo : `${formData.periodo}º`
            };

            if (editingDisciplina) {
                await axios.put(`http://localhost:3001/api/disciplinas/${editingDisciplina.id}`, dadosParaEnviar);
                showSnackbar('Disciplina atualizada com sucesso!');
            } else {
                await axios.post('http://localhost:3001/api/disciplinas', dadosParaEnviar);
                showSnackbar('Disciplina criada com sucesso!');
            }
            handleClose();
            carregarDisciplinas();
        } catch (error) {
            console.error('Erro ao salvar disciplina:', error);
            const mensagem = error.response?.data?.mensagem || 'Erro ao salvar disciplina';
            const erros = error.response?.data?.erros || [];
            showSnackbar(`${mensagem}: ${erros.join(', ')}`, 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir esta disciplina?')) {
            try {
                await axios.delete(`http://localhost:3001/api/disciplinas/${id}`);
                carregarDisciplinas();
            } catch (error) {
                console.error('Erro ao excluir disciplina:', error);
            }
        }
    };

    const handleRestore = async (id) => {
        try {
            await axios.put(`http://localhost:3001/api/disciplinas/${id}`, { status: true });
            showSnackbar('Disciplina ativada com sucesso!');
            carregarDisciplinas();
        } catch (error) {
            console.error('Erro ao ativar disciplina:', error);
            showSnackbar('Erro ao ativar disciplina', 'error');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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
                        Disciplinas
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpen()}
                    >
                        Nova Disciplina
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
                                <MenuItem value={true}>Ativas</MenuItem>
                                <MenuItem value={false}>Inativas</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader field="nome" label="Nome" />
                                <TableHeader field="periodo" label="Período" />
                                <TableCell>Código</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {disciplinas.map((disciplina) => (
                                <TableRow key={disciplina.id}>
                                    <TableCell>{disciplina.nome}</TableCell>
                                    <TableCell>{disciplina.periodo}</TableCell>
                                    <TableCell>{disciplina.codigo}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={disciplina.status ? 'Ativa' : 'Inativa'}
                                            color={disciplina.status ? 'success' : 'error'}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleOpen(disciplina)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        {disciplina.status ? (
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDelete(disciplina.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        ) : (
                                            <IconButton
                                                color="success"
                                                onClick={() => handleRestore(disciplina.id)}
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
                    {editingDisciplina ? 'Editar Disciplina' : 'Nova Disciplina'}
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
                            label="Código"
                            name="codigo"
                            value={formData.codigo}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Período"
                            name="periodo"
                            value={formData.periodo}
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

            <Snackbar
                open={!!snackbarMessage}
                autoHideDuration={6000}
                onClose={() => showSnackbar('', 'success')}
            >
                <Alert onClose={() => showSnackbar('', 'success')} severity={snackbarSeverity}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Disciplinas; 