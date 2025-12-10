import docker

def list_docker_networks() -> list[str]:
    """ List available Docker networks. """
    client = docker.from_env()
    networks = client.networks.list()

    return [network.name for network in networks]

def connect_to_network(network_name: str):
    """ Connect to a Docker network by name. """
    # placeholder logic; in real implementation, handle connection as needed
    client = docker.from_env()
    try:
        network = client.networks.get(network_name)
        return network
    except docker.errors.NotFound:
        print(f"Network {network_name} not found.")
        return None