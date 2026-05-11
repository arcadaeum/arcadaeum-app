#### backend/app/routes/bugs.py ####
from fastapi import APIRouter, Depends, HTTPException, status

from app.database.queries.bugs import create_bug_report
from app.models.bugs import BugReportRequest
from app.models.auth import User
from app.services.auth import get_current_user

router = APIRouter(tags=["bugs"])


@router.post("/bugs", status_code=status.HTTP_201_CREATED)
def report_bug(
    request: BugReportRequest,
    current_user: User = Depends(get_current_user),
) -> dict[str, object]:
    """Submit a bug report from the current user."""
    try:
        bug_id = create_bug_report(current_user.id, request.title, request.description)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit bug report",
        )
    return {"id": bug_id, "message": "Bug report submitted successfully"}
