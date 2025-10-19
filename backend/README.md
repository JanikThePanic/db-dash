# welcome to the back end

for dev run (windows), from root:

```bash
cd backend
```

```bash
python -m venv venv
.\venv\Scripts\activate
pip install -r .\requirements.txt
```

and to start

```py
uvicorn app.main:app --reload
```

can test just the backend at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
