#!/bin/bash

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo "Deteniendo servicios..."
    kill $BACKEND_PID $FRONTEND_PID
    exit
}

# Capturar señales de interrupción (Ctrl+C)
trap cleanup SIGINT SIGTERM

echo "Iniciando el entorno de desarrollo local..."

# 1. Iniciar el Backend
echo "Iniciando Backend (FastAPI)..."
cd backend
# Se asume que el entorno virtual está en el root del proyecto como 'venv'
if [ -d "../venv" ]; then
    source ../venv/bin/activate
fi
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# 2. Iniciar el Frontend
echo "Iniciando Frontend (Next.js)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "Servicios en ejecución:"
echo "- Backend: http://localhost:8000"
echo "- Frontend: http://localhost:3000"
echo ""
echo "Presiona Ctrl+C para detener ambos servicios."

# Mantener el script en ejecución
wait
