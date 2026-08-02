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


# ---------- Resume endpoints ----------

@app.post("/resumes", response_model=resume_schemas.ResumeOut)
def create_resume(
    resume: resume_schemas.ResumeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    new_resume = resume_models.Resume(**resume.dict(), user_id=current_user.id)
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)
    return new_resume


@app.get("/resumes", response_model=list[resume_schemas.ResumeOut])
def get_my_resumes(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    return db.query(resume_models.Resume).filter(
        resume_models.Resume.user_id == current_user.id
    ).all()


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
    return resume


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

    for key, value in updated.dict().items():
        setattr(resume, key, value)

    db.commit()
    db.refresh(resume)
    return resume