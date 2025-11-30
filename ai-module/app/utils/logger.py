import logging
import sys

def get_logger(name: str = "SmartReceipt"):
    """
    Configures a logger that outputs to stdout (cloud-friendly).
    """
    logger = logging.getLogger(name)
    
    # Prevent adding multiple handlers if get_logger is called multiple times
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            '%(asctime)s | %(levelname)-8s | %(name)s | %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
    return logger
