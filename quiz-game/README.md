quiz-game
│
├── backend
│   ├── migrations
│   │   ├── versions
│   │   │   ├── 2eb707dd9134_add_level_column_to_question.py
│   │   │   ├── 025b9ba320cf_change_selected_option_to_text.py
│   │   │   ├── 142c103c7cb7_add_quiz_history.py
│   │   │   ├── 4a4d028e3d29_initial_migration.py
│   │   │   ├── e051666e6401_add_password_hash_to_users.py
│   │   ├── __pycache__/
│   │   ├── alembic.ini
│   │   ├── env.py
│   │   ├── README
│   │   ├── script.py.mako
│   │
│   ├── src
│   │   ├── __pycache__/
│   │   ├── auth.py
│   │   ├── models.py
│   │   ├── routes.py
│   │   ├── schemas.py
│   │   ├── shared.py
│   │   ├── user.py
│   │
│   ├── app.py
│   ├── Dockerfile
│   ├── README.md
│   ├── requirements.txt
│
├── frontend
│   ├── node_modules/
│   ├── public
│   │   ├── logo/
│   │   ├── sounds/
│   │   └── index.html
│   │
│   ├── src
│   │   ├── components
│   │   │   ├── Confetti.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Question.jsx
│   │   │   ├── QuizResults.jsx
│   │   │
│   │   ├── pages
│   │   │   ├── History.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── QuizPage.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Settings.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── index.js
│   │   ├── styles.css
│   │
│   ├── .env
│
├── Dockerfile
├── package-lock.json
├── package.json
├── docker-compose.yml
├── README.md
