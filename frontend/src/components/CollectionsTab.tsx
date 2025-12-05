import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Divider,
  IconButton,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import { listCollections, getCollection, deleteCollection } from '../services/api';
import type { Collection } from '../types';

export default function CollectionsTab() {
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<string>('');
  const [confirmText, setConfirmText] = useState('');

  const loadCollections = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listCollections();
      setCollections(response.data.collections);
    } catch (err: any) {
      setError(err.message || 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const loadCollectionDetails = async (name: string) => {
    try {
      const response = await getCollection(name);
      setSelectedCollection(response.data.collection);
    } catch (err: any) {
      setError(err.message || 'Failed to load collection details');
    }
  };

  const handleDeleteClick = (name: string) => {
    setCollectionToDelete(name);
    setConfirmText('');
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (confirmText !== collectionToDelete) return;

    try {
      await deleteCollection(collectionToDelete, confirmText);
      setDeleteDialogOpen(false);
      setCollectionToDelete('');
      setConfirmText('');
      if (selectedCollection?.name === collectionToDelete) {
        setSelectedCollection(null);
      }
      loadCollections();
    } catch (err: any) {
      setError(err.message || 'Failed to delete collection');
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
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
            Collections
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and explore your data collections
          </Typography>
        </Box>
        <Button 
          startIcon={<RefreshIcon />} 
          variant="contained" 
          onClick={loadCollections}
          sx={{ borderRadius: 3, px: 3, width: { xs: '100%', sm: 'auto' } }}
        >
          Refresh
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ width: '100%', overflow: 'hidden' }}>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* Collections List */}
          <Grid item xs={12} md={4}>
          <Card sx={{ width: '100%', maxWidth: '100%' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: { xs: 2, sm: 3 }, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                📁 All Collections ({collections.length})
              </Typography>
              <List>
                {collections.map((name) => (
                  <ListItem
                    key={name}
                    disablePadding
                    sx={{ mb: 1 }}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteClick(name)}
                        sx={{ 
                          color: '#F4A5AE',
                          '&:hover': { 
                            backgroundColor: 'rgba(244, 165, 174, 0.1)',
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemButton 
                      onClick={() => loadCollectionDetails(name)}
                      sx={{
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: 'rgba(124, 185, 232, 0.08)',
                        },
                      }}
                    >
                      <FolderIcon sx={{ mr: 2, color: '#7CB9E8' }} />
                      <ListItemText 
                        primary={name}
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
                {collections.length === 0 && (
                  <Typography color="text.secondary" sx={{ p: 2 }}>
                    No collections found
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Collection Details */}
        <Grid item xs={12} md={8}>
          {selectedCollection ? (
            <Card sx={{ width: '100%', maxWidth: '100%' }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                  {selectedCollection.name}
                </Typography>

                {selectedCollection.description && (
                  <Typography color="text.secondary" paragraph>
                  {selectedCollection.description}
                </Typography>
              )}

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {selectedCollection.vector_config?.default?.vectorizer?.vectorizer && (
                    <Grid item xs={12} sm={6}>
                      <Typography color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>Vectorizer</Typography>
                      <Chip 
                        label={selectedCollection.vector_config.default.vectorizer.vectorizer} 
                        sx={{ 
                          background: 'linear-gradient(135deg, #C3B1E1 0%, #E0D5F5 100%)',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </Grid>
                  )}
                  {selectedCollection.vector_config?.default?.vector_index_config?.distance_metric && (
                    <Grid item xs={12} sm={6}>
                      <Typography color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>Distance Metric</Typography>
                      <Chip 
                        label={selectedCollection.vector_config.default.vector_index_config.distance_metric}
                        sx={{ 
                          background: 'linear-gradient(135deg, #B4D7F0 0%, #7CB9E8 100%)',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </Grid>
                  )}
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                  🏷️ Properties
                </Typography>
                {selectedCollection.properties && selectedCollection.properties.length > 0 ? (
                  <List>
                    {selectedCollection.properties.map((prop, idx) => (
                      <ListItem key={idx} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {prop.name}
                        </Typography>
                        <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                          <Chip label={prop.data_type} size="small" color="primary" />
                          {prop.tokenization && (
                            <Chip label={`tokenization: ${prop.tokenization}`} size="small" variant="outlined" />
                          )}
                        </Box>
                        {prop.description && (
                          <Typography variant="body2" color="text.secondary" mt={1}>
                            {prop.description}
                          </Typography>
                        )}
                        {(prop.index_filterable || prop.index_searchable || prop.index_range_filters) && (
                          <Box display="flex" gap={1} mt={1}>
                            {prop.index_filterable && <Chip label="Filterable" size="small" />}
                            {prop.index_searchable && <Chip label="Searchable" size="small" />}
                            {prop.index_range_filters && <Chip label="Range Filters" size="small" />}
                          </Box>
                        )}
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary">No properties defined</Typography>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Typography color="text.secondary" align="center" sx={{ py: 8 }}>
                  Select a collection to view details
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            m: { xs: 2, sm: 4 },
          },
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: '1.125rem', sm: '1.5rem' } }}>Delete Collection</DialogTitle>
        <DialogContent>
          <Typography gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Are you sure you want to delete the collection{' '}
            <strong>{collectionToDelete}</strong>?
          </Typography>
          <Typography sx={{ color: '#D32F2F', fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }} gutterBottom>
            This action cannot be undone!
          </Typography>
          <TextField
            fullWidth
            label={`Type "${collectionToDelete}" to confirm`}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            sx={{ mt: 2 }}
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={confirmText !== collectionToDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
