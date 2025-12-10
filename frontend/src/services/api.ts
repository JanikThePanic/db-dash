import axios from 'axios';
import type {
  Collection,
  CollectionResponse,
  WeaviateObject,
  ObjectsResponse,
  MetaResponse,
  SearchResult,
  ProjectionResponse,
} from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Health & Meta
export const healthCheck = () => axios.get('http://localhost:8000/health');
export const getMeta = () => api.get<MetaResponse>('/meta');
export const ping = () => api.get('/ping');

// Collections
export const listCollections = () => api.get<{ collections: string[] }>('/collections');
export const getCollection = (name: string) => api.get<{ collection: Collection }>(`/collections/${name}`);
export const deleteCollection = (name: string, confirm: string) =>
  api.delete(`/collections/${name}`, { params: { confirm } });

// Objects
export const listObjects = (
  collectionName: string,
  params?: {
    limit?: number;
    cursor?: string;
    where?: string;
    fields?: string;
    include_vector?: boolean;
  }
) => api.get<ObjectsResponse>(`/collections/${collectionName}/objects`, { params });

export const getObject = (collectionName: string, id: string, includeVector = false) =>
  api.get<WeaviateObject>(`/collections/${collectionName}/objects/${id}`, {
    params: { include_vector: includeVector },
  });

export const getVector = (collectionName: string, id: string) =>
  api.get<{ id: string; vector: number[] }>(`/collections/${collectionName}/objects/${id}/vector`);

export const deleteObject = (collectionName: string, id: string, hard = false, dryRun = false) =>
  api.delete(`/collections/${collectionName}/objects/${id}`, {
    params: { hard, dry_run: dryRun },
  });

// Search
export const searchText = (
  q: string,
  collection?: string,
  limit = 10,
  fields?: string
) =>
  api.get<{ results: SearchResult[] }>('/search/text', {
    params: { q, collection, limit, fields },
  });

export const searchNearVector = (vector: number[], collection?: string, limit = 10) =>
  api.post<{ results: SearchResult[] }>('/search/near-vector', {
    vector,
    collection,
    limit,
  });

export const searchNearObject = (collection: string, id: string, limit = 10) =>
  api.post<{ results: SearchResult[] }>('/search/near-object', {
    collection,
    id,
    limit,
  });

// Projection
export const getProjection = (
  collection: string,
  limit = 500,
  dims = 3,
  includeProps?: string[]
) =>
  api.post<ProjectionResponse>('/projection', {
    collection,
    limit,
    dims,
    includeProps,
  });

// Core/Database
export const getDatabaseUrl = () => api.get<{ url: string }>('/database/url');
export const setDatabaseUrl = (url: string) => api.post('/database/url', null, { params: { url } });
export const getDatabasePort = () => api.get<{ port: number }>('/database/port');
export const setDatabasePort = (port: number) => api.post('/database/port', null, { params: { port } });

// Docker
export const listDockerNetworks = () => api.get<{ networks: string[] }>('/docker/networks');
export const getDockerNetwork = () => api.get<{ network: string }>('/docker/network');
export const setDockerNetwork = (network: string) => api.post('/docker/network', null, { params: { network } });
export const clearDockerNetwork = () => api.delete<{ message: string }>('/docker/network');

// Keys
export const listKeys = () => api.get<{ keys: string[] }>('/keys');
export const addKey = (name: string, value: string) => api.post('/key', null, { params: { name, value } });
export const deleteKey = (name: string) => api.delete<{ message: string }>('/key', { params: { name } });

export default api;
