import logging
from rich.logging import RichHandler


def configure_logging():
    """
    Wymusza użycie Rich dla wszystkich loggerów, w tym Uvicorna i FastAPI.
    """
    # Konfiguracja bazowa
    logging.basicConfig(
        level=logging.INFO,
        format="%(message)s",
        datefmt="[%X]",
        handlers=[RichHandler(rich_tracebacks=True)]
    )

    # Uciszamy/podmieniamy handlery Uvicorna, żeby nie dublował logów
    # i używał naszego formatowania
    loggers = [
        "uvicorn",
        "uvicorn.access",
    ]

    for logger_name in loggers:
        logger = logging.getLogger(logger_name)
        logger.handlers = []
        logger.propagate = True

def get_logger(name: str = "SmartReceipt"):
    """
    Configures a logger using Rich for beautiful, structured output.
    """
    logger = logging.getLogger(name)
    logger.propagate = False
    if not logger.handlers:
        logger.setLevel(logging.INFO)

        handler = RichHandler(
            rich_tracebacks=True,
            show_time=True,
            show_path=True,  # Ukrywa ścieżkę pliku, żeby było czyściej (opcjonalne)
        )

        formatter = logging.Formatter("%(message)s", datefmt="%Y-%m-%d %H:%M:%S")
        handler.setFormatter(formatter)

        logger.addHandler(handler)

    return logger
