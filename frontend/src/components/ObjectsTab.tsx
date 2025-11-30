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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Chip,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  listCollections,
  listObjects,
  searchText,
  searchNearObject,
  getObject,
} from '../services/api';
import type { WeaviateObject, SearchResult } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

export default function ObjectsTab() {
  const [collections, setCollections] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [objects, setObjects] = useState<WeaviateObject[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Browse tab state
  const [limit, setLimit] = useState(50);

  // Search tab state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCollection, setSearchCollection] = useState('');

  // Near Object tab state
  const [nearObjectCollection, setNearObjectCollection] = useState('');
  const [nearObjectId, setNearObjectId] = useState('');
  const [nearObjectLimit, setNearObjectLimit] = useState(10);

  // Object details dialog
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedObject, setSelectedObject] = useState<WeaviateObject | null>(null);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const response = await listCollections();
      setCollections(response.data.collections);
      if (response.data.collections.length > 0 && !selectedCollection) {
        setSelectedCollection(response.data.collections[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load collections');
    }
  };

  const handleBrowse = async () => {
    if (!selectedCollection) return;
    setLoading(true);
    setError(null);
    try {
      const response = await listObjects(selectedCollection, { limit });
      setObjects(response.data.objects || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load objects');
    } finally {
      setLoading(false);
    }
  };

  const handleTextSearch = async () => {
    if (!searchQuery) return;
    setLoading(true);
    setError(null);
    try {
      const response = await searchText(
        searchQuery,
        searchCollection || undefined,
        10
      );
      setSearchResults(response.data.results || []);
    } catch (err: any) {
      setError(err.message || 'Failed to search');
    } finally {
      setLoading(false);
    }
  };

  const handleNearObjectSearch = async () => {
    if (!nearObjectCollection || !nearObjectId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await searchNearObject(
        nearObjectCollection,
        nearObjectId,
        nearObjectLimit
      );
      setSearchResults(response.data.results || []);
    } catch (err: any) {
      setError(err.message || 'Failed to search near object');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (collectionName: string, id: string) => {
    try {
      const response = await getObject(collectionName, id, true);
      setSelectedObject(response.data);
      setDetailsOpen(true);
    } catch (err: any) {
      setError(err.message || 'Failed to load object details');
    }
  };

  const renderObjectProperties = (properties: Record<string, any>) => {
    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Property</TableCell>
              <TableCell>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(properties).map(([key, value]) => (
              <TableRow key={key}>
                <TableCell component="th" scope="row">
                  <strong>{key}</strong>
                </TableCell>
                <TableCell>
                  {typeof value === 'object'
                    ? JSON.stringify(value)
                    : String(value)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h4" sx={{ mb: 0.5 }}>Objects & Search</Typography>
        <Typography variant="body2" color="text.secondary">Browse, search, and explore your data objects</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>}

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={(_, v) => setTabValue(v)}
            sx={{
              mb: 2,
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
              },
            }}
          >
            <Tab label="📋 Browse Objects" />
            <Tab label="🔍 Text Search" />
            <Tab label="🎯 Near Object Search" />
          </Tabs>

          {/* Browse Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Collection</InputLabel>
                  <Select
                    value={selectedCollection}
                    onChange={(e) => setSelectedCollection(e.target.value)}
                    label="Collection"
                  >
                    {collections.map((name) => (
                      <MenuItem key={name} value={name}>
                        {name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Limit"
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleBrowse}
                  disabled={!selectedCollection || loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
                >
                  Load
                </Button>
              </Grid>
            </Grid>

            {objects.length > 0 && (
              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Properties</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {objects.map((obj) => (
                      <TableRow key={obj.id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {obj.id.substring(0, 8)}...
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1} flexWrap="wrap">
                            {Object.keys(obj.properties).slice(0, 3).map((key) => (
                              <Chip key={key} label={`${key}`} size="small" />
                            ))}
                            {Object.keys(obj.properties).length > 3 && (
                              <Chip label={`+${Object.keys(obj.properties).length - 3}`} size="small" />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(selectedCollection, obj.id)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          {/* Text Search Tab */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Search Query"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTextSearch()}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Collection (optional)</InputLabel>
                  <Select
                    value={searchCollection}
                    onChange={(e) => setSearchCollection(e.target.value)}
                    label="Collection (optional)"
                  >
                    <MenuItem value="">All Collections</MenuItem>
                    {collections.map((name) => (
                      <MenuItem key={name} value={name}>
                        {name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleTextSearch}
                  disabled={!searchQuery || loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                >
                  Search
                </Button>
              </Grid>
            </Grid>

            {searchResults.length > 0 && (
              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Collection</TableCell>
                      <TableCell>Properties</TableCell>
                      <TableCell>Score</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {searchResults.map((result, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {result.id.substring(0, 8)}...
                          </Typography>
                        </TableCell>
                        <TableCell>{result.collection}</TableCell>
                        <TableCell>
                          <Box display="flex" gap={1} flexWrap="wrap">
                            {Object.keys(result.properties).slice(0, 3).map((key) => (
                              <Chip key={key} label={key} size="small" />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {result.score?.toFixed(4) || result.distance?.toFixed(4) || 'N/A'}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(result.collection || '', result.id)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          {/* Near Object Search Tab */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={5}>
                <FormControl fullWidth>
                  <InputLabel>Collection</InputLabel>
                  <Select
                    value={nearObjectCollection}
                    onChange={(e) => setNearObjectCollection(e.target.value)}
                    label="Collection"
                  >
                    {collections.map((name) => (
                      <MenuItem key={name} value={name}>
                        {name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Object ID"
                  value={nearObjectId}
                  onChange={(e) => setNearObjectId(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={1}>
                <TextField
                  fullWidth
                  type="number"
                  label="Limit"
                  value={nearObjectLimit}
                  onChange={(e) => setNearObjectLimit(Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleNearObjectSearch}
                  disabled={!nearObjectCollection || !nearObjectId || loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                >
                  Search
                </Button>
              </Grid>
            </Grid>

            {searchResults.length > 0 && (
              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Properties</TableCell>
                      <TableCell>Distance</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {searchResults.map((result, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {result.id.substring(0, 8)}...
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1} flexWrap="wrap">
                            {Object.keys(result.properties).slice(0, 3).map((key) => (
                              <Chip key={key} label={key} size="small" />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {result.distance?.toFixed(4) || 'N/A'}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(nearObjectCollection, result.id)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
        </CardContent>
      </Card>

      {/* Object Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Object Details
          <IconButton
            aria-label="close"
            onClick={() => setDetailsOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedObject && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  ID
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {selectedObject.id}
                </Typography>
              </Box>

              {selectedObject.collection && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Collection
                  </Typography>
                  <Typography variant="body2">{selectedObject.collection}</Typography>
                </Box>
              )}

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Properties
                </Typography>
                {renderObjectProperties(selectedObject.properties)}
              </Box>

              {selectedObject.vector && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Vector (first 10 dimensions)
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    [{selectedObject.vector.slice(0, 10).map(v => v.toFixed(4)).join(', ')}
                    {selectedObject.vector.length > 10 && `, ... (${selectedObject.vector.length} total)`}]
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
