import re
import torch
from transformers import DonutProcessor, VisionEncoderDecoderModel
from PIL import Image
from pathlib import Path
import cv2


class DonutReceiptParser:
    def __init__(self):
        print("   ⏳ Ładowanie modelu Donut (CORD Edition)...")
        self.model_name = "naver-clova-ix/donut-base-finetuned-cord-v2"

        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        if self.device == "cuda":
            print("   🚀 Donut używa GPU!")

        self.processor = DonutProcessor.from_pretrained(self.model_name)
        self.model = VisionEncoderDecoderModel.from_pretrained(self.model_name)
        self.model.to(self.device)

    def parse(self, image_path: Path, debug_dir: Path = None) -> list[dict]:
        print(f"   🍩 Donut analizuje: {image_path.name}")

        img_cv = cv2.imread(str(image_path))
        if img_cv is None: return []

        img_rgb = cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB)
        image_pil = Image.fromarray(img_rgb)

        # 1. Inferencja
        pixel_values = self.processor(image_pil, return_tensors="pt").pixel_values
        pixel_values = pixel_values.to(self.device)

        task_prompt = "<s_cord-v2>"
        decoder_input_ids = self.processor.tokenizer(task_prompt, add_special_tokens=False,
                                                     return_tensors="pt").input_ids
        decoder_input_ids = decoder_input_ids.to(self.device)

        with torch.no_grad():
            outputs = self.model.generate(
                pixel_values,
                decoder_input_ids=decoder_input_ids,
                max_length=512,
                early_stopping=True,
                pad_token_id=self.processor.tokenizer.pad_token_id,
                eos_token_id=self.processor.tokenizer.eos_token_id,
                use_cache=True,
                num_beams=1,
                bad_words_ids=[[self.processor.tokenizer.unk_token_id]],
                return_dict_in_generate=True,
            )

        # 2. Dekodowanie do JSON
        sequence = self.processor.batch_decode(outputs.sequences)[0]
        sequence = sequence.replace(self.processor.tokenizer.eos_token, "").replace(self.processor.tokenizer.pad_token,
                                                                                    "")
        sequence = re.sub(r"<.*?>", "", sequence, count=1).strip()

        try:
            json_output = self.processor.token2json(sequence)
        except Exception:
            return []

        parsed_items = []

        # --- FIX: Obsługa Listy vs Słownika ---
        if 'menu' in json_output:
            menu_data = json_output['menu']

            # Jeśli to pojedynczy słownik, pakujemy go w listę
            if isinstance(menu_data, dict):
                menu_data = [menu_data]

            # Teraz bezpiecznie iterujemy
            if isinstance(menu_data, list):
                for item in menu_data:
                    name = item.get('nm', '').strip()
                    price_str = item.get('price', item.get('unitprice', '')).strip()

                    if not name or not price_str:
                        continue

                    # CORD: ceny to często np. 20,000 (20 tysięcy)
                    # Usuwamy przecinki i kropki, traktujemy jako int
                    # Ale jeśli cena ma np. "@20,000" (jak w Twoim logu), usuwamy też @
                    clean_price = re.sub(r'[^\d]', '', price_str)

                    try:
                        price = float(clean_price)
                        parsed_items.append({
                            "product_name": name,
                            "price": price
                        })
                    except ValueError:
                        continue

        return parsed_items