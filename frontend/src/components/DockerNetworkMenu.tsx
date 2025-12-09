import { useState } from 'react';
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
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';

interface DockerNetworkMenuProps {
  open: boolean;
  onClose: () => void;
  onSave?: (network: string) => void;
}

export default function DockerNetworkMenu({ open, onClose, onSave }: DockerNetworkMenuProps) {
  const [selectedNetwork, setSelectedNetwork] = useState('bridge');

  const handleNetworkChange = (event: SelectChangeEvent) => {
    setSelectedNetwork(event.target.value);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(selectedNetwork);
    }
    onClose();
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
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Configure the Docker network settings for your Weaviate instance. 
            Select the network bridge to use for container communication.
          </Typography>

          <FormControl fullWidth>
            <InputLabel id="network-select-label">Network</InputLabel>
            <Select
              labelId="network-select-label"
              id="network-select"
              value={selectedNetwork}
              label="Network"
              onChange={handleNetworkChange}
            >
              <MenuItem value="bridge">bridge</MenuItem>
              <MenuItem value="host">host</MenuItem>
              <MenuItem value="weaviate-net">weaviate-net</MenuItem>
              <MenuItem value="custom-network">custom-network</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          sx={{ borderRadius: 2, px: 3 }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
