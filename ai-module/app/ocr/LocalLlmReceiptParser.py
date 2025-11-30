import json
import re
from pathlib import Path
from llama_cpp import Llama
from paddleocr import PaddleOCR
from app.utils.logger import get_logger

logger = get_logger("LocalLlmParser")

MODEL_PATH = "app/ocr/models/Llama-3.2-3B-Instruct-Q4_K_M.gguf"

class LocalLlmReceiptParser:
    def __init__(self):
        # OCR na CPU (use_gpu=False naprawia konflikt bibliotek)
        logger.info("⏳ Loading PaddleOCR (CPU mode)...")
        self.ocr = PaddleOCR(use_angle_cls=True, lang='pl', show_log=False, use_gpu=False)

        # LLM na GPU
        logger.info(f"⏳ Loading Llama 3B from {MODEL_PATH}...")
        try:
            self.llm = Llama(
                model_path=MODEL_PATH,
                n_ctx=4096,
                n_gpu_layers=-1, 
                verbose=False
            )
            logger.info("✅ Llama 3B loaded on GPU.")
        except Exception as e:
            logger.error(f"❌ Failed to load Llama model: {e}")
            raise e

    def extract_text(self, image_path: Path) -> str:
        try:
            result = self.ocr.ocr(str(image_path), cls=True)
            raw_lines = []
            if result and result[0]:
                for line in result[0]:
                    raw_lines.append(line[1][0])
            return "\n".join(raw_lines)
        except Exception as e:
            logger.error(f"OCR failed: {e}")
            return ""

    def parse(self, image_path: Path) -> list[dict]:
        # 1. OCR
        raw_text = self.extract_text(image_path)
        if not raw_text:
            return []

        # 2. Prompt - ZMODYFIKOWANY DLA LEPSZEJ SKUTECZNOŚCI
        system_prompt = "Jesteś parserem paragonów. Zwracaj TYLKO JSON."
        
        # Dodajemy przykłady (Few-Shot), żeby nauczyć go radzić sobie ze sklejonym tekstem
        user_prompt = f"""
        Twoim zadaniem jest wyciągnięcie produktów z brudnego tekstu OCR.
        
        ZASADY:
        1. Zwróć obiekt JSON z kluczem "items".
        2. Format: {{ "items": [ {{ "product_name": "...", "price": 12.99 }} ] }}
        3. Ignoruj: NIP, daty, sumy (SUMA PLN, PTU).
        4. Naprawiaj sklejone ceny. Np. "1x8,508,50B" to cena 8.50. "FRYTKIS.." to "FRYTKI".

        TEKST PARAGONU:
        '''
        {raw_text}
        '''
        
        WYNIK JSON:
        """

        try:
            # 3. Inferencja
            response = self.llm.create_chat_completion(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.1,
                max_tokens=1024,
                response_format={"type": "json_object"} # To wymaga formatu {...} a nie [...]
            )
            
            content = response["choices"][0]["message"]["content"]
            
            # 4. Parsowanie
            start = content.find('{')
            end = content.rfind('}') + 1
            if start != -1 and end != -1:
                json_obj = json.loads(content[start:end])
                
                # Kluczowa zmiana: pobieramy listę z klucza 'items'
                items = json_obj.get("items", [])
                
                # Szybkie czyszczenie w Pythonie (na wszelki wypadek)
                return self._post_process(items)
            else:
                logger.warning(f"LLM returned invalid format: {content}")
                return []
                
        except Exception as e:
            logger.error(f"LLM Processing error: {e}")
            return []

    def _post_process(self, items: list[dict]) -> list[dict]:
        """Dodatkowe zabezpieczenie typów danych"""
        clean_items = []
        for item in items:
            name = item.get("product_name", "Nieznany")
            price = item.get("price", 0.0)
            
            # Konwersja ceny jeśli LLM zwrócił stringa
            if isinstance(price, str):
                try:
                    price = float(price.replace(',', '.').replace('zł', '').strip())
                except:
                    price = 0.0
            
            clean_items.append({"product_name": name, "price": price})
        return clean_items