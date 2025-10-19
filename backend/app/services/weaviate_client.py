# All dummy logic for now; swap with real Weaviate SDK later.

# --- Collections / Schema ---
def list_collections():
    return ["Article", "Image", "User"]

def get_collection(name: str):
    if name not in list_collections():
        return None
    return {
        "name": name,
        "vectorizer": "text2vec-openai",
        "props": [{"name": "title", "type": "text"}, {"name": "content", "type": "text"}],
        "sharding": {"replicas": 1, "shards": 3},
    }

def get_schema():
    return {"classes": [get_collection(n) for n in list_collections()]}

def delete_collection(name: str):
    return name in list_collections()

# --- Objects ---
def list_objects(name: str, limit=50, cursor=None, where=None, fields=None, include_vector=False):
    if not get_collection(name):
        return {"items": [], "page": {"limit": limit, "nextCursor": None}}
    items = [
        {"id": f"{name.lower()}-{i:03d}", "properties": {"title": f"{name} {i}", "content": "lorem ipsum"}}
        | ({"vector": [0.1, 0.2, 0.3]} if include_vector else {})
        for i in range(1, min(limit, 10) + 1)
    ]
    return {"items": items, "page": {"limit": limit, "nextCursor": None}}

def get_object(name: str, id: str, include_vector=False):
    if not get_collection(name):
        return None
    obj = {"id": id, "properties": {"title": f"{name} item", "content": "ipsum"}}
    if include_vector:
        obj["vector"] = [0.1, 0.2, 0.3]
    return obj

def get_vector(name: str, id: str):
    if not get_collection(name):
        return None
    return [0.1, 0.2, 0.3]

def delete_object(name: str, id: str):
    return get_collection(name) is not None

# --- Search ---
def search_text(q: str, collection: str | None, limit: int, fields: str | None):
    hits = [
        {"id": f"hit-{i}", "score": 1.0 - i * 0.1, "properties": {"text": f"Result for '{q}' #{i}"}}
        for i in range(min(limit, 5))
    ]
    return {"query": q, "collection": collection, "items": hits}

def near_vector(vector, collection: str | None, limit: int):
    return {
        "anchor": {"vector_dim": len(vector)},
        "collection": collection,
        "items": [{"id": f"vec-{i}", "score": 0.9 - i * 0.05} for i in range(min(limit, 5))],
    }

def near_object(collection: str, id: str, limit: int):
    if not get_collection(collection):
        return None
    return {"anchor": {"collection": collection, "id": id},
            "items": [{"id": f"near-{i}", "score": 0.88 - i * 0.04} for i in range(min(limit, 5))]}

# --- Projection ---
def project_vectors(collection: str, limit: int, dims: int, include_props=None):
    points = [{"id": f"{collection}-{i}", "x": i * 0.01, "y": i * -0.01, "z": (i % 3) * 0.01} for i in range(limit)]
    return {"points": points if dims == 3 else [{"id": p["id"], "x": p["x"], "y": p["y"]} for p in points],
            "meta": {"method": "dummy-pca", "dims": dims}}

# --- Meta ---
def get_meta():
    return {
        "weaviate": {"version": "1.x-dummy", "modules": ["text2vec-openai"], "host": "localhost:8080"},
        "counts": {"Article": 123, "Image": 45, "User": 7},
    }

def ping():
    return True
