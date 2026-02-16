FROM python:3.12-slim

ARG VERSION=dev

WORKDIR /app

# ensure the application directory is on python path so alembic and uvicorn
# can import the `app` package when the container starts
ENV PYTHONPATH=/app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV APP_VERSION=${VERSION}

RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["/app/entrypoint.sh"]
