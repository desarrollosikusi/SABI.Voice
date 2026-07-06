import os
import requests
import re
from imap_service import get_unseen_emails
from smtp_service import send_receipt_email

API_URL = os.getenv("API_URL", "http://api-pqrsf:8000")
IA_URL = os.getenv("IA_URL", "http://ia-classifier:8001")

def extract_email(sender_string: str) -> str:
    match = re.search(r'<(.+?)>', sender_string)
    if match:
        return match.group(1)
    return sender_string

def process_emails():
    print("Buscando correos nuevos...")
    emails = get_unseen_emails()
    
    for email in emails:
        print(f"Procesando correo: {email['subject']}")
        sender_email = extract_email(email['sender'])
        
        # 1. Llamar IA
        ia_data = {}
        try:
            resp = requests.post(f"{IA_URL}/classify", json={
                "subject": email['subject'],
                "body": email['body']
            })
            if resp.status_code == 200:
                ia_data = resp.json()
        except Exception as e:
            print(f"Error llamando IA: {e}")
            
        # 2. Crear caso en API
        pqrsf_payload = {
            "correo": sender_email,
            "asunto": email['subject'],
            "descripcion": email['body'],
            "tipo": ia_data.get("tipo"),
            "area": ia_data.get("area"),
            "arquitectura": ia_data.get("arquitectura"),
            "prioridad": ia_data.get("prioridad"),
            "sentimiento": ia_data.get("sentimiento"),
            "causa_probable": ia_data.get("causa_probable"),
            "accion_recomendada": ia_data.get("accion_recomendada"),
            "resumen": ia_data.get("resumen"),
            "impacto": ia_data.get("impacto"),
            "recomendacion": ia_data.get("recomendacion")
        }
        
        try:
            resp = requests.post(f"{API_URL}/pqrsf", json=pqrsf_payload)
            if resp.status_code == 200:
                case_data = resp.json()
                consecutivo = case_data.get("consecutivo")
                horas = case_data.get("horas_objetivo", 24)
                area = case_data.get("area", "Sin asignar")
                
                # 3. Enviar correo
                send_receipt_email(sender_email, consecutivo, area, horas)
                print(f"Caso {consecutivo} creado y acuse enviado.")
            else:
                print(f"Error creando caso en API: {resp.text}")
        except Exception as e:
            print(f"Error conectando con API: {e}")
