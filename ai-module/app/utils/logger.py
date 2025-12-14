import logging
from rich.logging import RichHandler


def get_logger(name: str = "SmartReceipt"):
    """
    Configures a logger using Rich for beautiful, structured output.
    """
    logger = logging.getLogger(name)
    logger.propagate = False
    if not logger.handlers:
        logger.setLevel(logging.INFO)

        # RichHandler automatycznie formatuje timestamp i kolory
        handler = RichHandler(
            rich_tracebacks=True,  # Piękne formatowanie błędów (Traceback)
            show_time=True,
            show_path=False  # Ukrywa ścieżkę pliku, żeby było czyściej (opcjonalne)
        )

        # Opcjonalnie: prosty format, bo Rich i tak robi swoje
        formatter = logging.Formatter('%(message)s', datefmt='%Y-%m-%d %H:%M:%S')
        handler.setFormatter(formatter)

        logger.addHandler(handler)

    return logger