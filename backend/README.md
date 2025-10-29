# welcome to the back end

for dev run (windows), first time setup:

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r .\requirements.txt
uvicorn app.main:app --reload
```

otherwise:

```bash
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --reload
```

can test just the backend at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
