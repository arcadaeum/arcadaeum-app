"""Bug report routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.database.queries.bugs import create_bug_report
from app.models.auth import User
from app.services.auth import get_current_user

router = APIRouter(prefix="/me", tags=["bugs"])


class BugReportRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1)


@router.post("/bug-reports", status_code=status.HTTP_201_CREATED)
def report_bug(
    req: BugReportRequest,
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    """Submit a bug report."""
    if not create_bug_report(current_user.id, req.title, req.description):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit bug report",
        )
    return {"message": "Bug report submitted successfully"}
