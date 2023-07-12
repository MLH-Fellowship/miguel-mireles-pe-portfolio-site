#!/bin/bash

# API URL
API_URL="$1"

# Generate a random timeline post
RANDOM_NAME=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 10 | head -n 1)
RANDOM_EMAIL="${RANDOM_NAME}@example.com"
RANDOM_CONTENT="Random content for ${RANDOM_NAME}"

# POST request to create a timeline post
POST_RESPONSE=$(curl --request POST "${API_URL}/api/timeline_post" \
  --data "name=${RANDOM_NAME}&email=${RANDOM_EMAIL}&content=${RANDOM_CONTENT}" \
  --silent)

# Check if the POST request was successful
if [[ $POST_RESPONSE == *"\"id\""* ]]
then
  echo "Timeline post created successfully."

  # GET request to retrieve the timeline posts
  GET_RESPONSE=$(curl --request GET "${API_URL}/api/timeline_post" --silent)

  # Check if the created timeline post is present in the GET response
  if [[ $GET_RESPONSE == *"${RANDOM_NAME}"* ]]
  then
    echo "Timeline post was added successfully."

    # Extract the post ID from the post response
    POST_ID=$(echo "${POST_RESPONSE}" | jq -r '.id')

    # DELETE request to delete the timeline post
    DELETE_RESPONSE=$(curl --request DELETE "${API_URL}/api/timeline_post/${POST_ID}" --silent)

    # Check if the DELETE request was successful
    if [[ $DELETE_RESPONSE == *"Successfully deleted"* ]]
    then
      echo "Timeline post was deleted successfully."
    else
      echo "Failed to delete the timeline post."
    fi
  else
    echo "Failed to retrieve the timeline post."
  fi
else
  echo "Failed to create the timeline post."
fi

