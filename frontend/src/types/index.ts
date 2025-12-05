// API Response Types

export interface Property {
  name: string;
  description: string | null;
  data_type: string;
  index_filterable: boolean;
  index_range_filters: boolean;
  index_searchable: boolean;
  nested_properties: any | null;
  tokenization: string | null;
  vectorizer_config: any | null;
  vectorizer: any | null;
  vectorizer_configs: Record<string, any>;
}

export interface VectorizerConfig {
  vectorizer: string;
  model: Record<string, any>;
  source_properties: string[] | null;
}

export interface VectorIndexConfig {
  multi_vector: any | null;
  quantizer: any | null;
  cleanup_interval_seconds: number;
  distance_metric: string;
  dynamic_ef_min: number;
  dynamic_ef_max: number;
  dynamic_ef_factor: number;
  ef: number;
  ef_construction: number;
  filter_strategy: string;
  flat_search_cutoff: number;
  max_connections: number;
  skip: boolean;
  vector_cache_max_objects: number;
}

export interface VectorConfig {
  vectorizer: VectorizerConfig;
  vector_index_config: VectorIndexConfig;
}

export interface Collection {
  name: string;
  description: string | null;
  generative_config: any | null;
  properties: Property[];
  references: any[];
  reranker_config: any | null;
  vectorizer_config: any | null;
  vectorizer: any | null;
  vector_config: Record<string, VectorConfig>;
}

export interface CollectionResponse {
  collection: Collection;
}

export interface WeaviateObject {
  id: string;
  properties: Record<string, any>;
  vector?: number[];
  collection?: string;
}

export interface ObjectsResponse {
  objects: WeaviateObject[];
  cursor?: string;
  hasMore?: boolean;
}

export interface MetaResponse {
  hostname: string;
  version: string;
  modules?: Record<string, any>;
}

export interface SearchResult {
  id: string;
  properties: Record<string, any>;
  score?: number;
  distance?: number;
  collection?: string;
}

export interface ProjectionPoint {
  id: string;
  coords: number[];
  properties?: Record<string, any>;
}

export interface ProjectionResponse {
  collection: string;
  points: ProjectionPoint[];
  dims: number;
  count: number;
}
