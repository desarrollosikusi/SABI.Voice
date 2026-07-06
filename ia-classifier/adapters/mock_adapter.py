from adapters.base import BaseLLMAdapter, ClassificationResult

class MockAdapter(BaseLLMAdapter):
    def classify(self, subject: str, body: str) -> ClassificationResult:
        content = (subject + " " + body).lower()
        
        tipo = "Petición"
        if "queja" in content or "mal" in content:
            tipo = "Queja"
        elif "falla" in content or "caído" in content or "reclam" in content:
            tipo = "Reclamo"
        elif "sug" in content:
            tipo = "Sugerencia"
        elif "excelente" in content or "gracias" in content or "felici" in content:
            tipo = "Felicitación"
            
        area = "Customer Experience"
        if "servidor" in content or "router" in content or "red" in content:
            area = "Operaciones"
        elif "proyecto" in content:
            area = "PMO"
            
        arquitectura = "No Identificada"
        if "switch" in content or "router" in content or "ap" in content or "wifi" in content:
            arquitectura = "Enterprise Networking"
        elif "servidor" in content or "storage" in content or "vmware" in content or "respaldo" in content:
            arquitectura = "Datacenter"
        elif "firewall" in content or "vpn" in content or "ataque" in content or "antivirus" in content:
            arquitectura = "Seguridad"
            
        prioridad = "Media"
        if "urgente" in content or "caído" in content:
            prioridad = "Alta"
        elif tipo == "Felicitación":
            prioridad = "Baja"
            
        sentimiento = "Neutral"
        if tipo in ["Queja", "Reclamo"]:
            sentimiento = "Negativo"
            if prioridad == "Alta":
                sentimiento = "Crítico"
        elif tipo == "Felicitación":
            sentimiento = "Positivo"

        return ClassificationResult(
            tipo=tipo,
            area=area,
            arquitectura=arquitectura,
            prioridad=prioridad,
            sentimiento=sentimiento,
            causa_probable="No determinada" if tipo == "Petición" else "Error operativo",
            accion_recomendada="Revisar proceso de clasificación manual (Mock).",
            resumen="[MOCK] " + subject[:50],
            impacto="Impacto simulado por MockAdapter",
            riesgo="Riesgo simulado por MockAdapter",
            recomendacion="Revisar y contactar al cliente (Mock)",
            hallazgos=[
                {
                    "tipo": "Calidad",
                    "descripcion": "Posible incumplimiento (MOCK)",
                    "confianza": 0.85
                }
            ] if tipo in ["Queja", "Reclamo"] else []
        )
