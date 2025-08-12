- About Project:
The quiz game project is a web-based quiz game where users can log in, answer multiple-choice questions, see their score instantly, and view their past quiz resultsIt’s a full-stack quiz game – Building with both the frontend and backend.

Backend:

1. Built with Flask (Python).

2. Uses Flask-Migrate for database migrations and SQLAlchemy.

3. Handles authentication with JWT (JSON Web Tokens).

4. Provides endpoints for quiz questions and quiz history and more.

Frontend:

1. Built with React (JSX).

2. Includes components like QuizPage.jsx and History.jsx and more.

3. Displays questions, calculates scores, shows confetti and sounds when the quiz is completed.


- What you should have before running the project
You should have the following application to run the project:
1. Visual studio code
2. Docker Desktop
- How to run the projcet:
 in order to run the project firstly run the backend through these commands: ( cd quiz-game ) then ( docker-compose up -d ), Then you can go to Frontend to run these commands: ( cd quiz-game ) then ( cd frontend ) at the end ( npm start )   

-Structure of my project
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

