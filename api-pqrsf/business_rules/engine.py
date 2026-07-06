import re
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
import models

class BusinessRulesEngine:
    def _evaluate_condition(self, text: str, condicion: str) -> bool:
        # Búsqueda case-insensitive
        pattern = re.compile(re.escape(condicion), re.IGNORECASE)
        return bool(pattern.search(text))

    def evaluate(self, db: Session, subject: str, text: str, ai_classification: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evalúa el texto contra las reglas de negocio y sobrescribe la clasificación de IA si aplica.
        """
        full_text = f"{subject} {text}"
        final_classification = ai_classification.copy()
        modificada = False
        reglas_aplicadas = []

        rules = db.query(models.BusinessRule).filter(models.BusinessRule.is_active == True).order_by(models.BusinessRule.priority.desc()).all()

        # Agrupar reglas por campo para aplicar solo la de mayor prioridad por campo
        rules_by_field = {}
        for rule in rules:
            if rule.action_field not in rules_by_field:
                rules_by_field[rule.action_field] = []
            rules_by_field[rule.action_field].append(rule)

        for campo, field_rules in rules_by_field.items():
            for rule in field_rules:
                if not rule.keywords:
                    continue
                # Split keywords by comma
                condiciones = [k.strip() for k in rule.keywords.split(",") if k.strip()]
                match = any(self._evaluate_condition(full_text, c) for c in condiciones)
                if match:
                    # Aplicar regla
                    # Si el campo termina en _id, la IA probablemente no lo trae directamente con ese nombre, pero
                    # asumimos que final_classification y action_field mapean correctamente a lo que el frontend o backend esperan
                    if final_classification.get(campo) != rule.action_value:
                        final_classification[campo] = rule.action_value
                        modificada = True
                        reglas_aplicadas.append(str(rule.id))
                    break # Solo se aplica la regla de mayor prioridad para este campo

        return {
            "clasificacion_final": final_classification,
            "modificada": modificada,
            "reglas_aplicadas": ",".join(reglas_aplicadas) if reglas_aplicadas else None
        }

engine = BusinessRulesEngine()
