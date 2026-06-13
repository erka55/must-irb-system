from sqlalchemy import Column, String, Text
from app.core.database import Base
import uuid

class Protocol(Base):
    __tablename__ = "protocols"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String)
    abstract = Column(Text)
    status = Column(String, default="draft")
    pi_id = Column(String)