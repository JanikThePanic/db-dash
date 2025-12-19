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

5. open your browser and go to: [http://localhost:5173](http://localhost:5173)

(make sure your weaviate db instance is running and is exposed to a port)

(or not, db dash can connect to docker networks too)

## sample weaviate instance

want to just demo the app?

check out [the static webpage](janik.codes) for a live demo. 

or you can run a sample weaviate db instance locally with some fake data:

``` bash
cd fef
```

## if you hate docker but wanna run db dash

first off, what is wrong with you?

second, clone the repo, open two terminals, and run the following commands:

``` bash
cd frontend
npm install
npm run dev
```

``` bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

then open your browser to http://localhost:5173

(docker network connections will not work in this mode, only machine localhost connections)

## further devopment

want to contribute? sure! fork the repo and make a pr!

will i be adding features? sure, when i need them myself.

## buy me a coffee

turns out the things i like cost money

paypal.me/[thejanik](https://www.paypal.me/thejanik)