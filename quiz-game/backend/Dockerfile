FROM python:3.13-slim

WORKDIR /app

RUN apt-get update && apt-get install -y build-essential libpq-dev && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

ENV PYTHONPATH=/app

EXPOSE 5000

CMD ["gunicorn", "--reload",  "-b", "0.0.0.0:5000", "app:app"]

