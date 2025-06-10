import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Link } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import GroupIcon from '@mui/icons-material/Group';
import PeopleIcon from '@mui/icons-material/People';

// Importando os componentes
import Disciplinas from './components/Disciplinas';
import Professores from './components/Professores';
import Salas from './components/Salas';
import Turmas from './components/Turmas';
import Alunos from './components/Alunos';

// Criando um tema personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Componente de navegação
const Navigation = () => {
  const menuItems = [
    { text: 'Disciplinas', icon: <SchoolIcon />, path: '/disciplinas' },
    { text: 'Professores', icon: <PersonIcon />, path: '/professores' },
    { text: 'Alunos', icon: <PeopleIcon />, path: '/alunos' },
    { text: 'Salas', icon: <MeetingRoomIcon />, path: '/salas' },
    { text: 'Turmas', icon: <GroupIcon />, path: '/turmas' },
  ];

  return (
    <List>
      {menuItems.map((item) => (
        <ListItem button key={item.text} component={Link} to={item.path}>
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItem>
      ))}
    </List>
  );
};

// Componente principal
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex' }}>
          {/* Barra superior */}
          <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
              <Typography variant="h6" noWrap component="div">
                Edusoft
              </Typography>
            </Toolbar>
          </AppBar>

          {/* Menu lateral */}
          <Box
            component="nav"
            sx={{
              width: 240,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: 240,
                boxSizing: 'border-box',
              },
            }}
          >
            <Toolbar /> {/* Espaço para a AppBar */}
            <Navigation />
          </Box>

          {/* Conteúdo principal */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              width: { sm: `calc(100% - 240px)` },
              marginLeft: '240px',
            }}
          >
            <Toolbar /> {/* Espaço para a AppBar */}
            <Container maxWidth="lg">
              <Routes>
                <Route path="/" element={<Typography variant="h4">Bem-vindo ao Edusoft</Typography>} />
                <Route path="/disciplinas" element={<Disciplinas />} />
                <Route path="/professores" element={<Professores />} />
                <Route path="/alunos" element={<Alunos />} />
                <Route path="/salas" element={<Salas />} />
                <Route path="/turmas" element={<Turmas />} />
              </Routes>
            </Container>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App; 