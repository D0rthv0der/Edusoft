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

const Salas = () => {
    const [salas, setSalas] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingSala, setEditingSala] = useState(null);
    const [formData, setFormData] = useState({
        nome: '',
        local: '',
        capacidade: ''
    });
    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [busca, setBusca] = useState('');
    const [status, setStatus] = useState(true);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [orderBy, setOrderBy] = useState('nome');
    const [orderDirection, setOrderDirection] = useState('asc');

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const handleSort = (field) => {
        const isAsc = orderBy === field && orderDirection === 'asc';
        setOrderDirection(isAsc ? 'desc' : 'asc');
        setOrderBy(field);
    };

    const carregarSalas = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/salas?pagina=${pagina}&limite=10&busca=${busca}&status=${status}&orderBy=${orderBy}&orderDirection=${orderDirection}`);
            setSalas(response.data.salas);
            setTotalPaginas(response.data.paginacao.totalPaginas);
        } catch (error) {
            console.error('Erro ao carregar salas:', error);
            showSnackbar('Erro ao carregar salas', 'error');
        }
    };

    useEffect(() => {
        carregarSalas();
    }, [pagina, busca, status, orderBy, orderDirection]);

    const handleOpen = (sala = null) => {
        if (sala) {
            setEditingSala(sala);
            setFormData({
                nome: sala.nome || '',
                local: sala.local || '',
                capacidade: sala.capacidade || '',
                status: sala.status
            });
        } else {
            setEditingSala(null);
            setFormData({
                nome: '',
                local: '',
                capacidade: '',
                status: true
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingSala(null);
        setFormData({
            nome: '',
            local: '',
            capacidade: '',
            status: true
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                capacidade: parseInt(formData.capacidade)
            };

            console.log('Dados sendo enviados:', dataToSend);

            if (editingSala) {
                const response = await axios.put(`http://localhost:3001/api/salas/${editingSala.id}`, dataToSend);
                console.log('Resposta do servidor:', response.data);
                showSnackbar('Sala atualizada com sucesso!');
            } else {
                const response = await axios.post('http://localhost:3001/api/salas', dataToSend);
                console.log('Resposta do servidor:', response.data);
                showSnackbar('Sala criada com sucesso!');
            }
            handleClose();
            carregarSalas();
        } catch (error) {
            console.error('Erro ao salvar sala:', error);
            console.error('Resposta do servidor:', error.response?.data);
            const mensagem = error.response?.data?.mensagem || 'Erro ao salvar sala';
            const erros = error.response?.data?.erros || [];
            showSnackbar(`${mensagem}: ${erros.join(', ')}`, 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir esta sala?')) {
            try {
                await axios.delete(`http://localhost:3001/api/salas/${id}`);
                showSnackbar('Sala excluída com sucesso!');
                carregarSalas();
            } catch (error) {
                console.error('Erro ao excluir sala:', error);
                showSnackbar('Erro ao excluir sala', 'error');
            }
        }
    };

    const handleRestore = async (id) => {
        try {
            await axios.put(`http://localhost:3001/api/salas/${id}`, { status: true });
            showSnackbar('Sala ativada com sucesso!');
            carregarSalas();
        } catch (error) {
            console.error('Erro ao ativar sala:', error);
            showSnackbar('Erro ao ativar sala', 'error');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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
                        Salas
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpen()}
                    >
                        Nova Sala
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
                                <TableHeader field="capacidade" label="Capacidade" />
                                <TableHeader field="local" label="Local" />
                                <TableHeader field="status" label="Status" />
                                <TableCell align="right">Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {salas.map((sala) => (
                                <TableRow key={sala.id}>
                                    <TableCell>{sala.nome}</TableCell>
                                    <TableCell>{sala.capacidade}</TableCell>
                                    <TableCell>{sala.local}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={sala.status ? 'Ativa' : 'Inativa'}
                                            color={sala.status ? 'success' : 'error'}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleOpen(sala)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        {sala.status ? (
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDelete(sala.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        ) : (
                                            <IconButton
                                                color="success"
                                                onClick={() => handleRestore(sala.id)}
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
                    {editingSala ? 'Editar Sala' : 'Nova Sala'}
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
                            label="Local"
                            name="local"
                            value={formData.local}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Capacidade"
                            name="capacidade"
                            type="number"
                            value={formData.capacidade}
                            onChange={handleChange}
                            fullWidth
                            required
                            inputProps={{ min: 1 }}
                        />
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
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Salas; 