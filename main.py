from fastapi import FastAPI
from pydantic import BaseModel
from agents.complaint_agent import process_complaint
from models.complaint_input import ComplaintInput

app = FastAPI()

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

@app.post("/complaint/analyze")
def analyze_complaint(complaint: ComplaintInput):
    return process_complaint(complaint.text)