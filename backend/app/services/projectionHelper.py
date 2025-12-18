
"""
Helpers for projecting vectors into lower dimensions for visualization.
"""

from typing import List, Optional
from pydantic import BaseModel

import numpy as np
import umap

from app.services.WeaviateClient import weaviate_client as wc

class ProjectionBody(BaseModel):
    collection: str
    limit: int = 500
    dims: int = 3
    includeProps: Optional[List[str]] = None

def project_vectors(projection_config: ProjectionBody) -> dict | None:
    """ Project vectors from a specific collection into lower dimensions for visualization. """
    collection_name = projection_config.collection
    limit = projection_config.limit
    dims = projection_config.dims
    include_props = projection_config.includeProps

    collection = wc.client.collections.use(collection_name)
    if collection is None:
        return None
    
    # Perform the projection
    
    # 1. Fetch objects + vectors
    response = collection.query.fetch_objects(
        limit=limit,
        include_vector=True,
        return_properties=include_props,
    )

    vectors = []
    payload = []

    for obj in response.objects:
        if obj.vector is None:
            continue

        # Handle both list vectors and dict vectors (named vectors in Weaviate)
        vector = obj.vector
        if isinstance(vector, dict):
            # If vector is a dict, get the first value (main vector)
            vector = next(iter(vector.values())) if vector else None
            if vector is None:
                continue

        vectors.append(vector)
        payload.append({
            "id": obj.uuid,
            "properties": obj.properties,
        })

    if len(vectors) < dims:
        return None

    X = np.array(vectors)

    # 2. UMAP dimensionality reduction
    reducer = umap.UMAP(
        n_components=dims,
        n_neighbors=15,
        min_dist=0.1,
        metric="cosine",
        random_state=42,
    )

    X_proj = reducer.fit_transform(X)

    # 3. Combine projection + metadata
    points = []
    for i, point in enumerate(X_proj):
        points.append({
            "x": float(point[0]),
            "y": float(point[1]),
            "z": float(point[2]) if dims == 3 else None,
            **payload[i],
        })

    return {
        "dims": dims,
        "count": len(points),
        "points": points,
    }