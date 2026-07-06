import imaplib
import email
from email.header import decode_header
import os
import uuid

IMAP_SERVER = os.getenv("IMAP_SERVER", "imap.gmail.com")
IMAP_USER = os.getenv("IMAP_USER", "pqrsf@ikusi.com")
IMAP_PASSWORD = os.getenv("IMAP_PASSWORD", "password")
ATTACHMENTS_DIR = "/app/attachments"

def get_unseen_emails():
    try:
        mail = imaplib.IMAP4_SSL(IMAP_SERVER)
        mail.login(IMAP_USER, IMAP_PASSWORD)
        mail.select("inbox")
        
        status, messages = mail.search(None, "UNSEEN")
        if status != "OK" or not messages[0]:
            return []
            
        email_ids = messages[0].split()
        parsed_emails = []
        
        for e_id in email_ids:
            status, msg_data = mail.fetch(e_id, "(RFC822)")
            for response_part in msg_data:
                if isinstance(response_part, tuple):
                    msg = email.message_from_bytes(response_part[1])
                    subject, encoding = decode_header(msg["Subject"])[0]
                    if isinstance(subject, bytes):
                        subject = subject.decode(encoding if encoding else "utf-8")
                    sender = msg.get("From")
                    
                    body = ""
                    attachments = []
                    
                    if msg.is_multipart():
                        for part in msg.walk():
                            content_type = part.get_content_type()
                            content_disposition = str(part.get("Content-Disposition"))
                            
                            if "attachment" in content_disposition:
                                filename = part.get_filename()
                                if filename:
                                    # Save attachment
                                    filepath = os.path.join(ATTACHMENTS_DIR, f"{uuid.uuid4()}_{filename}")
                                    with open(filepath, "wb") as f:
                                        f.write(part.get_payload(decode=True))
                                    attachments.append({"file_name": filename, "file_path": filepath})
                            elif content_type == "text/plain" and "attachment" not in content_disposition:
                                body += part.get_payload(decode=True).decode("utf-8", errors="ignore")
                    else:
                        body = msg.get_payload(decode=True).decode("utf-8", errors="ignore")
                        
                    parsed_emails.append({
                        "id": e_id,
                        "subject": subject,
                        "sender": sender,
                        "body": body,
                        "attachments": attachments
                    })
                    
        # Para el MVP marcamos los correos leídos de inmediato, pero idealmente se hace luego de procesar.
        # En este MVP simple asumimos que el procesamiento en el loop nunca falla del todo para no trabarnos.
        
        mail.logout()
        return parsed_emails
    except Exception as e:
        print(f"Error reading IMAP: {e}")
        return []
