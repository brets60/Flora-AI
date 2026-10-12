FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m -u 1000 user

COPY requirements.txt .
COPY backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/backend/uploads && chown -R 1000:1000 /app && chmod -R 777 /app/backend

USER 1000
ENV HOME=/home/user \
    PORT=7860

# Expose ports for cloud services (7860 for Hugging Face Spaces, 8000 for standard)
EXPOSE 7860
EXPOSE 8000

CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-7860}"]

