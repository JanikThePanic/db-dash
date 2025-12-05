
"""
Helper functions for managing collections in Weaviate.
"""

from app.services.WeaviateClient import weaviate_client as wc

def list_collections() -> list:
    """ List all collections in Weaviate. """
    collections = wc.client.collections.list_all()
    return [collection.name for collection in collections.values()]

def collection_exists(name: str) -> dict | None:
    """ Check if a collection exists in Weaviate. Return details. """
    collection = wc.client.collections.use(name).config.get()
    return collection

def delete_collection(name: str) -> bool:
    """ Delete a collection by name in Weaviate. Return True if deleted. """
    wc.client.collections.delete(name)
    return True