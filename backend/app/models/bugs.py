#### backend/app/models/bugs.py ####
from pydantic import BaseModel, Field

class BugReportRequest(BaseModel):
    title: str = Field(..., min_length=5, max_length=100)
    description: str = Field(..., min_length=10, max_length=2000)
