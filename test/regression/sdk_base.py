
import asyncio
import ssl
import certifi
import os
from avantis_trader_sdk import TraderClient

os.environ['SSL_CERT_FILE'] = certifi.where()
os.environ['REQUESTS_CA_BUNDLE'] = certifi.where()
ssl._create_default_https_context = ssl._create_unverified_context

async def retry_with_backoff(func, max_retries=3, initial_delay=1):
    for attempt in range(max_retries):
        try:
            return await func()
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "Too Many Requests" in error_str:
                if attempt < max_retries - 1:
                    delay = initial_delay * (2 ** attempt)
                    await asyncio.sleep(delay)
                    continue
            raise e
    raise Exception("Max retries exceeded")

def create_client(provider, private_key):
    client = TraderClient(provider)
    client.set_local_signer(private_key)
    return client

def get_trader_address(client):
    signer = client.get_signer()
    if not signer:
        return None
    return signer.get_ethereum_address()
