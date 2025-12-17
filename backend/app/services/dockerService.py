import docker

def list_docker_networks() -> list[str]:
    """ List available Docker networks. """
    client = docker.from_env()
    networks = client.networks.list()

    # Filter out bridge, host, proxy, and none networks
    networks = [n for n in networks if n.name not in ["bridge", "host", "none", "proxy"]]

    return [network.name for network in networks]

def connect_to_network(network_name: str):
    """ Connect to a Docker network by name. """
    client = docker.from_env()

    # Get network object
    network = client.networks.get(network_name)

    # Get current container ID
    container_id = _get_current_container_id()
    container = client.containers.get(container_id)

    # Connect if not already connected
    if network_name not in [n['Name'] for n in container.attrs['NetworkSettings']['Networks'].values()]:
        network.connect(container)
        print(f"Connected container {container_id} to network '{network_name}'")
    else:
        print(f"Container is already connected to '{network_name}'.")
    
def _get_current_container_id():
    with open("/proc/self/cgroup", "r") as f:
        for line in f:
            parts = line.strip().split("/")
            if len(parts) > 2:
                return parts[-1]  # container ID
    raise RuntimeError("Could not determine container ID")