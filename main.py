from fastapi import FastAPI, WebSocket
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents.complaint_agent import process_complaint
from models.complaint_input import ComplaintInput
import asyncio
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

cors_origins = os.getenv("CORS_ORIGINS", '["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:8000"]')
cors_origins = json.loads(cors_origins) if isinstance(cors_origins, str) else cors_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

connections = set()
complaint_history = []

@app.websocket("/ws/logs")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connections.add(websocket)
    try:
        while True:
            await websocket.receive_text()
    except Exception:
        connections.discard(websocket)

async def send_log(message: dict):
    disconnected = set()
    for connection in connections:
        try:
            await connection.send_text(json.dumps(message))
        except Exception:
            disconnected.add(connection)
    
    for connection in disconnected:
        connections.discard(connection)

@app.get("/complaint/test")
def test():
    return {"status": "Agent is running"}

@app.get("/complaint/agents")
def list_agents():
    return {"agents": ["Complaint Agent", "Mock Athena Agent", "Regulator Agent"]}

@app.get("/complaint/mock-agents")
def get_mock_agent_data():
    from agents.mock_athena_agent import mock_athena_response
    return mock_athena_response()

@app.get("/complaint/history")
def get_history():
    return complaint_history

@app.post("/complaint/analyze")
async def analyze_complaint(complaint: ComplaintInput):
    response = await process_complaint(complaint.text, send_log)
    complaint_history.append(response)
    return response

# Commented out to run frontend and backend separately
# app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="static")