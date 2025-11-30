// API Response Types

export interface Collection {
  name: string;
  properties?: Property[];
  vectorizer?: string;
  vectorIndexType?: string;
  description?: string;
}

export interface Property {
  name: string;
  dataType: string[];
  description?: string;
  indexFilterable?: boolean;
  indexSearchable?: boolean;
  tokenization?: string;
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

export interface SchemaResponse {
  classes?: Collection[];
}
