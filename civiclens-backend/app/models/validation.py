from sqlalchemy import Column, Integer, Boolean, Text, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
from app.models.user import User  # For type checking if needed

class Validation(BaseModel):
    __tablename__ = "validations"

    # Foreign Keys
    report_id = Column(Integer, ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Validation Data
    is_valid = Column(Boolean, nullable=False, default=True) # True=Upvote/Verify, False=Downvote/Reject
    comment = Column(Text, nullable=True)

    # Relationships
    report = relationship("Report", back_populates="validations")
    user = relationship("User", foreign_keys=[user_id])

    # Constraints
    __table_args__ = (
        Index('idx_validation_report_user', 'report_id', 'user_id', unique=True), # One validation per user per report
    )

    def __repr__(self):
        return f"<Validation(id={self.id}, report_id={self.report_id}, user_id={self.user_id}, is_valid={self.is_valid})>"
