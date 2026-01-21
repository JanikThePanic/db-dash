import weaviate
from weaviate.config import AdditionalConfig, Timeout

from app.core.Config import config

class Weaviate:
    """
    Client wrapper for Weaviate operations.
    """

    def __init__(self):
        """
        Initialize Weaviate client wrapper (connection happens lazily).
        """
        self.client: weaviate.WeaviateClient | None = None
        self._connection_attempted = False
        self._current_host = None
        self._current_port = None
        self.connect_weaviate()

    def get_client(self):
        """
        Get or create the Weaviate client connection (lazy initialization).
        Automatically reconnects if configuration has changed.
        """
        # Check if configuration has changed
        if (self._current_host != config.database_url or 
            self._current_port != config.database_port):
            self.reconnect()
        
        if not self._connection_attempted:
            self.connect_weaviate()
        return self.client

    def disconnect(self):
        """
        Disconnect from the current Weaviate instance.
        """
        if self.client:
            try:
                self.client.close()
            except Exception as e:
                print(f"Warning: Error closing Weaviate client: {e}")
            finally:
                self.client = None
                self._connection_attempted = False
                self._current_host = None
                self._current_port = None

    def reconnect(self):
        """
        Reconnect to Weaviate with new configuration settings.
        """
        self.disconnect()
        self.connect_weaviate()

    def connect_weaviate(self):
        """
        Connect to Weaviate instance using configuration settings.
        """
        if self._connection_attempted:
            return
        
        try:
            HTTP_HOST = config.database_url
            HTTP_PORT = config.database_port
            
            # Configure with shorter timeout
            additional_config = AdditionalConfig(
                timeout=Timeout(init=3, query=5, insert=5, update=5, delete=5)
            )

            # if user trying to connect to localhost from within docker container, use host.docker.internal
            if HTTP_HOST in ["localhost", "127.0.0.1"]:
                HTTP_HOST = "host.docker.internal"
            
            client = weaviate.connect_to_local(
                host=HTTP_HOST,
                port=HTTP_PORT,
                additional_config=additional_config,
                # skip_init_checks=True
            )
            self.client = client
            self._current_host = HTTP_HOST
            self._current_port = HTTP_PORT
            self._connection_attempted = True
        except Exception as e:
            print(f"Warning: Could not connect to Weaviate: {e}")
            self.client = None
            self._current_host = None
            self._current_port = None

    def get_meta(self):
        """
        Get metadata about the Weaviate instance.
        """
        client = self.get_client()
        return client.get_meta() if client else None
    
    def ping(self):
        """
        Ping the Weaviate instance to check connectivity.
        """
        client = self.get_client()
        return client.is_ready() if client else False
            
weaviate_client = Weaviate()