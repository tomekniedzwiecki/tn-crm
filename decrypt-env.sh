#!/bin/bash
# Decrypt .env file from .env.encrypted
# Usage: ./decrypt-env.sh

openssl enc -aes-256-cbc -d -pbkdf2 -in .env.encrypted -out .env
echo "Done! .env file created."
