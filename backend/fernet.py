import os
import subprocess
from cryptography.fernet import Fernet

key = Fernet.generate_key()
fernet_key = key.decode()

# Use setx to set the environment variable permanently
subprocess.run(['setx', 'FERNET_KEY', fernet_key])

print("Fernet Key has been set as a permanent environment variable.")
