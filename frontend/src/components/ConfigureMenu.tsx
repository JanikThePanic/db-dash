import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Stack,
  Alert,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { getDatabaseUrl, getDatabasePort, setDatabaseUrl, setDatabasePort } from '../services/api';

interface ConfigureMenuProps {
  open: boolean;
  onClose: () => void;
  onConfigSaved?: () => void;
}

export default function ConfigureMenu({ open, onClose, onConfigSaved }: ConfigureMenuProps) {
  const [dbUrl, setDbUrl] = useState('localhost');
  const [dbPort, setDbPort] = useState('3131');
  const [configError, setConfigError] = useState<string | null>(null);
  const [configSuccess, setConfigSuccess] = useState<string | null>(null);

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

  const handleOpen = async () => {
    await loadDatabaseConfig();
    setConfigError(null);
    setConfigSuccess(null);
  };

  const handleClose = () => {
    onClose();
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
        handleClose();
        onConfigSaved?.(); // Notify parent to refresh data
      }, 1500);
    } catch (err: any) {
      setConfigError(err.message || 'Failed to update database configuration');
    }
  };

  // Load config when dialog opens
  if (open && !configError && !configSuccess) {
    handleOpen();
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
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
        <Button onClick={handleClose} color="inherit">
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
  );
}
