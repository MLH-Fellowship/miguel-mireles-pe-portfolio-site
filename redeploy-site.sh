#!/bin/bash

# Step 1: cd into the repository
cd ~/miguel-mireles-pe-portfolio-site/

# Step 2: Update the git repository with the latest changes
git fetch && git reset origin/main --hard

# Step 3: Spin containers down to prevent out of memory issues on our VPS instances when building
docker compose -f docker-compose.prod.yml down

# Step 4: Build the containers with the latest changes and spin them back up
docker compose -f docker-compose.prod.yml up -d --build

# Print a success message
echo "Site redeployed successfully!"