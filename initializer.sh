#!/bin/sh
MAX_RETRIES=20
RETRY_COUNT=0
API_URL="http://api:3000"

echo "Starting API readiness check..."

# Loop until API is ready or max retries are reached
while [ "$RETRY_COUNT" -lt "$MAX_RETRIES" ]; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/setup/ping")
  if [ "$HTTP_CODE" -eq 200 ]; then
    echo "API is ready (status 200)!"
    break # Exit the loop if successful
  else
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "Waiting for API to be ready... (Attempt $RETRY_COUNT/$MAX_RETRIES, Status: $HTTP_CODE)"
    sleep 2
  fi
done

# Check if the loop completed successfully or exhausted retries
if [ "$RETRY_COUNT" -eq "$MAX_RETRIES" ]; then
  echo "ERROR: API did not become ready after $MAX_RETRIES attempts. Exiting."
  exit 1 # Exit with a non-zero status to indicate failure
fi

echo "API is ready! Executing initialization requests..."
echo "Creating client table..."
curl -X POST -H "x-api-key: $ADMIN_API_KEY" "$API_URL/api/setup/create-client-table" || exit 1
echo "" # Add a newline for readability
echo "Inserting test client..."
curl -X POST -H "x-api-key: $ADMIN_API_KEY" "$API_URL/api/setup/insert-test-client" || exit 1
echo "Create words table..."
curl -X POST -H "x-api-key: $ADMIN_API_KEY" "$API_URL/api/words/create-words-table" || exit 1
echo "Insert test words..."
curl -X POST -H "x-api-key: $ADMIN_API_KEY" "$API_URL/api/words/add/multiple" || exit 1      
echo ""