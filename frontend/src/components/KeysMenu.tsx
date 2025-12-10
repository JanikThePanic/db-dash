import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Stack,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { listKeys, addKey, deleteKey } from '../services/api';

interface KeysMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function KeysMenu({ open, onClose }: KeysMenuProps) {
  const [keys, setKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [addingKey, setAddingKey] = useState(false);

  // Load keys when dialog opens
  useEffect(() => {
    if (open) {
      loadKeys();
    }
  }, [open]);

  const loadKeys = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await listKeys();
      setKeys(response.data.keys);
    } catch (err: any) {
      console.error('Failed to load keys:', err);
      setError(err.response?.data?.detail || 'Failed to load keys');
    } finally {
      setLoading(false);
    }
  };

  const handleAddKey = async () => {
    if (!newKeyName.trim() || !newKeyValue.trim()) {
      setError('Both key name and value are required');
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await addKey(newKeyName.trim(), newKeyValue.trim());
      setSuccess(`Key "${newKeyName}" added successfully!`);
      setNewKeyName('');
      setNewKeyValue('');
      setAddingKey(false);
      await loadKeys();
    } catch (err: any) {
      console.error('Failed to add key:', err);
      setError(err.response?.data?.detail || 'Failed to add key');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKey = async (keyName: string) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await deleteKey(keyName);
      setSuccess(`Key "${keyName}" deleted successfully!`);
      await loadKeys();
    } catch (err: any) {
      console.error('Failed to delete key:', err);
      setError(err.response?.data?.detail || 'Failed to delete key');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAddingKey(false);
    setNewKeyName('');
    setNewKeyValue('');
    setError(null);
    setSuccess(null);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          API Keys Management
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
            Manage API keys for external services and integrations.
          </Typography>

          {loading && keys.length === 0 && !addingKey ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Keys List */}
              {keys.length > 0 ? (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Stored Keys ({keys.length})
                  </Typography>
                  <List sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    {keys.map((keyName, index) => (
                      <Box key={keyName}>
                        <ListItem
                          secondaryAction={
                            <IconButton 
                              edge="end" 
                              aria-label="delete"
                              onClick={() => handleDeleteKey(keyName)}
                              disabled={loading}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          }
                        >
                          <ListItemText 
                            primary={keyName}
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                        </ListItem>
                        {index < keys.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </List>
                </Box>
              ) : (
                <Alert severity="info" sx={{ mb: 2 }}>
                  No API keys stored yet. Add your first key below.
                </Alert>
              )}

              {/* Add Key Form */}
              {addingKey ? (
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'primary.main', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    Add New Key
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      label="Key Name"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      fullWidth
                      size="small"
                      placeholder="e.g., OPENAI_API_KEY"
                      disabled={loading}
                    />
                    <TextField
                      label="Key Value"
                      value={newKeyValue}
                      onChange={(e) => setNewKeyValue(e.target.value)}
                      fullWidth
                      size="small"
                      type="password"
                      placeholder="Enter the API key value"
                      disabled={loading}
                    />
                    <Box display="flex" gap={1} justifyContent="flex-end">
                      <Button 
                        onClick={() => {
                          setAddingKey(false);
                          setNewKeyName('');
                          setNewKeyValue('');
                        }}
                        disabled={loading}
                        size="small"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleAddKey}
                        variant="contained"
                        disabled={loading || !newKeyName.trim() || !newKeyValue.trim()}
                        size="small"
                      >
                        {loading ? 'Adding...' : 'Add Key'}
                      </Button>
                    </Box>
                  </Stack>
                </Box>
              ) : (
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => setAddingKey(true)}
                  variant="outlined"
                  fullWidth
                  disabled={loading}
                >
                  Add New Key
                </Button>
              )}
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} sx={{ borderRadius: 2 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
