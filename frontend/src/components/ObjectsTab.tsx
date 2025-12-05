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
  useMediaQuery,
  useTheme,
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

// Helper to get ID from object (supports both uuid and id fields)
const getObjectId = (obj: WeaviateObject | SearchResult): string => {
  return obj.uuid || obj.id || '';
};

export default function ObjectsTab() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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

  const handleViewDetails = (obj: WeaviateObject | SearchResult) => {
    setSelectedObject(obj as WeaviateObject);
    setDetailsOpen(true);
  };

  const renderObjectProperties = (properties: Record<string, any>) => {
    return (
      <TableContainer component={Paper} sx={{ mt: 2, overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: { xs: 250, sm: 400 } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Property</TableCell>
              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(properties).map(([key, value]) => (
              <TableRow key={key}>
                <TableCell component="th" scope="row" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  <strong>{key}</strong>
                </TableCell>
                <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, wordBreak: 'break-word' }}>
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
    <Stack spacing={{ xs: 2, md: 4 }} sx={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      <Box>
        <Typography variant="h4" sx={{ mb: 0.5, fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
          Objects & Search
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Browse, search, and explore your data objects
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>}

      <Card sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
        <CardContent sx={{ p: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={(_, v) => setTabValue(v)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              mb: 2,
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                fontSize: { xs: '0.8rem', sm: '1rem' },
                minWidth: { xs: 90, sm: 160 },
                px: { xs: 1, sm: 2 },
              },
            }}
          >
            <Tab label={isMobile ? "📋 Browse" : "📋 Browse Objects"} />
            <Tab label={isMobile ? "🔍 Search" : "🔍 Text Search"} disabled />
            <Tab label={isMobile ? "🎯 Near" : "🎯 Near Object Search"} disabled />
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
                  inputProps={{ min: 1, max: 5000 }}
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
              <TableContainer component={Paper} sx={{ mt: 3, overflowX: 'auto' }}>
                <Table sx={{ minWidth: { xs: 300, sm: 650 } }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, width: 50 }}>#</TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>ID</TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Properties</TableCell>
                      <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {objects.map((obj, index) => {
                      const objectId = getObjectId(obj);
                      return (
                      <TableRow key={objectId}>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                            {objectId.substring(0, 8)}...
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1} flexWrap="wrap">
                            {Object.keys(obj.properties).slice(0, 3).map((key) => (
                              <Chip key={key} label={`${key}`} size="small" sx={{ fontSize: { xs: '0.65rem', sm: '0.8125rem' } }} />
                            ))}
                            {Object.keys(obj.properties).length > 3 && (
                              <Chip label={`+${Object.keys(obj.properties).length - 3}`} size="small" sx={{ fontSize: { xs: '0.65rem', sm: '0.8125rem' } }} />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(obj)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );})}
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
              <TableContainer component={Paper} sx={{ mt: 3, overflowX: 'auto' }}>
                <Table sx={{ minWidth: { xs: 300, sm: 650 } }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, width: 50 }}>#</TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>ID</TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Collection</TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', sm: 'table-cell' } }}>Properties</TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Score</TableCell>
                      <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {searchResults.map((result, idx) => {
                      const resultId = getObjectId(result);
                      return (
                      <TableRow key={idx}>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {idx + 1}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                            {resultId.substring(0, 8)}...
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{result.collection}</TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                          <Box display="flex" gap={1} flexWrap="wrap">
                            {Object.keys(result.properties).slice(0, 3).map((key) => (
                              <Chip key={key} label={key} size="small" sx={{ fontSize: { xs: '0.65rem', sm: '0.8125rem' } }} />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {result.score?.toFixed(4) || result.distance?.toFixed(4) || 'N/A'}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(result)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );})}
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
                      <TableCell sx={{ width: 50 }}>#</TableCell>
                      <TableCell>ID</TableCell>
                      <TableCell>Properties</TableCell>
                      <TableCell>Distance</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {searchResults.map((result, idx) => {
                      const resultId = getObjectId(result);
                      return (
                      <TableRow key={idx}>
                        <TableCell>
                          {idx + 1}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {resultId.substring(0, 8)}...
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
                            onClick={() => handleViewDetails(result)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );})}
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
        fullScreen={false}
        sx={{
          '& .MuiDialog-paper': {
            m: { xs: 2, sm: 4 },
            maxHeight: { xs: '90vh', sm: '90vh' },
          },
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: '1.125rem', sm: '1.5rem' } }}>
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
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  ID
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: { xs: '0.75rem', sm: '0.875rem' }, wordBreak: 'break-all' }}>
                  {getObjectId(selectedObject)}
                </Typography>
              </Box>

              {selectedObject.collection && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Collection
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{selectedObject.collection}</Typography>
                </Box>
              )}

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Properties
                </Typography>
                {renderObjectProperties(selectedObject.properties)}
              </Box>

              {selectedObject.vector && Array.isArray(selectedObject.vector) && selectedObject.vector.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Vector (first 10 dimensions)
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: { xs: '0.65rem', sm: '0.75rem' }, wordBreak: 'break-all' }}>
                    [{selectedObject.vector.slice(0, 10).map(v => v.toFixed(4)).join(', ')}
                    {selectedObject.vector.length > 10 && `, ... (${selectedObject.vector.length} total)`}]
                  </Typography>
                </Box>
              )}

              {selectedObject.metadata && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Metadata
                  </Typography>
                  {renderObjectProperties(Object.fromEntries(
                    Object.entries(selectedObject.metadata).filter(([_, v]) => v !== null)
                  ))}
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
