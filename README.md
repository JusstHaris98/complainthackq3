# Complaint Agent

This project provides a FastAPI-based AI agent for FCA-compliant complaint analysis,
along with a simple front-end for monitoring and observing submissions.

## Setup and Run

1. **Unzip the project**:
   ```bash
   unzip complaint-agent-ui.zip
   cd complaint-agent
   ```

2. **Create a virtual environment**:
   - If `python` command isn't available, use `python3` or `py`:
     ```bash
     python3 -m venv venv
     # or on Windows:
     py -m venv venv
     ```

3. **Activate the environment**:
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Run the FastAPI application**:
   ```bash
   uvicorn main:app --reload
   ```

6. **Open the UI** at:
   ```
   http://localhost:8000/
   ```

## Endpoints

- `POST /complaint/analyze` — analyze complaint
- `GET /complaint/mock-agents` — mock Athena data
- `GET /complaint/agents` — list agents
- `GET /complaint/test` — health check

Enjoy!