from sqlalchemy import Column, Integer, String, Text, ForeignKey
from app.database import Base


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    full_name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    summary = Column(Text, nullable=True)

    # Each of these stores a JSON-encoded LIST of entries (multiple items allowed)
    experience = Column(Text, nullable=True)     # list of {title, company, duration, description}
    education = Column(Text, nullable=True)      # list of {degree, institution, year}
    skills = Column(Text, nullable=True)         # list of strings
    projects = Column(Text, nullable=True)       # list of {title, description, link}
    certifications = Column(Text, nullable=True) # list of {name, issuer, year}

    github_url = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    portfolio_url = Column(String, nullable=True)