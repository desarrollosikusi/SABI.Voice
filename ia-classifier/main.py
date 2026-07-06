import os
from fastapi import FastAPI
from pydantic import BaseModel
from adapters.mock_adapter import MockAdapter
from adapters.gemini_adapter import GeminiAdapter
from adapters.base import ClassificationResult

app = FastAPI(title="IA Classifier Service IKUSI")

# Inicializar adaptador
USE_MOCK = os.getenv("USE_MOCK", "True").lower() in ("true", "1", "yes")

if USE_MOCK:
    print("Iniciando IA Classifier en modo MOCK")
    adapter = MockAdapter()
else:
    print("Iniciando IA Classifier en modo GEMINI")
    try:
        adapter = GeminiAdapter()
    except Exception as e:
        print(f"Error inicializando Gemini, volviendo a Mock: {e}")
        adapter = MockAdapter()

class ClassifyRequest(BaseModel):
    subject: str
    body: str

@app.post("/classify", response_model=ClassificationResult)
def classify_email(req: ClassifyRequest):
    return adapter.classify(req.subject, req.body)

@app.get("/health")
def health_check():
    return {"status": "ok", "mode": "MOCK" if isinstance(adapter, MockAdapter) else "GEMINI"}

@app.post("/generate-insight")
def generate_insight(stats: dict):
    if isinstance(adapter, MockAdapter):
        return {
            "insights": [
                "Se incrementaron los reclamos asociados a Delivery durante el último mes.",
                "La principal causa recurrente continúa siendo Retraso Documental.",
                "El área SMO concentra el mayor porcentaje de incumplimientos de SLA.",
                "Enterprise Networking presenta el mayor número de incidentes."
            ],
            "recomendaciones": [
                {"accion": "Capacitación a mesa de ayuda", "impacto": "Alto", "prioridad": "Alta", "area_responsable": "SMO"},
                {"accion": "Revisión de SLA de Delivery", "impacto": "Medio", "prioridad": "Media", "area_responsable": "Delivery"}
            ]
        }
    
    prompt = f"""
    Eres un consultor de operaciones analizando datos de PQRSF.
    A continuación tienes los datos estadísticos JSON de causas raíz y tendencias.
    Debes responder EXACTAMENTE con un objeto JSON (sin markdown adicional, sin comillas invertidas, solo JSON válido) que contenga la siguiente estructura:
    {{
      "insights": [
        "lista de 4 o 5 hallazgos críticos de 1 sola oración cada uno, como 'El área X presenta...'"
      ],
      "recomendaciones": [
        {{
          "accion": "string con la accion sugerida",
          "impacto": "Alto, Medio o Bajo",
          "prioridad": "Alta, Media o Baja",
          "area_responsable": "Nombre del área"
        }}
      ]
    }}
    
    Asegúrate de generar entre 2 y 4 recomendaciones basadas en las principales causas probables y áreas afectadas.
    
    JSON de datos:
    {stats}
    """
    try:
        import json
        response = adapter.model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
            
        data = json.loads(text.strip())
        return data
    except Exception as e:
        print(f"Error parseando JSON de IA: {e}")
        return {
            "insights": [f"Error generando insight: {e}"],
            "recomendaciones": []
        }
