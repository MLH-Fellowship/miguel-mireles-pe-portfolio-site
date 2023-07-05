#!/bin/bash

# Step 1: Kill all existing tmux sessions
tmux kill-session -a

# Step 2: cd into the repository
cd miguel-mireles-pe-portfolio-site/

# Step 3: Update the git repository with the latest changes
git fetch && git reset origin/main --hard

# Step 4: Activate the Python virtual environment and install dependencies
python -m venv python3-virtualenv
source python3-virtualenv/bin/activate
pip install -r requirements.txt

# Step 5: Start a new detached tmux session and run the Flask server
tmux new-session -d -s flask-session 'flask run --host=0.0.0.0'

# Print a success message
echo "Site redeployed successfully!"
