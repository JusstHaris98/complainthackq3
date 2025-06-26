# Complaint Agent

This project provides a FastAPI-based AI agent for FCA-compliant complaint analysis, powered by a local Ollama model, along with a React-based front-end for real-time monitoring and validation.

## How It Works

- The **Backend** is a Python FastAPI server that serves the agent logic with WebSocket support for real-time updates.
- The **Agent** uses the `ollama` library to connect to a local large language model. It uses a system prompt from `prompt.txt` to analyze user complaints.
- The **Frontend** is a React + Vite application that provides a user interface for submitting complaints, viewing the agent's live "thinking" process, complaint history, and human validation workflow.
- **Real-time Communication** via WebSockets enables live streaming of agent analysis steps.
- **Human Validation** system allows reviewers to approve/reject AI analysis with feedback notes.

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

#### Option 1: Automated Start (Recommended)

Use the provided startup script that automatically handles port conflicts and service management:

```bash
./start.sh
```

This script will:
- Check for prerequisites (virtual environment, Ollama)
- Start Ollama service if not running
- Find available ports if defaults are in use
- Start backend and frontend servers
- Display service URLs and status

#### Option 2: Manual Start

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

You can now submit complaints, watch the agent process them in real time, view complaint history, and perform human validation of AI analysis results.

## API Endpoints

- `POST /complaint/analyze` — Analyze complaint with real-time WebSocket streaming
- `GET /complaint/history` — Get complaint analysis history  
- `POST /complaint/{complaint_id}/validate` — Submit human validation (approve/reject) for AI analysis
- `GET /complaint/mock-agents` — Get mock Athena data
- `GET /complaint/agents` — List available agents
- `GET /complaint/test` — Health check endpoint
- `WebSocket /ws/logs` — Real-time log streaming for live analysis updates

## Features

- **Real-time Analysis**: Watch AI agent processing steps live via WebSocket connection
- **Complaint History**: View all previously analyzed complaints
- **Human Validation**: Approve or reject AI analysis with feedback notes
- **FCA Compliance**: Built-in regulatory compliance checking and categorization
- **Mock Data**: Athena mock data integration for testing
- **Responsive UI**: Modern React frontend with real-time updates

## Project Structure

```
complainthackq3/
├── agents/                 # AI agent implementations
│   ├── complaint_agent.py  # Main complaint analysis agent
│   └── mock_athena_agent.py # Mock Athena data agent
├── frontend/              # React + Vite frontend
├── models/                # Pydantic data models
├── services/              # Business logic services
├── treatment/             # Treatment and prompt templates
├── tests/                 # Test files
├── main.py               # FastAPI application entry point
├── start.sh              # Automated startup script
└── requirements.txt      # Python dependencies
```

Enjoy!