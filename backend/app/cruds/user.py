# cruds/user.py の例
from sqlalchemy.orm import Session
from app.models.user import User


def get_user_by_email(db: Session, email: str):
    # パラメータが自動バインドされるため安全
    return db.query(User).filter(User.email == email).first()
