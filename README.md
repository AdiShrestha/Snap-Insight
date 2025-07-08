# 📸 SnapInsight

> **AI-Powered Screenshot Assistant for Smart Content Analysis**

SnapInsight is an intelligent desktop application that combines **screenshot capture** with **AI-powered analysis** to help you extract meaningful information from images. Whether you're looking at recipes, shopping for products, planning travel, or reading news, SnapInsight can analyze your screenshots and provide contextual insights.

## 🌟 Key Features

### 🎯 **Multi-Modal AI Analysis**
- **OCR Text Extraction**: Extract and analyze text from screenshots
- **Image Captioning**: Understand images without text using BLIP model
- **Voice Input**: Record audio queries for hands-free interaction
- **Smart Classification**: Automatically categorizes queries into modules

### 🏠 **Specialized Modules**
- **🍳 Cooking**: Find recipes, ingredients, and cooking instructions
- **🛍️ Shopping**: Compare products, prices, and find deals
- **✈️ Travel**: Plan trips, identify places, and get travel recommendations
- **📰 News**: Analyze news content and get summaries

### 🖥️ **Desktop Integration**
- **Global Hotkey**: `Cmd+Shift+S` (macOS) / `Ctrl+Shift+S` (Windows/Linux)
- **System Tray**: Quick access and overlay controls
- **Compact Overlay**: Non-intrusive floating assistant
- **Auto-Launch**: Starts with your system
- **Cross-Platform**: macOS, Windows, and Linux support

### 🔐 **User Management**
- User authentication and registration
- Query history tracking
- Personalized experience

## 🏗️ Architecture

SnapInsight follows a modern **client-server architecture**:

```
┌─────────────────┐     ┌─────────────────┐
│  Frontend       │────▶│  Backend        │
│  (Electron +    │     │  (FastAPI +     │
│   Next.js)      │     │   Python AI)    │
├─────────────────┤     ├─────────────────┤
│ • UI/UX         │     │ • OCR (Tesseract)│
│ • Screenshot    │     │ • Image Captioning│
│ • Audio Recording│    │ • Text Classification│
│ • Overlay System │    │ • Module Processing│
│ • Electron Main │     │ • API Endpoints │
└─────────────────┘     └─────────────────┘
```

### **Frontend Stack**
- **Electron**: Desktop application framework
- **Next.js**: React-based web framework
- **Ant Design**: Professional UI components
- **Tailwind CSS**: Utility-first styling

### **Backend Stack**
- **FastAPI**: Modern Python web framework
- **PostgreSQL**: Relational database
- **SQLAlchemy**: ORM for database operations
- **Alembic**: Database migrations

### **AI/ML Components**
- **Tesseract OCR**: Text extraction from images
- **BLIP**: Image captioning model (Salesforce/blip-image-captioning-base)
- **Whisper**: Audio transcription (OpenAI)
- **RoBERTa**: Text classification for module routing
- **Transformers**: Hugging Face model pipeline

## ⚠️ **Important Note: AI Models**

**The AI classification model is not included in this repository** due to size constraints (added to `.gitignore`). The application requires:

```
backend/models/module/classifier/
├── model.safetensors         # Main model weights (~500MB)
├── config.json              # Model configuration
├── tokenizer.json           # Tokenizer vocabulary
├── vocab.json               # Vocabulary mapping
└── training_progress_scores.csv
```

**To run the application**, you'll need to:
1. Train your own classification model using the provided structure
2. Place the model files in `backend/models/module/classifier/`
3. Ensure the `label_encoder.pkl` file is in `backend/models/module/`

## 🚀 Quick Start

### **Prerequisites**

- **Python 3.12+** (for backend)
- **Node.js 18+** (for frontend)
- **Bun** (package manager for frontend)
- **PostgreSQL** (database)
- **Tesseract OCR** (system dependency)

### **System Dependencies**

#### macOS
```bash
# Install Tesseract OCR
brew install tesseract

# Install PostgreSQL
brew install postgresql
brew services start postgresql
```

#### Ubuntu/Debian
```bash
# Install Tesseract OCR
sudo apt install tesseract-ocr

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Windows
```bash
# Using Chocolatey
choco install tesseract
choco install postgresql

# Or download from official websites
```

### **Installation**

#### 1. **Clone Repository**
```bash
git clone https://github.com/yourusername/snapinsight.git
cd snapinsight
```

#### 2. **Backend Setup**
```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env with your configuration
```

#### 3. **Database Setup**
```bash
# Create PostgreSQL database
createdb snapinsight

# Run migrations
alembic upgrade head
```

#### 4. **Frontend Setup**
```bash
cd ../frontend

# Install dependencies with Bun
bun install

# Create environment file
cp .env.example .env
# Edit .env with your configuration
```

#### 5. **Environment Configuration**

**Backend (.env)**
```env
# Database
DATABASE_URL=postgresql://username:password@localhost/snapinsight

# JWT Settings
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI API Keys
GROQ_API_KEY=your-groq-api-key
OPENAI_API_KEY=your-openai-api-key  # For enhanced features
```

**Frontend (.env)**
```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000

# App Configuration
NEXT_PUBLIC_APP_NAME=SnapInsight
```

### **Running the Application**

#### **Development Mode**

**Start Backend** (Terminal 1):
```bash
cd backend
source .venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Start Frontend** (Terminal 2):
```bash
cd frontend
bun run dev
```

The application will launch automatically. If not, you can:
- **Main Window**: Navigate to `http://localhost:3000`
- **Global Hotkey**: Press `Cmd+Shift+S` (macOS) or `Ctrl+Shift+S` (Windows/Linux)
- **System Tray**: Click the SnapInsight icon

#### **Production Build**
```bash
# Backend
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000

# Frontend
cd frontend
bun run build
```

## 🎮 Usage Guide

### **Basic Workflow**

1. **Take Screenshot**: Use global hotkey or manual upload
2. **Add Context**: Type a query or record voice input
3. **AI Analysis**: SnapInsight processes the image and query
4. **Get Results**: Receive contextual information based on the content

### **Module Examples**

#### 🍳 **Cooking Module**
```
Screenshot: Recipe image or ingredients list
Query: "What's this dish?" or "How do I make this?"
Result: Recipe instructions, ingredients, cooking tips
```

#### 🛍️ **Shopping Module**
```
Screenshot: Product page or price comparison
Query: "Find cheaper alternatives" or "Compare prices"
Result: Product comparisons, price analysis, deals
```

#### ✈️ **Travel Module**
```
Screenshot: Destination image or travel website
Query: "Plan a trip here" or "What's this place?"
Result: Travel recommendations, place identification, itineraries
```

### **Input Methods**

- **Text**: Type your query in the search box
- **Voice**: Click microphone icon and record your question
- **Upload**: Drag and drop images or use the upload button
- **Screenshot**: Use global hotkey for instant capture

## 🔧 Development

### **Project Structure**
```
snapinsight/
├── backend/                 # Python FastAPI backend
│   ├── modules/            # AI processing modules
│   │   ├── cooking/        # Recipe and food analysis
│   │   ├── shopping/       # Product and price analysis
│   │   ├── travel/         # Travel planning and identification
│   │   └── news/          # News analysis and summarization
│   ├── models/            # AI models (gitignored)
│   ├── alembic/           # Database migrations
│   ├── main.py            # FastAPI application
│   ├── searchquery.py     # Core processing logic
│   ├── classifier.py      # Text classification
│   └── requirements.txt   # Python dependencies
│
├── frontend/               # Electron + Next.js frontend
│   ├── main/              # Electron main process
│   ├── src/               # React components and pages
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Next.js pages and modules
│   │   └── styles/        # CSS and styling
│   ├── public/            # Static assets
│   └── package.json       # Node.js dependencies
│
└── .gitignore             # Git ignore rules (includes AI models)
```

### **Key APIs**

#### **Screenshot Analysis**
```http
POST /query
Content-Type: multipart/form-data

{
  "text": "string",           # Optional: text query
  "audio": "file",           # Optional: audio file
  "image": "file",           # Required: screenshot
  "module": "string"         # Optional: specific module
}
```

#### **Module-Specific Endpoints**
```http
POST /query/cooking         # Cooking analysis
POST /query/shopping        # Shopping analysis  
POST /query/travel          # Travel analysis
POST /query/news           # News analysis
```

### **Adding New Modules**

1. Create module directory in `backend/modules/your_module/`
2. Implement processing logic with `your_module_init()` function
3. Add route in `main.py`
4. Update classifier training data
5. Create frontend component in `frontend/src/pages/module/`

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### **Development Guidelines**

- Follow **PEP 8** for Python code
- Use **ESLint** and **Prettier** for JavaScript/React
- Write **descriptive commit messages**
- Add **tests** for new features
- Update **documentation** as needed

## 🙏 Acknowledgments

- **Hugging Face** - For transformer models and BLIP
- **OpenAI** - For Whisper audio transcription
- **Tesseract OCR** - For text extraction
- **Ant Design** - For beautiful UI components
- **FastAPI** - For the modern Python web framework
- **Electron** - For cross-platform desktop capabilities
