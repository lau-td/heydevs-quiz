#!/bin/bash

# Export specific environment variable from .env file
export GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_BASE64=$(grep '^GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_BASE64=' .env | cut -d '=' -f 2-)
echo $GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_BASE64 | base64 --decode >./google-sheet-service-account.json
