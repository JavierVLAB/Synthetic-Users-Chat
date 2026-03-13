# Dockerfile para el backend FastAPI
#
# Contexto de build: raíz del monorepo (context: .)
# Incluye las dependencias de sistema necesarias para WeasyPrint
# (Cairo, Pango, GDK-Pixbuf) para generar PDFs desde HTML.

FROM python:3.12-slim

WORKDIR /app

# Dependencias de sistema para WeasyPrint
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf-xlib-2.0-0 \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Dependencias Python (antes del código fuente para aprovechar caché de Docker)
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Código fuente del backend
COPY backend/ .

# Directorio de la base de datos
RUN mkdir -p /app/data/db

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
