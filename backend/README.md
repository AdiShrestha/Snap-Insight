# Screen Assistant Backend

This is the backend service for Screen Assistant, built with FastAPI.

## Prerequisites

- Python 3.8+
- pip (Python package manager)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/screen-assistant.git
cd screen-assistant/backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install fastapi uvicorn[standard] python-multipart
```

## Running the Server

1. Development server:
```bash
uvicorn main:app --reload
```

2. Production server:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## API Documentation

Once the server is running, you can access:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

```
backend/
├── main.py
├── requirements.txt
└── README.md
```

## Dependencies

- FastAPI: Modern web framework for building APIs
- Uvicorn: ASGI server implementation
- UV (Optional): Faster alternative to pip for package installation
- Python-multipart: For handling form data

## License

[MIT License](LICENSE)