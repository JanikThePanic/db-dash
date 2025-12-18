# db-dash

<p align="left">
    <img src="frontend/favicon.svg" alt="Database Dashboard" width="100" height="100">
</p>

i use [weaviate](https://docs.weaviate.io/weaviate/quickstart/local) a lot at work but theres no good local gui

so heres a vibe-coded frontend + my python backend to the rescue

## user guide

1. install [docker](https://www.docker.com/products/docker-desktop/)

2. download the ```docker-compose.yml``` file from this repo

3. cmd into the folder where you downloaded the ```docker-compose.yml``` file

4. run the following command to start the app: ```docker compose up -d```

(make sure your weaviate db instance is running and is exposed to a port)
(or not, db dash can connect to docker networks too)

## sample weaviate instance

want to just demo the app?

check out [the static webpage](janik.codes) for a live demo. 

or you can run a sample weaviate db instance locally with some fake data:

``` bash
cd fef
```
