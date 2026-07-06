import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
IMAP_USER = os.getenv("IMAP_USER", "pqrsf@ikusi.com")
IMAP_PASSWORD = os.getenv("IMAP_PASSWORD", "password")

def send_receipt_email(to_email: str, consecutivo: str, area: str, horas: int):
    try:
        msg = MIMEMultipart()
        msg['From'] = IMAP_USER
        msg['To'] = to_email
        msg['Subject'] = f"Acuse de recibo: Caso {consecutivo} registrado"
        
        body = f"""
        Estimado cliente,
        
        Hemos recibido su solicitud y ha sido registrada en nuestro sistema de PQRSF.
        
        Número de caso: {consecutivo}
        Área asignada: {area}
        Tiempo estimado de respuesta: {horas} horas.
        
        Gracias por contactar con IKUSI.
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        # En caso de no tener credenciales reales configuradas, solo logueamos
        if IMAP_USER == "pqrsf@ikusi.com" and IMAP_PASSWORD == "password":
            print(f"SMTP Mock: Enviando a {to_email} el caso {consecutivo}")
            return True
            
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(IMAP_USER, IMAP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Error sending SMTP: {e}")
        return False
