import re
import torch
from transformers import DonutProcessor, VisionEncoderDecoderModel
from PIL import Image
from pathlib import Path
import cv2
from app.utils.logger import get_logger

logger = get_logger("DonutReceiptParser")

class DonutReceiptParser:
    def __init__(self):
        logger.info("   ⏳ Ładowanie modelu Donut (CORD Edition)...")
        self.model_name = "naver-clova-ix/donut-base-finetuned-cord-v2"

        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        if self.device == "cuda":
            logger.info("   🚀 Donut używa GPU!")

        self.processor = DonutProcessor.from_pretrained(self.model_name)
        self.model = VisionEncoderDecoderModel.from_pretrained(self.model_name)
        self.model.to(self.device)

    def parse(self, image_path: Path, debug_dir: Path = None) -> list[dict]:
        logger.info(f"   🍩 Donut analizuje: {image_path.name}")

        img_cv = cv2.imread(str(image_path))
        if img_cv is None:
            return []

        img_rgb = cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB)
        image_pil = Image.fromarray(img_rgb)

        # 1. Inferencja
        pixel_values = self.processor(image_pil, return_tensors="pt").pixel_values
        pixel_values = pixel_values.to(self.device)

        task_prompt = "<s_cord-v2>"
        decoder_input_ids = self.processor.tokenizer(
            task_prompt, add_special_tokens=False, return_tensors="pt"
        ).input_ids
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
        logger.debug(f"{sequence=}")
        sequence = sequence.replace(self.processor.tokenizer.eos_token, "").replace(
            self.processor.tokenizer.pad_token, ""
        )
        sequence = re.sub(r"<.*?>", "", sequence, count=1).strip()

        try:
            json_output = self.processor.token2json(sequence)
        except Exception:
            return []
        logger.debug(f"{json_output=}")
        parsed_items = []

        # --- FIX: Obsługa Listy vs Słownika ---
        menu_data = json_output.get("menu", [])
        if isinstance(menu_data, dict):
            menu_data = [menu_data]

        if isinstance(menu_data, list):
            for item in menu_data:
                if not isinstance(item, dict):
                    continue

                # Prosta i bezpieczna ekstrakcja danych
                val_nm = item.get("nm")
                name = (
                    str(val_nm).strip() if isinstance(val_nm, (str, int, float)) else ""
                )

                val_price = item.get("price") or item.get("unitprice")
                price_str = (
                    str(val_price).strip()
                    if isinstance(val_price, (str, int, float))
                    else ""
                )

                if not name or not price_str:
                    continue

                try:
                    clean_price = re.sub(r"[^\d.]", "", price_str)
                    parsed_items.append(
                        {"product_name": name, "price": float(clean_price)}
                    )
                except ValueError:
                    continue

        return parsed_items
