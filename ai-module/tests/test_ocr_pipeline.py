import json
import time
import sys
import logging
from pathlib import Path

# --- KONFIGURACJA ---
ROOT = Path(__file__).resolve().parents[2]  # SmartReceipt/
MODEL_PATH = str(ROOT / "app" / "ocr" / "models" / "Llama-3.2-3B-Instruct-Q4_K_M.gguf")
print(MODEL_PATH)
IMAGE_PATH = "image.png"  # <-- Podmień na nazwę swojego pliku!

# Konfiguracja prostego loggera, żeby nie importować tego z 'app.utils'
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("TestScript")

try:
    from llama_cpp import Llama
    from paddleocr import PaddleOCR
except ImportError as e:
    logger.error("Brakuje bibliotek! Upewnij się, że jesteś w venv i zainstalowałeś wymagania.")
    logger.error(f"Szczegóły: {e}")
    sys.exit(1)

class TestParser:
    def __init__(self, model_path: str):
        logger.info("1. Inicjalizacja PaddleOCR...")
        # use_angle_cls=True pomaga jeśli zdjęcie jest obrócone
        self.ocr = PaddleOCR(use_textline_orientation=True, lang='pl', show_log=False, use_gpu=False)
        
        logger.info(f"2. Ładowanie modelu Llama z: {model_path}...")
        

        self.llm = Llama(
            model_path=model_path,
            n_ctx=4096,       # Zwiększyłem trochę kontekst dla bezpieczeństwa
            n_gpu_layers=-1,  # GPU offload
            verbose=False
        )
        logger.info("✅ Model załadowany.")

    def run(self, image_path: str):
        path = Path(image_path)
        if not path.exists():
            logger.error(f"Nie znaleziono pliku: {path}")
            return

        # KROK A: OCR
        start_time = time.time()
        logger.info(f"--- Start OCR dla: {path.name} ---")
        
        ocr_result = self.ocr.ocr(str(path), cls=True)
        print(f"{ocr_result=}")
        raw_lines = []
        if ocr_result and ocr_result[0]:
            for line in ocr_result[0]:
                text = line[1][0]
                raw_lines.append(text)
        
        raw_text = "\n".join(raw_lines)
        ocr_time = time.time() - start_time
        logger.info(f"OCR zakończony w {ocr_time:.2f}s.")
        logger.info(f"--- SUROWY TEKST OCR (Fragment) ---\n{raw_text[:200]}...\n-----------------------------------")

        # KROK B: LLM Prompting
        system_prompt = (
            "Jesteś asystentem AI parsującym paragony. "
            "Twoim zadaniem jest wyciągnięcie listy zakupionych produktów i ich cen z surowego tekstu OCR."
        )
        
        user_prompt = f"""
        Oto surowy tekst z paragonu:
        '''
        {raw_text}
        '''
        
        INSTRUKCJE:
        1. Wypisz TYLKO pozycje towarowe. Pomiń sumy, NIP, daty.
        2. Zwróć JSON w formacie listy: [{{"product_name": "nazwa", "price": 10.99}}]
        3. Napraw ceny (przecinki na kropki).
        """

        logger.info("Wysyłanie do LLM...")
        llm_start = time.time()
        
        response = self.llm.create_chat_completion(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.1,
            max_tokens=1024,
            response_format={"type": "json_object"}
        )
        
        content = response["choices"][0]["message"]["content"]
        llm_time = time.time() - llm_start
        
        logger.info(f"LLM zakończył w {llm_time:.2f}s.")
        
        # KROK C: Wynik
        print("\n" + "="*40)
        print(" WYNIK KOŃCOWY (JSON):")
        print("="*40)
        try:
            # Prosta sanityzacja jsona
            json_str = content[content.find('['):content.rfind(']')+1]
            parsed = json.loads(json_str)
            print(json.dumps(parsed, indent=4, ensure_ascii=False))
        except Exception as e:
            print("Błąd parsowania JSON:")
            print(content)
            
        print(f"\nCałość zajęła: {ocr_time + llm_time:.2f}s")
        print(f"OCR: {ocr_time:.2f}s, LLM: {llm_time:.2f}s")

if __name__ == "__main__":
    try:
        parser = TestParser(MODEL_PATH)
        parser.run(IMAGE_PATH)
    except Exception as e:
        logger.exception("Wystąpił błąd krytyczny:")