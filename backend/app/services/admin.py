from app.models import User

ADMIN_EMAIL = "arcadaeum@gmail.com"


def is_admin_user(user: User) -> bool:
    return user.username.lower() == ADMIN_EMAIL or user.email.lower() == ADMIN_EMAIL
