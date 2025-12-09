import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { listDockerNetworks, getDockerNetwork, setDockerNetwork, clearDockerNetwork } from '../services/api';

interface DockerNetworkMenuProps {
  open: boolean;
  onClose: () => void;
  onSave?: (network: string) => void;
}

export default function DockerNetworkMenu({ open, onClose, onSave }: DockerNetworkMenuProps) {
  const [selectedNetwork, setSelectedNetwork] = useState('bridge');
  const [availableNetworks, setAvailableNetworks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load networks and current network when dialog opens
  useEffect(() => {
    if (open) {
      const loadNetworkConfig = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
          const [networksRes, currentNetworkRes] = await Promise.all([
            listDockerNetworks(),
            getDockerNetwork(),
          ]);
          setAvailableNetworks(networksRes.data.networks);
          setSelectedNetwork(currentNetworkRes.data.network);
        } catch (err: any) {
          console.error('Failed to load Docker network config:', err);
          setError(err.response?.data?.detail || 'Failed to load network configuration');
          // Fallback to default values
          setAvailableNetworks(['bridge', 'host', 'none']);
        } finally {
          setLoading(false);
        }
      };
      loadNetworkConfig();
    }
  }, [open]);

  const handleNetworkChange = (event: SelectChangeEvent) => {
    setSelectedNetwork(event.target.value);
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    try {
      await setDockerNetwork(selectedNetwork);
      setSuccess('Docker network updated successfully!');
      
      if (onSave) {
        onSave(selectedNetwork);
      }
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Failed to save Docker network:', err);
      setError(err.response?.data?.detail || 'Failed to update Docker network');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    try {
      await clearDockerNetwork();
      setSuccess('Docker network disconnected successfully!');
      setSelectedNetwork('');
      
      if (onSave) {
        onSave('');
      }
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Failed to disconnect Docker network:', err);
      setError(err.response?.data?.detail || 'Failed to disconnect Docker network');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Docker Network Configuration
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Configure the Docker network settings for your Weaviate instance. 
            Select the network bridge to use for container communication.
          </Typography>

          {loading && !error && !success ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress />
            </Box>
          ) : (
            <FormControl fullWidth>
              <InputLabel id="network-select-label">Network</InputLabel>
              <Select
                labelId="network-select-label"
                id="network-select"
                value={selectedNetwork}
                label="Network"
                onChange={handleNetworkChange}
                disabled={loading}
              >
                {availableNetworks.map((network) => (
                  <MenuItem key={network} value={network}>
                    {network}
                  </MenuItem>
                ))}
                <Divider />
                <MenuItem 
                  value="" 
                  sx={{ 
                    color: 'error.main',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: 'error.lighter',
                    }
                  }}
                >
                  Disconnect
                </MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2 }} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={selectedNetwork === '' ? handleDisconnect : handleSave} 
          variant="contained"
          color={selectedNetwork === '' ? 'error' : 'primary'}
          sx={{ borderRadius: 2, px: 3 }}
          disabled={loading}
        >
          {loading ? (selectedNetwork === '' ? 'Disconnecting...' : 'Saving...') : (selectedNetwork === '' ? 'Disconnect' : 'Save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
