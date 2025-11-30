import { useState } from 'react';
import {
  Box,
  Container,
  Tabs,
  Tab,
  AppBar,
  Typography,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material';
import DatabaseIcon from '@mui/icons-material/Storage';
import CollectionsIcon from '@mui/icons-material/FolderOpen';
import ObjectsIcon from '@mui/icons-material/DataObject';
import View3DIcon from '@mui/icons-material/ThreeDRotation';

import DatabaseTab from './components/DatabaseTab';
import CollectionsTab from './components/CollectionsTab';
import ObjectsTab from './components/ObjectsTab';
import ThreeDViewTab from './components/ThreeDViewTab';

const pastelTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#7CB9E8',
      light: '#B4D7F0',
      dark: '#5A9BC7',
      contrastText: '#fff',
    },
    secondary: {
      main: '#C3B1E1',
      light: '#E0D5F5',
      dark: '#A393C9',
    },
    background: {
      default: '#F8FAFB',
      paper: '#FFFFFF',
    },
    success: {
      main: '#A8D5BA',
      light: '#D4EBD9',
      dark: '#7FB596',
    },
    error: {
      main: '#eb5062ff',
      light: '#f7b1b9ff',
      dark: '#D97F8A',
    },
    warning: {
      main: '#FFDAB9',
      light: '#FFE9D6',
      dark: '#E6C29F',
    },
    info: {
      main: '#B4D7F0',
      light: '#D9EBF7',
      dark: '#91BDDB',
    },
    text: {
      primary: '#2C3E50',
      secondary: '#5A6C7D',
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#2C3E50',
    },
    h5: {
      fontWeight: 600,
      color: '#2C3E50',
    },
    h6: {
      fontWeight: 600,
      color: '#2C3E50',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(124, 185, 232, 0.08)',
          border: '1px solid rgba(124, 185, 232, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(124, 185, 232, 0.2)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #7CB9E8 0%, #B4D7F0 100%)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #7CB9E8 0%, #B4D7F0 100%)',
          boxShadow: '0 4px 20px rgba(124, 185, 232, 0.15)',
          borderRadius: '0 0 0 0',
        },
      },
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={pastelTheme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #F8FAFB 0%, #E8F4F8 100%)',
      }}>
        <AppBar position="static" elevation={0}>
          <Box sx={{ display: 'flex', alignItems: 'center', px: 3, py: 1, position: 'relative' }}>
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ 
                position: 'absolute', 
                left: 24, 
                fontWeight: 700,
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              Database Dashboard
            </Typography>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="dashboard tabs"
              centered
              sx={{ 
                flexGrow: 1,
                '& .MuiTab-root': {
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: 600,
                  minHeight: 64,
                  '&.Mui-selected': {
                    color: 'white',
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'white',
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <Tab icon={<DatabaseIcon />} label="Database" iconPosition="start" />
              <Tab icon={<CollectionsIcon />} label="Collections" iconPosition="start" />
              <Tab icon={<ObjectsIcon />} label="Objects" iconPosition="start" />
              <Tab icon={<View3DIcon />} label="3D View" iconPosition="start" />
            </Tabs>
          </Box>
        </AppBar>

        <Container maxWidth="xl" sx={{ flex: 1, mt: 2 }}>
          <TabPanel value={tabValue} index={0}>
            <DatabaseTab />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <CollectionsTab />
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <ObjectsTab />
          </TabPanel>
          <TabPanel value={tabValue} index={3}>
            <ThreeDViewTab />
          </TabPanel>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
