# Complaint Agent

This project provides a FastAPI-based AI agent for FCA-compliant complaint analysis, powered by a local Ollama model, along with a React-based front-end for real-time monitoring.

## How It Works

- The **Backend** is a Python FastAPI server that serves the agent logic.
- The **Agent** uses the `ollama` library to connect to a local large language model. It uses a system prompt from `prompt.txt` to analyze user complaints.
- The **Frontend** is a React + Vite application that provides a user interface for submitting complaints and viewing the agent's live "thinking" process and history.

## Setup and Run

### 1. Prerequisites

- **Python** (3.8+)
- **Node.js** and **npm**
- **Ollama**: Make sure Ollama is installed and running with your desired model (e.g., `llama3`, `mistral`).

### 2. Backend Setup

From the project root directory:

a. **Create and activate a virtual environment**:
   - On macOS/Linux:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
   - On Windows:
     ```bash
     py -m venv venv
     venv\Scripts\activate
     ```

b. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

c. **Configure the Agent**:
   - Open `agents/complaint_agent.py`.
   - Change the placeholder in `model='YOUR_MODEL_NAME_HERE'` to your actual Ollama model name (e.g., `model='llama3'`).

### 3. Frontend Setup

In a **new terminal**, navigate to the `frontend` directory:

a. **Install Node.js dependencies**:
   ```bash
   cd frontend
   npm install
   ```

### 4. Running the Application

You need to have **three terminals** open and running simultaneously:

1.  **Ollama**: Ensure the Ollama service is running.
2.  **Backend Server**: In the project root, run:
    ```bash
    uvicorn main:app --reload
    ```
3.  **Frontend Server**: In the `frontend` directory, run:
    ```bash
    npm run dev
    ```

### 5. Access the UI

Open your browser and navigate to:
```
http://localhost:5173
```

You can now submit complaints and watch the agent process them in real time.

## Endpoints

- `POST /complaint/analyze` — analyze complaint
- `GET /complaint/mock-agents` — mock Athena data
- `GET /complaint/agents` — list agents
- `GET /complaint/test` — health check

Enjoy!