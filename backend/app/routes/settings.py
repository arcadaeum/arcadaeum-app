from fastapi import APIRouter, Depends, HTTPException, status
from app.models.auth import User
from app.models.settings import UpdateUsernameRequest, UpdateDisplayNameRequest, DeleteAccountRequest
from app.services.auth import get_current_user, verify_password, get_user_by_username, pwd_context
from app.database.queries.users import update_username, update_user_display_name, delete_user, get_user_by_id

router = APIRouter(prefix="/settings", tags=["settings"])

@router.patch("/username")
async def change_username(
    req: UpdateUsernameRequest, 
    current_user: User = Depends(get_current_user)
):
    """Update username after verifying current password."""
    # 1. Fetch user with password hash
    user_db = get_user_by_id(current_user.id)
    if not user_db or not user_db.get("password_hash"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Social login accounts cannot change username via password."
        )

    # 2. Verify password
    if not verify_password(req.current_password, user_db["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Incorrect password."
        )

    # 3. Check if new username is taken
    if get_user_by_username(req.new_username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, 
            detail="Username already taken."
        )

    # 4. Update
    if update_username(current_user.id, req.new_username):
        return {"message": "Username updated successfully", "username": req.new_username}
    
    raise HTTPException(status_code=500, detail="Failed to update username.")

@router.patch("/display-name")
async def change_display_name(
    req: UpdateDisplayNameRequest, 
    current_user: User = Depends(get_current_user)
):
    """Simple update for display name."""
    update_user_display_name(current_user.username, req.display_name)
    return {"message": "Display name updated successfully", "display_name": req.display_name}

@router.delete("/account")
async def remove_account(
    req: DeleteAccountRequest, 
    current_user: User = Depends(get_current_user)
):
    """Permanently delete user account."""
    if req.confirmation != "DELETE MY ACCOUNT":
        raise HTTPException(status_code=400, detail="Confirmation phrase mismatch.")

    user_db = get_user_by_id(current_user.id)
    if not user_db or not user_db.get("password_hash"):
         raise HTTPException(status_code=400, detail="Identity verification failed.")

    if not verify_password(req.password, user_db["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect password.")

    if delete_user(current_user.id):
        return {"message": "Account deleted successfully."}
    
    raise HTTPException(status_code=500, detail="Failed to delete account.")
