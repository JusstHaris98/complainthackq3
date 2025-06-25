from pydantic import BaseModel

class ComplaintInput(BaseModel):
    text: str