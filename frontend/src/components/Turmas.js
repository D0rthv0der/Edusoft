import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Typography,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Pagination,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Restore as RestoreIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const DIAS_SEMANA = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado'
];

function Turmas() {
  const [turmas, setTurmas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [salas, setSalas] = useState([]);
  const [showInactive, setShowInactive] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAlunosDialog, setOpenAlunosDialog] = useState(false);
  const [currentTurma, setCurrentTurma] = useState({
    nome: '',
    disciplina_id: '',
    professor_id: '',
    sala_id: '',
    dia_semana: '',
    horario_inicio: '',
    horario_termino: '',
    status: true
  });
  const [alunosTurma, setAlunosTurma] = useState([]);
  const [alunosDisponiveis, setAlunosDisponiveis] = useState([]);
  const [vagasInfo, setVagasInfo] = useState({ ocupadas: 0, total: 0, disponiveis: 0 });
  const [turmaInfo, setTurmaInfo] = useState({});
  const [selectedTurmaId, setSelectedTurmaId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [busca, setBusca] = useState('');
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

  const carregarTurmas = useCallback(async () => {
    try {
      const status = !showInactive; // Se showInactive é false, queremos status=true (ativos)
      const response = await axios.get(`${API_URL}/turmas?pagina=${pagina}&limite=10&busca=${busca}&status=${status}&orderBy=${orderBy}&orderDirection=${orderDirection}`);
      if (response.data && response.data.turmas) {
        setTurmas(response.data.turmas);
        setTotalPaginas(response.data.paginacao.totalPaginas);
      } else {
        setTurmas([]);
        showSnackbar('Erro ao carregar turmas: formato de dados inválido', 'error');
      }
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
      setTurmas([]);
      showSnackbar(
        error.response?.data?.error || 'Erro ao carregar turmas',
        'error'
      );
    }
  }, [pagina, busca, showInactive, orderBy, orderDirection]);

  const carregarDisciplinas = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/disciplinas?status=true`);
      if (response.data && response.data.disciplinas) {
        setDisciplinas(response.data.disciplinas);
      } else {
        setDisciplinas([]);
        showSnackbar('Erro ao carregar disciplinas', 'error');
      }
    } catch (error) {
      console.error('Erro ao carregar disciplinas:', error);
      setDisciplinas([]);
      showSnackbar(error.response?.data?.error || 'Erro ao carregar disciplinas', 'error');
    }
  }, []);

  const carregarProfessores = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/professores?status=true`);
      if (response.data && response.data.professores) {
        setProfessores(response.data.professores);
      } else {
        setProfessores([]);
        showSnackbar('Erro ao carregar professores: formato de dados inválido', 'error');
      }
    } catch (error) {
      console.error('Erro ao carregar professores:', error);
      setProfessores([]);
      showSnackbar(
        error.response?.data?.error || 'Erro ao carregar professores',
        'error'
      );
    }
  }, []);

  const carregarSalas = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/salas?status=true`);
      if (response.data && response.data.salas) {
        setSalas(response.data.salas);
      } else {
        setSalas([]);
        showSnackbar('Erro ao carregar salas: formato de dados inválido', 'error');
      }
    } catch (error) {
      console.error('Erro ao carregar salas:', error);
      setSalas([]);
      showSnackbar(
        error.response?.data?.error || 'Erro ao carregar salas',
        'error'
      );
    }
  }, []);

  const carregarAlunosTurma = async (turmaId) => {
    try {
      const response = await axios.get(`${API_URL}/turmas/${turmaId}/alunos`);
      setAlunosTurma(response.data.alunos);
      setVagasInfo(response.data.vagas);
      setTurmaInfo(response.data.turma);
    } catch (error) {
      console.error('Erro ao carregar alunos da turma:', error);
      showSnackbar('Erro ao carregar alunos da turma', 'error');
    }
  };

  const carregarAlunosDisponiveis = async (turmaId) => {
    try {
      const response = await axios.get(`${API_URL}/turmas/${turmaId}/alunos-disponiveis`);
      setAlunosDisponiveis(response.data.alunos);
    } catch (error) {
      console.error('Erro ao carregar alunos disponíveis:', error);
      showSnackbar('Erro ao carregar alunos disponíveis', 'error');
    }
  };

  useEffect(() => {
    carregarDisciplinas();
    carregarProfessores();
    carregarSalas();
    carregarTurmas();
  }, [carregarDisciplinas, carregarProfessores, carregarSalas, carregarTurmas]);

  const handleSearch = (event) => {
    setBusca(event.target.value);
  };

  const handleOpen = (turma = null) => {
    if (turma) {
      setCurrentTurma({
        ...turma,
        disciplina_id: Number(turma.disciplina_id),
        professor_id: Number(turma.professor_id),
        sala_id: Number(turma.sala_id),
        status: turma.status // Preserva o status original
      });
    } else {
      setCurrentTurma({
        nome: '',
        disciplina_id: '',
        professor_id: '',
        sala_id: '',
        dia_semana: '',
        horario_inicio: '',
        horario_termino: '',
        status: true
      });
    }
    setOpenDialog(true);
  };

  const handleOpenAlunos = async (turmaId) => {
    setSelectedTurmaId(turmaId);
    await carregarAlunosTurma(turmaId);
    await carregarAlunosDisponiveis(turmaId);
    setOpenAlunosDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentTurma({
      nome: '',
      disciplina_id: '',
      professor_id: '',
      sala_id: '',
      dia_semana: '',
      horario_inicio: '',
      horario_termino: '',
      status: true
    });
  };

  const handleCloseAlunosDialog = () => {
    setOpenAlunosDialog(false);
    setSelectedTurmaId(null);
    setAlunosTurma([]);
    setAlunosDisponiveis([]);
    setVagasInfo({ ocupadas: 0, total: 0, disponiveis: 0 });
    setTurmaInfo({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentTurma(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      console.log('Dados da turma a serem salvos:', currentTurma);
      if (currentTurma.id) {
        await axios.put(`${API_URL}/turmas/${currentTurma.id}`, currentTurma);
        showSnackbar('Turma atualizada com sucesso!');
      } else {
        await axios.post(`${API_URL}/turmas`, currentTurma);
        showSnackbar('Turma criada com sucesso!');
      }
      handleCloseDialog();
      carregarTurmas();
    } catch (error) {
      console.error('Erro ao salvar turma:', error);
      console.error('Detalhes do erro:', error.response?.data);
      showSnackbar(
        error.response?.data?.erro || 'Erro ao salvar turma',
        'error'
      );
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta turma?')) {
      try {
        await axios.delete(`${API_URL}/turmas/${id}`);
        showSnackbar('Turma excluída com sucesso!');
        carregarTurmas();
      } catch (error) {
        console.error('Erro ao excluir turma:', error);
        showSnackbar(
          error.response?.data?.erro || 'Erro ao excluir turma',
          'error'
        );
      }
    }
  };

  const handleRestore = async (id) => {
    if (window.confirm('Tem certeza que deseja restaurar esta turma?')) {
      try {
        await axios.put(`${API_URL}/turmas/${id}`, { status: true });
        showSnackbar('Turma restaurada com sucesso!');
        carregarTurmas();
      } catch (error) {
        console.error('Erro ao restaurar turma:', error);
        showSnackbar(
          error.response?.data?.erro || 'Erro ao restaurar turma',
          'error'
        );
      }
    }
  };

  const adicionarAluno = async (alunoId) => {
    try {
      await axios.post(`${API_URL}/turmas/${selectedTurmaId}/alunos`, { alunoId });
      showSnackbar('Aluno adicionado à turma com sucesso!');
      await carregarAlunosTurma(selectedTurmaId);
      await carregarAlunosDisponiveis(selectedTurmaId);
    } catch (error) {
      console.error('Erro ao adicionar aluno:', error);
      showSnackbar(
        error.response?.data?.mensagem || 'Erro ao adicionar aluno',
        'error'
      );
    }
  };

  const removerAluno = async (alunoId) => {
    if (window.confirm('Tem certeza que deseja remover este aluno da turma?')) {
      try {
        await axios.delete(`${API_URL}/turmas/${selectedTurmaId}/alunos/${alunoId}`);
        showSnackbar('Aluno removido da turma com sucesso!');
        await carregarAlunosTurma(selectedTurmaId);
        await carregarAlunosDisponiveis(selectedTurmaId);
      } catch (error) {
        console.error('Erro ao remover aluno:', error);
        showSnackbar(
          error.response?.data?.mensagem || 'Erro ao remover aluno',
          'error'
        );
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gerenciamento de Turmas
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField
          label="Buscar turmas"
          variant="outlined"
          value={busca}
          onChange={handleSearch}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1 }} />
          }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
          }
          label="Mostrar inativos"
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Nova Turma
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Disciplina</TableCell>
              <TableCell>Professor</TableCell>
              <TableCell>Sala</TableCell>
              <TableCell>Dia</TableCell>
              <TableCell>Horário</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Vagas</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {turmas.map((turma) => (
              <TableRow key={turma.id}>
                <TableCell>{turma.nome}</TableCell>
                <TableCell>{turma.disciplina_nome || 'N/A'}</TableCell>
                <TableCell>{turma.professor_nome || 'N/A'}</TableCell>
                <TableCell>{turma.sala_nome || 'N/A'}</TableCell>
                <TableCell>{turma.dia_semana}</TableCell>
                <TableCell>
                  {turma.horario_inicio} - {turma.horario_termino}
                </TableCell>
                <TableCell>
                  <Chip
                    label={turma.status ? 'Ativo' : 'Inativo'}
                    color={turma.status ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${turma.alunos_count || 0}/${turma.sala_capacidade || 0}`}
                    color="info"
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Gerenciar Alunos">
                    <IconButton
                      color="info"
                      onClick={() => handleOpenAlunos(turma.id)}
                    >
                      <PeopleIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpen(turma)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  {turma.status ? (
                    <Tooltip title="Excluir">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(turma.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Restaurar">
                      <IconButton
                        color="success"
                        onClick={() => handleRestore(turma.id)}
                      >
                        <RestoreIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para criar/editar turma */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentTurma.id ? 'Editar Turma' : 'Nova Turma'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome da Turma"
                name="nome"
                value={currentTurma.nome}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Disciplina</InputLabel>
                <Select
                  name="disciplina_id"
                  value={currentTurma.disciplina_id}
                  onChange={handleChange}
                  label="Disciplina"
                >
                  {disciplinas.map((disciplina) => (
                    <MenuItem key={disciplina.id} value={disciplina.id}>
                      {disciplina.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Professor</InputLabel>
                <Select
                  name="professor_id"
                  value={currentTurma.professor_id}
                  onChange={handleChange}
                  label="Professor"
                >
                  {professores.map((professor) => (
                    <MenuItem key={professor.id} value={professor.id}>
                      {professor.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Sala</InputLabel>
                <Select
                  name="sala_id"
                  value={currentTurma.sala_id}
                  onChange={handleChange}
                  label="Sala"
                >
                  {salas.map((sala) => (
                    <MenuItem key={sala.id} value={sala.id}>
                      {sala.nome} (Cap: {sala.capacidade})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Dia da Semana</InputLabel>
                <Select
                  name="dia_semana"
                  value={currentTurma.dia_semana}
                  onChange={handleChange}
                  label="Dia da Semana"
                >
                  {DIAS_SEMANA.map((dia) => (
                    <MenuItem key={dia} value={dia}>
                      {dia}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Horário de Início"
                name="horario_inicio"
                type="time"
                value={currentTurma.horario_inicio}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Horário de Término"
                name="horario_termino"
                type="time"
                value={currentTurma.horario_termino}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para gerenciar alunos */}
      <Dialog 
        open={openAlunosDialog} 
        onClose={handleCloseAlunosDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Gerenciar Alunos - {turmaInfo?.turma_nome}
          <Typography variant="subtitle2" color="textSecondary">
            Sala: {turmaInfo?.sala_nome}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {/* Informações de vagas */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ocupação da Turma
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip 
                label={`${vagasInfo.ocupadas} Ocupadas`} 
                color="primary" 
              />
              <Chip 
                label={`${vagasInfo.disponiveis} Disponíveis`} 
                color="success" 
              />
              <Chip 
                label={`${vagasInfo.total} Total`} 
                color="info" 
              />
            </Box>
          </Box>

          <Grid container spacing={3}>
            {/* Alunos da turma */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Alunos Matriculados ({alunosTurma.length})
              </Typography>
              <Paper sx={{ maxHeight: 400, overflow: 'auto' }}>
                <List>
                  {alunosTurma.map((aluno) => (
                    <ListItem key={aluno.id}>
                      <ListItemText
                        primary={aluno.nome}
                        secondary={`Matrícula: ${aluno.matricula}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          color="error"
                          onClick={() => removerAluno(aluno.id)}
                        >
                          <PersonRemoveIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                  {alunosTurma.length === 0 && (
                    <ListItem>
                      <ListItemText primary="Nenhum aluno matriculado" />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Grid>

            {/* Alunos disponíveis */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Alunos Disponíveis ({alunosDisponiveis.length})
              </Typography>
              <Paper sx={{ maxHeight: 400, overflow: 'auto' }}>
                <List>
                  {alunosDisponiveis.map((aluno) => (
                    <ListItem key={aluno.id}>
                      <ListItemText
                        primary={aluno.nome}
                        secondary={`Matrícula: ${aluno.matricula}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          color="primary"
                          onClick={() => adicionarAluno(aluno.id)}
                          disabled={vagasInfo.disponiveis === 0}
                        >
                          <PersonAddIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                  {alunosDisponiveis.length === 0 && (
                    <ListItem>
                      <ListItemText primary="Nenhum aluno disponível" />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAlunosDialog}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Turmas; 