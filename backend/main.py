from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, status
import uvicorn
import os
from searchquery import query_screenshot, voice_screenshot, query_screenshot_explicit, voice_screenshot_explicit
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from database import get_db, create_tables, User, Query
from auth import get_password_hash, verify_password, create_access_token, create_refresh_token, get_current_user, get_current_user_optional, verify_token
from schemas import UserCreate, UserLogin, UserResponse, Token, QueryResponse
from datetime import timedelta

app = FastAPI()

# Create database tables on startup
create_tables()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

SCREENSHOTS_DIR = "Screenshots"
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

@app.get("/")
async def root():
    return {"message": "Hello from backend!"}

# Authentication endpoints
@app.post("/auth/signup", response_model=UserResponse)
async def signup(user: UserCreate, db: Session = Depends(get_db)):
    # Check if passwords match
    if user.password != user.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Passwords do not match"
        )
    
    # Check if user already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@app.post("/auth/login", response_model=Token)
async def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": str(db_user.id)})
    refresh_token = create_refresh_token(data={"sub": str(db_user.id)})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@app.post("/auth/refresh", response_model=Token)
async def refresh_token(refresh_token: str = Form(...), db: Session = Depends(get_db)):
    try:
        token_data = verify_token(refresh_token)
        if token_data["type"] != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
            )
        
        user = db.query(User).filter(User.id == int(token_data["user_id"])).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )
        
        new_access_token = create_access_token(data={"sub": str(user.id)})
        new_refresh_token = create_refresh_token(data={"sub": str(user.id)})
        
        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/auth/queries", response_model=list[QueryResponse])
async def get_user_queries(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    queries = db.query(Query).filter(Query.user_id == current_user.id).order_by(Query.created_at.desc()).all()
    return queries

# Helper function to process requests
async def process_request(
    text: Optional[str] = None,
    image: UploadFile = None,
    audio: Optional[UploadFile] = None,
    module: Optional[str] = None,
    current_user: Optional[User] = None,
    db: Session = None
):
    """Common processing logic for all endpoints"""
    # Validate exactly one input method is provided
    if not (bool(text) ^ bool(audio)):
        raise HTTPException(
            status_code=400,
            detail="Provide either text or audio, not both"
        )

    # Validate image file
    if not image.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        raise HTTPException(
            status_code=400,
            detail="Invalid image format. Only PNG, JPG, JPEG are supported."
        )

    image_path = os.path.join(SCREENSHOTS_DIR, image.filename)
    
    # Save the image
    with open(image_path, "wb") as buffer:
        buffer.write(await image.read())
    
    try:
        # Process based on input type
        if audio:
            # Validate audio file
            if not audio.filename.lower().endswith(('.wav', '.mp3', '.ogg')):
                raise HTTPException(
                    status_code=400,
                    detail="Invalid audio format. Only WAV, MP3, OGG are supported."
                )
            
            audio_bytes = await audio.read()
            if module:
                result = voice_screenshot_explicit(audio_bytes, image_path, module)
            else:
                result = voice_screenshot(audio_bytes, image_path)
            query_text = None  # For audio, we don't store the transcribed text directly
        else:
            if not text or not text.strip():
                raise HTTPException(
                    status_code=400,
                    detail="Text query cannot be empty"
                )
            query_text = text.strip()
            if module:
                result = query_screenshot_explicit(query_text, image_path, module)
            else:
                result = query_screenshot(query_text, image_path)
        
        # Store query in database
        if db:
            db_query = Query(
                user_id=current_user.id if current_user else None,
                query_text=query_text,
                response_text=str(result),
                module_used=module
            )
            db.add(db_query)
            db.commit()
            db.refresh(db_query)
        
        return {"result": result}
    
    finally:
        # Clean up the image file after processing
        if os.path.exists(image_path):
            os.remove(image_path)

@app.post("/query")
async def process_query(
    text: Optional[str] = Form(None),
    image: UploadFile = File(...),
    audio: Optional[UploadFile] = File(None),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """General query endpoint that uses classifier to determine module"""
    try:
        response = await process_request(text, image, audio, current_user=current_user, db=db)
        return JSONResponse(content=response)
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Internal server error: {str(e)}"}
        )

@app.post("/query/cooking")
async def process_cooking_query(
    text: Optional[str] = Form(None),
    image: UploadFile = File(...),
    audio: Optional[UploadFile] = File(None),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Explicit cooking module endpoint"""
    try:
        response = await process_request(text, image, audio, "cooking", current_user=current_user, db=db)
        return JSONResponse(content=response)
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Internal server error: {str(e)}"}
        )

@app.post("/query/shopping")
async def process_shopping_query(
    text: Optional[str] = Form(None),
    image: UploadFile = File(...),
    audio: Optional[UploadFile] = File(None),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Explicit shopping module endpoint"""
    try:
        response = await process_request(text, image, audio, "shopping", current_user=current_user, db=db)
        return JSONResponse(content=response)
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Internal server error: {str(e)}"}
        )

@app.post("/query/travel")
async def process_travel_query(
    text: Optional[str] = Form(None),
    image: UploadFile = File(...),
    audio: Optional[UploadFile] = File(None),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Explicit travel module endpoint"""
    try:
        response = await process_request(text, image, audio, "travel", current_user=current_user, db=db)
        return JSONResponse(content=response)
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Internal server error: {str(e)}"}
        )

@app.post("/query/news")
async def process_news_query(
    text: Optional[str] = Form(None),
    image: UploadFile = File(...),
    audio: Optional[UploadFile] = File(None),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Explicit news module endpoint"""
    try:
        response = await process_request(text, image, audio, "news", current_user=current_user, db=db)
        return JSONResponse(content=response)
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Internal server error: {str(e)}"}
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)