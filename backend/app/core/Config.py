class Config:
    """
    Singleton configuration class for application settings.
    """

    def __init__(self):
        self._database_url = "localhost"
        self._database_port = 3131
        self._api_keys = {}
        self._docker_network = ""

    @property
    def database_url(self) -> str:
        return self._database_url
    
    @database_url.setter
    def database_url(self, url: str):
        self._database_url = url
        
    @property
    def database_port(self) -> int:
        return self._database_port
    
    @database_port.setter
    def database_port(self, port: int):
        self._database_port = port

    @property
    def api_keys(self) -> dict:
        return self._api_keys
    
    def add_api_key(self, name: str, value: str) -> bool:
        if name not in self._api_keys:
            self._api_keys[name] = value
            return True
        self._api_keys[name] = value
        return False
        
    def remove_api_key(self, name: str):
        if name in self._api_keys:
            del self._api_keys[name]
    
    @property
    def docker_network(self) -> str:
        return self._docker_network
    
    @docker_network.setter
    def docker_network(self, network: str):
        self._docker_network = network

# Singleton instance
config = Config()