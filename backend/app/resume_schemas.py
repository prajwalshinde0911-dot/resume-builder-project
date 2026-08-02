from pydantic import BaseModel
from typing import Optional


class ResumeCreate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    summary: Optional[str] = None
    experience: Optional[str] = None
    education: Optional[str] = None
    skills: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None


class ResumeOut(ResumeCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True