import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { listCollections, getProjection } from '../services/api';
import type { ProjectionPoint } from '../types';

interface PointCloudProps {
  points: ProjectionPoint[];
  selectedPoint: ProjectionPoint | null;
  onPointClick: (point: ProjectionPoint) => void;
}

function PointCloud({ points, selectedPoint, onPointClick }: PointCloudProps) {
  const meshRef = useRef<THREE.Points>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  // Create geometry from points
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(points.flatMap((p) => p.coords));
  const colors = new Float32Array(
    points.flatMap((p, i) => {
      if (selectedPoint && p.id === selectedPoint.id) {
        return [1, 0.2, 0.6]; // Bright magenta/pink for selected
      }
      if (hovered === i) {
        return [1, 0.5, 0]; // Bright orange for hovered
      }
      return [0.5, 0.8, 1]; // Pastel blue for normal
    })
  );

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  useFrame(() => {
    if (meshRef.current) {
      // Subtle rotation animation
      meshRef.current.rotation.y += 0.001;
    }
  });

  const handlePointerMove = (event: any) => {
    const index = event.index;
    setHovered(index);
  };

  const handlePointerOut = () => {
    setHovered(null);
  };

  const handleClick = (event: any) => {
    const index = event.index;
    if (index !== undefined && points[index]) {
      onPointClick(points[index]);
    }
  };

  return (
    <points
      ref={meshRef}
      geometry={geometry}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.8} />
    </points>
  );
}

function Grid3D() {
  return (
    <>
      <gridHelper args={[20, 20, 0x444444, 0x222222]} />
      <axesHelper args={[5]} />
    </>
  );
}

export default function ThreeDViewTab() {
  const [collections, setCollections] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [points, setPoints] = useState<ProjectionPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<ProjectionPoint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Projection settings
  const [limit, setLimit] = useState(500);
  const [dims, setDims] = useState(3);
  const [includeProps, setIncludeProps] = useState<string>('');

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const response = await listCollections();
      setCollections(response.data.collections);
      if (response.data.collections.length > 0) {
        setSelectedCollection(response.data.collections[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load collections');
    }
  };

  const handleProjection = async () => {
    if (!selectedCollection) return;
    setLoading(true);
    setError(null);
    setSelectedPoint(null);

    try {
      const propsArray = includeProps
        ? includeProps.split(',').map((p) => p.trim()).filter(Boolean)
        : undefined;

      const response = await getProjection(selectedCollection, limit, dims, propsArray);
      setPoints(response.data.points || []);
    } catch (err: any) {
      setError(err.message || 'Failed to project vectors');
      setPoints([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePointClick = (point: ProjectionPoint) => {
    setSelectedPoint(point);
  };

  return (
    <Stack spacing={{ xs: 2, md: 4 }} sx={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      <Box>
        <Typography variant="h4" sx={{ mb: 0.5, fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
          3D Vector Projection
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Visualize your vector embeddings in 3D space
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>}

      <Card>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
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

            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                type="number"
                label="Limit"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                inputProps={{ min: 10, max: 5000 }}
              />
            </Grid>

            <Grid item xs={12} sm={2}>
              <FormControl fullWidth>
                <InputLabel>Dimensions</InputLabel>
                <Select
                  value={dims}
                  onChange={(e) => setDims(Number(e.target.value))}
                  label="Dimensions"
                >
                  <MenuItem value={2}>2D</MenuItem>
                  <MenuItem value={3}>3D</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Properties (comma-separated)"
                value={includeProps}
                onChange={(e) => setIncludeProps(e.target.value)}
                placeholder="prop1, prop2, prop3"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleProjection}
                disabled={!selectedCollection || loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? 'Projecting...' : 'Project Vectors'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {points.length > 0 && (
        <Box sx={{ width: '100%', overflow: 'hidden' }}>
          <Grid container spacing={3}>
          <Grid item xs={12} lg={9}>
            <Card>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  🌌 Vector Space ({points.length} points)
                </Typography>
                <Box sx={{ height: { xs: '400px', sm: '500px', md: '600px' }, width: '100%', bgcolor: '#000' }}>
                  <Canvas>
                    <PerspectiveCamera makeDefault position={[5, 5, 5]} />
                    <OrbitControls enableDamping dampingFactor={0.05} />
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />
                    <Grid3D />
                    <PointCloud
                      points={points}
                      selectedPoint={selectedPoint}
                      onPointClick={handlePointClick}
                    />
                  </Canvas>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                  Click and drag to rotate • Scroll to zoom • Click points to view details
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={3}>
            <Card>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  {selectedPoint ? '🎯 Selected Point' : '📍 Point Details'}
                </Typography>
                {selectedPoint ? (
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                        ID
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace', fontSize: { xs: '0.65rem', sm: '0.75rem' }, wordBreak: 'break-all' }}
                      >
                        {selectedPoint.id}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Coordinates
                      </Typography>
                      <Typography variant="body2">
                        [{selectedPoint.coords.map((c) => c.toFixed(3)).join(', ')}]
                      </Typography>
                    </Box>

                    {selectedPoint.properties && Object.keys(selectedPoint.properties).length > 0 && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          Properties
                        </Typography>
                        <Stack spacing={1}>
                          {Object.entries(selectedPoint.properties).map(([key, value]) => (
                            <Box key={key}>
                              <Typography variant="caption" fontWeight="bold">
                                {key}
                              </Typography>
                              <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                {typeof value === 'object'
                                  ? JSON.stringify(value)
                                  : String(value)}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                ) : (
                  <Typography color="text.secondary" variant="body2">
                    Click on a point in the visualization to view its details
                  </Typography>
                )}
              </CardContent>
            </Card>

            <Card sx={{ mt: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                  🎨 Legend
                </Typography>
                <Stack spacing={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: 'rgb(128, 204, 255)',
                      }}
                    />
                    <Typography variant="body2">Normal point</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: 'rgb(255, 128, 0)',
                      }}
                    />
                    <Typography variant="body2">Hovered point</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: 'rgb(255, 51, 153)',
                      }}
                    />
                    <Typography variant="body2">Selected point</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        </Box>
      )}

      {!loading && points.length === 0 && selectedCollection && (
        <Card>
          <CardContent>
            <Typography color="text.secondary" align="center" sx={{ py: 8 }}>
              Click "Project Vectors" to visualize the vector space
            </Typography>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
