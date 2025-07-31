# How to run the backend

## Using Docker (recommended)
1. Open a terminal in the project root (`quiz-game/`)
2. Run:
   ```
   docker-compose up -d
   ```
   This starts the database and backend together.

## For local development (without Docker)
1. Open a terminal in `quiz-game/backend`
2. Set environment variables:
   - On Windows CMD:
     ```
     set FLASK_APP=wsgi:app
     set FLASK_ENV=development
     ```
   - On PowerShell:
     ```
     $env:FLASK_APP="wsgi:app"
     $env:FLASK_ENV="development"
     ```
3. Run:
   ```
   flask run
   ```
   The backend will be available at http://localhost:5000

