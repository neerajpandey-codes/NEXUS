# NEXUS Backend

This folder contains the FastAPI service. It currently provides a health check
and a single-turn Gemini chat endpoint. It has no database or authentication.

## Requirements

- Python 3.10 or newer
- `pip`

## Create a virtual environment

Run these commands from the `backend` directory. The virtual environment keeps
Python packages for this backend separate from system Python and the frontend.

### Windows PowerShell

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

If PowerShell blocks activation, you can run the environment's Python directly:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

## Run the API

From `backend`, with the virtual environment activated:

```powershell
python -m uvicorn app.main:app --reload
```

The local server listens at `http://127.0.0.1:8000`. Open
`http://127.0.0.1:8000/api/health` to see the status response, or
`http://127.0.0.1:8000/docs` for FastAPI's interactive API documentation.

## Run the test

In a second terminal, from `backend`, activate the virtual environment and run:

```powershell
python -m pytest
```

## Configuration

Copy `.env.example` to `.env` in this `backend` directory and add your own
Gemini API key. `app/core/config.py` loads that file for local development;
process environment variables override values in the file. Keep `.env` private
and never put the Gemini key in the frontend.

The backend reads `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_TIMEOUT_SECONDS`,
`NEXUS_APP_NAME`, `NEXUS_APP_VERSION`, and `NEXUS_API_PREFIX`. The default model
is `gemini-3.8-flash`, and the request timeout is 30 seconds.

`POST /api/chat` accepts `{"message":"your prompt"}` and returns
`{"response":"the model response"}`. Messages must contain 1–8,000
non-whitespace characters. If the server key is missing, the route returns a
safe configuration error; provider details and prompts are not logged. Each
request sends one message; the frontend keeps its existing in-memory history.

Tests mock the Gemini provider and do not need a key. Run them from this folder:

```powershell
.\.venv\Scripts\python.exe -m pytest -q
```

## File guide

- `app/main.py` creates the FastAPI app and mounts the API router.
- `app/api/routes/health.py` defines `GET /api/health`.
- `app/api/routes/chat.py` validates and handles `POST /api/chat`.
- `app/schemas/health.py` validates the JSON returned by that endpoint.
- `app/schemas/chat.py` validates chat request and response bodies.
- `app/core/config.py` centralizes the small set of environment-based settings.
- `app/services/gemini_chat.py` contains the Google Gen AI SDK adapter.
- `tests/` covers health, CORS, chat validation and mocked provider behavior.
- `requirements.txt` lists the runtime and test packages for this backend only.
