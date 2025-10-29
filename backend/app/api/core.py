from fastapi import APIRouter

router = APIRouter(tags=["core"])

@router.get("/database/url")
def get_database_url():
    """ Get the current Weaviate database URL. """
    # retrieve from config or something
    return {"url": "http://localhost:8080"}

@router.post("/database/url")
def set_database_url(url: str):
    """ Set the Weaviate database URL. """
    # save to config or something
    return {"message": "Database URL set successfully"}

@router.get("/database/port")
def get_database_port():
    """ Get the current Weaviate database port. """
    # retrieve from config or something
    return {"port": 8080}

@router.post("/database/port")
def set_database_port(port: int):
    """ Set the Weaviate database port. """
    # save to config or something
    return {"message": "Database port set successfully"}

@router.get("/key")
def list_keys_stored():
    """ List all keys stored in the system. """
    # retrieve keys from secure storage
    return {"keys": ["key1", "key2"]}

@router.post("/key")
def add_key(name: str, value: str):
    """ Add a new key to the system. """
    # store key in secure storage
    return {"message": f"Key {name} added successfully"}

@router.delete("/key")
def delete_key(name: str):
    """ Delete a key from the system by name. """
    # remove key from secure storage
    return {"message": f"Key {name} deleted successfully"}