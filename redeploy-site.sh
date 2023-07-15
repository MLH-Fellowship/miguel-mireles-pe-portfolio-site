#!/bin/bash

# Step 1: cd into the repository
cd ~/miguel-mireles-pe-portfolio-site/

# Step 2: Update the git repository with the latest changes
git fetch && git reset origin/main --hard

# Step 3: Activate the Python virtual environment and install dependencies
python -m venv python3-virtualenv
source python3-virtualenv/bin/activate
pip install -r requirements.txt

# Step 4: Restart myportfolio service
systemctl restart myportfolio

# Print a success message
echo "Site redeployed successfully!"
