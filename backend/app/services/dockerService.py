import docker
import socket

def list_docker_networks() -> list[str]:
    """List available Docker networks."""
    client = docker.from_env()
    networks = client.networks.list()

    # Filter out default/internal networks
    return [
        n.name
        for n in networks
        if n.name not in {"bridge", "host", "none", "proxy"}
    ]


def connect_to_network(network_name: str):
    """Connect the current container to a Docker network."""
    client = docker.from_env()

    # Docker sets hostname == container_id (short)
    container_id = socket.gethostname()
    container = client.containers.get(container_id)

    network = client.networks.get(network_name)

    # Networks is already a dict keyed by name
    if network_name in container.attrs["NetworkSettings"]["Networks"]:
        return  # already connected

    network.connect(container)
