import json
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app import models, schemas, auth, resume_models, resume_schemas
from app.database import engine, get_db

# Create the database tables (if they don't exist yet)
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"status": "backend running"}


@app.post("/signup", response_model=schemas.UserOut)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        email=user.email,
        hashed_password=auth.hash_password(user.password),
        full_name=user.full_name,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.post("/login", response_model=schemas.Token)
def login(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = auth.create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}


# ---------- Helpers to convert between JSON text (DB) and lists (API) ----------

LIST_FIELDS = ["experience", "education", "skills", "projects", "certifications"]


def resume_to_db_dict(resume: resume_schemas.ResumeCreate) -> dict:
    data = resume.dict()
    for field in LIST_FIELDS:
        value = data.get(field) or []
        # Convert list of pydantic dicts (or strings) into a JSON string for storage
        data[field] = json.dumps(value)
    return data


def resume_from_db(resume_obj: resume_models.Resume) -> dict:
    data = {
        "id": resume_obj.id,
        "user_id": resume_obj.user_id,
        "full_name": resume_obj.full_name,
        "email": resume_obj.email,
        "phone": resume_obj.phone,
        "summary": resume_obj.summary,
        "github_url": resume_obj.github_url,
        "linkedin_url": resume_obj.linkedin_url,
        "portfolio_url": resume_obj.portfolio_url,
    }
    for field in LIST_FIELDS:
        raw_value = getattr(resume_obj, field)
        data[field] = json.loads(raw_value) if raw_value else []
    return data


# ---------- Resume endpoints ----------

@app.post("/resumes", response_model=resume_schemas.ResumeOut)
def create_resume(
    resume: resume_schemas.ResumeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    db_data = resume_to_db_dict(resume)
    new_resume = resume_models.Resume(**db_data, user_id=current_user.id)
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)
    return resume_from_db(new_resume)


@app.get("/resumes", response_model=list[resume_schemas.ResumeOut])
def get_my_resumes(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    resumes = db.query(resume_models.Resume).filter(
        resume_models.Resume.user_id == current_user.id
    ).all()
    return [resume_from_db(r) for r in resumes]


@app.get("/resumes/{resume_id}", response_model=resume_schemas.ResumeOut)
def get_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    resume = db.query(resume_models.Resume).filter(
        resume_models.Resume.id == resume_id,
        resume_models.Resume.user_id == current_user.id,
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume_from_db(resume)


@app.put("/resumes/{resume_id}", response_model=resume_schemas.ResumeOut)
def update_resume(
    resume_id: int,
    updated: resume_schemas.ResumeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    resume = db.query(resume_models.Resume).filter(
        resume_models.Resume.id == resume_id,
        resume_models.Resume.user_id == current_user.id,
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    db_data = resume_to_db_dict(updated)
    for key, value in db_data.items():
        setattr(resume, key, value)

    db.commit()
    db.refresh(resume)
    return resume_from_db(resume)