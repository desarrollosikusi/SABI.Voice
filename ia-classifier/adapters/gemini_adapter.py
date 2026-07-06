import os
import json
import google.generativeai as genai
from adapters.base import BaseLLMAdapter, ClassificationResult

class GeminiAdapter(BaseLLMAdapter):
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY no configurada")
        genai.configure(api_key=api_key)
        
        # Uso de gemini-1.5-flash ya que es rápido y soporta output estructurado
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
        self.prompt_template = """
Analiza el siguiente correo electrónico enviado por un cliente (Asunto y Cuerpo).
Debes extraer y clasificar la información solicitada en formato JSON estricto.

Valores permitidos para Tipo: "Petición", "Queja", "Reclamo", "Sugerencia", "Felicitación"
Valores permitidos para Área Responsable: "Delivery", "PMO", "SMO", "Customer Experience", "Comercial", "Operaciones"
Valores permitidos para Arquitectura: "Enterprise Networking", "Datacenter", "Seguridad", "No Identificada"
Valores permitidos para Prioridad: "Alta", "Media", "Baja"
Valores permitidos para Sentimiento: "Positivo", "Neutral", "Negativo", "Crítico"

Elige una Causa Probable EXCLUSIVAMENTE de este catálogo:
- Gestión de Proyectos: "Retraso de cronograma", "Falta de seguimiento", "Problema de planificación", "Gestión de cambios deficiente"
- Delivery / Implementación: "Retraso documental", "Error de configuración", "Implementación incompleta", "Desviación de diseño", "Falta de validación técnica"
- Soporte / SMO: "Tiempo de respuesta elevado", "Incumplimiento de SLA", "Escalamiento inadecuado", "Resolución insuficiente"
- Seguridad: "Incidente de seguridad", "Configuración de seguridad incorrecta", "Problema de acceso", "Vulnerabilidad detectada"
- Infraestructura: "Falla de conectividad", "Problema de rendimiento", "Disponibilidad del servicio", "Falla de hardware"
- Comunicación: "Información insuficiente", "Falta de comunicación", "Expectativas no alineadas"
- Calidad: "Error operativo", "Incumplimiento de procedimiento", "Incumplimiento contractual"
- Reconocimiento: "Buen servicio", "Excelente atención", "Cumplimiento destacado"
- Otros: "No determinada"

Genera también:
- causa_probable: La causa exacta elegida del catálogo anterior.
- accion_recomendada: Una acción concreta para reducir la recurrencia de este tipo de problemas en el futuro (ej. "Implementar checklist obligatorio...").
- resumen: Un resumen ejecutivo del caso (máx 2 líneas).
- impacto: El posible impacto al negocio del cliente.
- riesgo: El riesgo inherente de la situación presentada.
- recomendacion: Una recomendación inicial de cómo proceder.
- hallazgos: Un arreglo de objetos con 'tipo' (ej. "Calidad", "Riesgo Operacional", "Experiencia del Cliente"), 'descripcion' y 'confianza' (entre 0.0 y 1.0). Identifica proactivamente posibles incumplimientos normativos, riesgos a la continuidad del negocio o áreas de mejora continua. La IA sugiere, luego el humano validará.

Responde ÚNICAMENTE con un JSON válido con la siguiente estructura, sin formato Markdown (ej. sin ```json):
{{
  "tipo": "...",
  "area": "...",
  "arquitectura": "...",
  "prioridad": "...",
  "sentimiento": "...",
  "causa_probable": "...",
  "accion_recomendada": "...",
  "resumen": "...",
  "impacto": "...",
  "riesgo": "...",
  "recomendacion": "...",
  "hallazgos": [
    {{
      "tipo": "Calidad",
      "descripcion": "Posible incumplimiento del ANS",
      "confianza": 0.94
    }}
  ]
}}

---
ASUNTO: {subject}
CUERPO: {body}
"""

    def classify(self, subject: str, body: str) -> ClassificationResult:
        prompt = self.prompt_template.format(subject=subject, body=body)
        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            # Limpiar posible markdown
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
                
            data = json.loads(text.strip())
            return ClassificationResult(
                tipo=data.get("tipo", "Petición"),
                area=data.get("area", "Customer Experience"),
                arquitectura=data.get("arquitectura", "No Identificada"),
                prioridad=data.get("prioridad", "Media"),
                sentimiento=data.get("sentimiento", "Neutral"),
                causa_probable=data.get("causa_probable", "No determinada"),
                accion_recomendada=data.get("accion_recomendada", "Sin recomendación de mejora continua."),
                resumen=data.get("resumen", "Sin resumen"),
                impacto=data.get("impacto", "Sin impacto medido"),
                riesgo=data.get("riesgo", "Sin riesgo evaluado"),
                recomendacion=data.get("recomendacion", "Sin recomendación"),
                hallazgos=data.get("hallazgos", [])
            )
        except Exception as e:
            # Fallback a un valor seguro
            print(f"Error clasificando con Gemini: {e}")
            return ClassificationResult(
                tipo="Petición",
                area="Customer Experience",
                arquitectura="No Identificada",
                prioridad="Media",
                sentimiento="Neutral",
                causa_probable="No determinada",
                accion_recomendada="Error de IA. Revisar manualmente.",
                resumen="Error en clasificación IA.",
                impacto="Desconocido",
                riesgo="Desconocido",
                recomendacion="Clasificar manualmente."
            )
