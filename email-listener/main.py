import time
import schedule
from processor import process_emails

def job():
    process_emails()

if __name__ == "__main__":
    print("Iniciando Email Listener. Se ejecutará cada 60 segundos.")
    # Ejecutar una vez al inicio
    job()
    
    schedule.every(60).seconds.do(job)
    
    while True:
        schedule.run_pending()
        time.sleep(1)
