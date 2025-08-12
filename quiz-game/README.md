quiz-game
│
├── backend/                # Flask backend
│   ├── migrations/         # Database migrations (Alembic)
│   ├── src/                # Application source code
│   │   ├── auth.py         # Authentication routes
│   │   ├── models.py       # Database models
│   │   ├── routes.py       # Quiz routes
│   │   ├── schemas.py      # Marshmallow schemas
│   │   ├── shared.py       # Shared configurations (DB, etc.)
│   │   ├── user.py         # User management
│   ├── app.py              # Flask entry point
│   ├── Dockerfile          # Backend container setup
│   ├── requirements.txt    # Python dependencies
│
├── frontend/               # React frontend
│   ├── public/             # Static files
│   ├── src/                # React components/pages
│   │   ├── components/     # UI components (Navbar, Question, etc.)
│   │   ├── pages/          # Pages (Login, QuizPage, History, etc.)
│   │   ├── App.jsx         # Main React component
│   │   ├── index.js        # React entry point
│   ├── .env                # Frontend environment variables
│
├── docker-compose.yml      # Multi-container setup
├── Dockerfile              # Root Dockerfile (optional)
└── README.md               # Project documentation
