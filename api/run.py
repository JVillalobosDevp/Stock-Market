"""Ejecutar la API: python -m api.run (desde la raíz del proyecto) o uvicorn api.main:app --reload"""
import uvicorn

if __name__ == "__main__":
    uvicorn.run("api.main:app", host="127.0.0.1", port=8000, reload=True)
