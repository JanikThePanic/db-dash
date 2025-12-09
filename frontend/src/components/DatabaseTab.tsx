import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import { healthCheck, getMeta, ping, getDatabaseUrl, getDatabasePort, setDatabaseUrl, setDatabasePort } from '../services/api';
import type { MetaResponse } from '../types';

export default function DatabaseTab() {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<{ status: string } | null>(null);
  const [meta, setMeta] = useState<MetaResponse | null>(null);
  const [pingStatus, setPingStatus] = useState<{ weaviate: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [dbUrl, setDbUrl] = useState('localhost');
  const [dbPort, setDbPort] = useState('3131');
  const [configError, setConfigError] = useState<string | null>(null);
  const [configSuccess, setConfigSuccess] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [healthRes, metaRes, pingRes] = await Promise.all([
        healthCheck(),
        getMeta(),
        ping(),
      ]);
      setHealth(healthRes.data);
      setMeta(metaRes.data);
      setPingStatus(pingRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  const loadDatabaseConfig = async () => {
    try {
      const [urlRes, portRes] = await Promise.all([
        getDatabaseUrl(),
        getDatabasePort(),
      ]);
      setDbUrl(urlRes.data.url);
      setDbPort(String(portRes.data.port));
    } catch (err: any) {
      console.error('Failed to load database config:', err);
    }
  };

  const handleOpenConfigDialog = async () => {
    await loadDatabaseConfig();
    setConfigDialogOpen(true);
    setConfigError(null);
    setConfigSuccess(null);
  };

  const handleCloseConfigDialog = () => {
    setConfigDialogOpen(false);
    setConfigError(null);
    setConfigSuccess(null);
  };

  const handleSaveConfig = async () => {
    setConfigError(null);
    setConfigSuccess(null);
    
    try {
      const portNum = parseInt(dbPort, 10);
      if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        setConfigError('Port must be a valid number between 1 and 65535');
        return;
      }

      await Promise.all([
        setDatabaseUrl(dbUrl),
        setDatabasePort(portNum),
      ]);

      setConfigSuccess('Database configuration updated successfully!');
      setTimeout(() => {
        handleCloseConfigDialog();
        loadData(); // Refresh the connection status
      }, 1500);
    } catch (err: any) {
      setConfigError(err.message || 'Failed to update database configuration');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={loadData}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <Stack spacing={{ xs: 2, md: 4 }} sx={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      <Box 
        display="flex" 
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={{ xs: 2, sm: 0 }}
      >
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5, fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
            Database Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor your database health and status
          </Typography>
        </Box>
        <Box display="flex" gap={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Button 
            startIcon={<SettingsIcon />} 
            variant="outlined" 
            onClick={handleOpenConfigDialog}
            sx={{ borderRadius: 3, px: 3, width: { xs: '50%', sm: 'auto' } }}
          >
            Configure
          </Button>
          <Button 
            startIcon={<RefreshIcon />} 
            variant="contained" 
            onClick={loadData}
            sx={{ borderRadius: 3, px: 3, width: { xs: '50%', sm: 'auto' } }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Box sx={{ width: '100%', overflow: 'hidden' }}>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* Health Status */}
          <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: health?.status === 'ok' 
              ? 'linear-gradient(135deg, #D4EBD9 0%, #A8D5BA 100%)'
              : 'linear-gradient(135deg, #FAD0D5 0%, #F4A5AE 100%)',
            border: 'none',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600, 
                  color: 'rgba(44, 62, 80, 0.7)',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  mb: 2,
                }}
              >
                Backend Health
              </Typography>
              <Box display="flex" alignItems="center" gap={1.5}>
                {health?.status === 'ok' ? (
                  <>
                    <CheckCircleIcon sx={{ fontSize: 40, color: '#2E7D5F' }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#2E7D5F' }}>Healthy</Typography>
                  </>
                ) : (
                  <>
                    <ErrorIcon sx={{ fontSize: 40, color: '#C7304A' }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#C7304A' }}>Unhealthy</Typography>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Weaviate Status */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: pingStatus?.weaviate
              ? 'linear-gradient(135deg, #D9EBF7 0%, #B4D7F0 100%)'
              : 'linear-gradient(135deg, #FFE9D6 0%, #FFDAB9 100%)',
            border: 'none',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600, 
                  color: 'rgba(44, 62, 80, 0.7)',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  mb: 2,
                }}
              >
                Weaviate Status
              </Typography>
              <Box display="flex" alignItems="center" gap={1.5}>
                {pingStatus?.weaviate ? (
                  <>
                    <CheckCircleIcon sx={{ fontSize: 40, color: '#4A7B9D' }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#4A7B9D' }}>Connected</Typography>
                  </>
                ) : (
                  <>
                    <ErrorIcon sx={{ fontSize: 40, color: '#C7854A' }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#C7854A' }}>Disconnected</Typography>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Version */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #E0D5F5 0%, #C3B1E1 100%)',
            border: 'none',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600, 
                  color: 'rgba(44, 62, 80, 0.7)',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  mb: 2,
                }}
              >
                Weaviate Version
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#6F5B99' }}>
                {meta?.version || 'Unknown'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Metadata */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: { xs: 2, sm: 3 }, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                📊 Metadata
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Hostname</Typography>
                  <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, wordBreak: 'break-word' }}>{meta?.hostname || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Version</Typography>
                  <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{meta?.version || 'N/A'}</Typography>
                </Grid>
                {meta?.modules && (
                  <Grid item xs={12}>
                    <Typography color="text.secondary" gutterBottom sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      Modules
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {Object.keys(meta.modules).map((module) => (
                        <Chip 
                          key={module} 
                          label={module} 
                          size="small"
                          sx={{ 
                            background: 'linear-gradient(135deg, #B4D7F0 0%, #7CB9E8 100%)',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                          }}
                        />
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      </Box>

      {/* Configuration Dialog */}
      <Dialog 
        open={configDialogOpen} 
        onClose={handleCloseConfigDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <SettingsIcon />
            <Typography variant="h6">Database Configuration</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {configError && (
              <Alert severity="error" onClose={() => setConfigError(null)}>
                {configError}
              </Alert>
            )}
            {configSuccess && (
              <Alert severity="success" onClose={() => setConfigSuccess(null)}>
                {configSuccess}
              </Alert>
            )}
            <TextField
              label="Database URL"
              value={dbUrl}
              onChange={(e) => setDbUrl(e.target.value)}
              fullWidth
              placeholder="localhost"
              helperText="Enter the hostname or IP address of your Weaviate instance"
            />
            <TextField
              label="Database Port"
              value={dbPort}
              onChange={(e) => setDbPort(e.target.value)}
              fullWidth
              type="number"
              placeholder="3131"
              helperText="Enter the port number (1-65535)"
              inputProps={{ min: 1, max: 65535 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseConfigDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveConfig} 
            variant="contained" 
            disabled={!dbUrl || !dbPort}
          >
            Save Configuration
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
