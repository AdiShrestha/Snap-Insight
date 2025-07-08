# Dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install uv package manager
RUN pip install --no-cache-dir uv

RUN pip install python-multipart

# Copy project configuration
COPY pyproject.toml .

# Install dependencies using uv
RUN uv pip install --system -e .

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Add to Dockerfile.fastapi
COPY scripts/migrate.sh /app
RUN chmod +x /app/migrate.sh

CMD ["/app/migrate.sh"]