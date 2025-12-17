from fastapi import APIRouter

from app.core.Config import config
import app.services.dockerService as dockerService

router = APIRouter(tags=["core"])

@router.get("/database/url")
def get_database_url():
    """ Get the current Weaviate database URL. """
    return {"url": config.database_url}

@router.post("/database/url")
def set_database_url(url: str):
    """ Set the Weaviate database URL. """
    config.database_url = url
    return {"message": "Database URL set successfully"}

@router.get("/database/port")
def get_database_port():
    """ Get the current Weaviate database port. """
    return {"port": config.database_port}

@router.post("/database/port")
def set_database_port(port: int):
    """ Set the Weaviate database port. """
    config.database_port = port
    return {"message": "Database port set successfully"}

@router.get("/keys")
def list_keys_stored():
    """ List all keys stored in the system. """
    return {"keys": list(config.api_keys.keys())}

@router.post("/key")
def add_key(name: str, value: str):
    """ Add a new key to the system. """
    if config.add_api_key(name, value):
        return {"message": f"Key {name} added successfully"}
    return {"message": f"Key {name} overwritten successfully"}

@router.delete("/key")
def delete_key(name: str):
    """ Delete a key from the system by name. """
    config.remove_api_key(name)
    return {"message": f"Key {name} deleted successfully"}

@router.get("/docker/networks")
def list_docker_networks():
    """ List available Docker networks. """
    return {"networks": dockerService.list_docker_networks()}

@router.get("/docker/network")
def get_docker_network():
    """ Get the current Docker network setting. """
    return {"network": config.docker_network}

@router.post("/docker/network")
def set_docker_network(network: str):
    """ Set the Docker network setting. """
    config.docker_network = network
    dockerService.connect_to_network(network)
    return {"message": "Docker network set successfully"}

@router.delete("/docker/network")
def clear_docker_network():
    """ Clear the Docker network setting. """
    config.docker_network = ""
    return {"message": "Docker network cleared successfully"}