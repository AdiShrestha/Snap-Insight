#!/bin/bash

# This script sets up the database and applies migrations for a FastAPI application.

python -m alembic revision 
# Apply migrations
echo "Applying database migrations..."
python -m alembic upgrade head

# Start the FastAPI server
echo "Starting server..."
python -m uvicorn main:app --host 0.0.0.0 --port 8000