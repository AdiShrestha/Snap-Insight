# this is to be used for connection with postgres database
# I will be using sqlalchemy
import os

from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from typing import AsyncGenerator
load_dotenv()  # Load .env file

# Get database configuration from environment variables
host = os.environ.get('DB_HOST', 'localhost')
user = os.environ.get('POSTGRES_USER')
password = os.environ.get('POSTGRES_PASSWORD')
database = os.environ.get('POSTGRES_DB')

# Create async engine
async_engine = create_async_engine(
    f"postgresql+asyncpg://{user}:{password}@{host}:5432/{database}",
    echo=True,  # Set to True for SQL query logging
    pool_size=10,
    max_overflow=5,
    pool_pre_ping=True,  # Check connections before use
    pool_timeout=30,
    pool_recycle=1800,
)

# Create async session factory
AsyncSessionLocal = sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency that provides an async database session to route functions.

    Yields:
        AsyncSession: Database session that will be automatically closed after use

    Usage:
        @app.get("/items")
        async def read_items(db: AsyncSession = Depends(get_db)):
            # Use db session here
            pass
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
