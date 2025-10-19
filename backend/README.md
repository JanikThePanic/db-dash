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
