
"""
Helper functions for managing collections in Weaviate.
"""

from app.services.WeaviateClient import weaviate_client as wc
from app.services.collectionsHelper import collection_exists

def list_objects(
    name: str,
    limit: int = 50
) -> list | None:
    """ List objects in a specific collection. """
    collection = wc.client.collections.use(name)
    if collection is None:
        return None
    objs = collection.query.fetch_objects(limit=limit)
    return objs