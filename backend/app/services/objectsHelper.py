
"""
Helper functions for managing collections in Weaviate.
"""

from app.services.WeaviateClient import weaviate_client as wc

from weaviate.classes.query import Sort

def list_objects(
    name: str,
    limit: int = 50
) -> list | None:
    """ List objects in a specific collection. """

    # Cap the limit at 5000
    if limit > 5000:
        limit = 5000

    collection = wc.client.collections.use(name)
    if collection is None:
        return None
    objs = collection.query.fetch_objects(limit=limit, 
        sort=Sort.by_property(name="_creationTimeUnix", ascending=False))
    return objs