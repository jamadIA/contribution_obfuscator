#!/bin/bash

# Configuration
# Define the file from which to read contribution data.
# Each line in the file should be in the format: YYYY-MM-DD:NUM_COMMITS
CONTRIBUTIONS_FILE="contributions.txt"

# Name of the file that will be modified and committed.
ACTIVITY_LOG_FILE="activity.log"

# --- Script Start ---

# Check if the contributions file exists.
if [[ ! -f "$CONTRIBUTIONS_FILE" ]]; then
  echo "Error: Contributions file '$CONTRIBUTIONS_FILE' not found."
  echo "Please create it with one entry per line in 'YYYY-MM-DD:NUM_COMMITS' format."
  exit 1
fi

# Initialize or clear the activity log file.
# This ensures a clean slate each time the script runs.
> "$ACTIVITY_LOG_FILE" || { echo "Error: Could not create/clear '$ACTIVITY_LOG_FILE'. Check permissions."; exit 1; }

echo "Starting to generate Git contributions from '$CONTRIBUTIONS_FILE'..."

# Read contributions line by line from the file.
while IFS=':' read -r date count || [[ -n "$date" ]]; do
  # Skip empty lines or lines that don't match the expected format.
  if [[ -z "$date" || -z "$count" ]]; then
    echo "Warning: Skipping invalid line: '$date:$count' in '$CONTRIBUTIONS_FILE'."
    continue
  fi

  # Validate the count is a positive number.
  if ! [[ "$count" =~ ^[0-9]+$ ]] || (( count < 0 )); then
    echo "Warning: Skipping '$date' due to invalid commit count: '$count'. Count must be a non-negative number."
    continue
  fi

  # Loop to create commits for the current date.
  for ((i = 1; i <= count; i++)); do
    # Append a unique message to the activity log file for each commit.
    echo "$date commit #$i" >> "$ACTIVITY_LOG_FILE"
    git add "$ACTIVITY_LOG_FILE"

    # Generate random hour and minute for the commit timestamp.
    hour=$((RANDOM % 23))
    minute=$((RANDOM % 59))
    commit_date="${date}T$(printf "%02d:%02d:00" "$hour" "$minute")"

    # Set GIT_AUTHOR_DATE and GIT_COMMITTER_DATE to control the commit timestamp.
    GIT_AUTHOR_DATE="$commit_date" \
    GIT_COMMITTER_DATE="$commit_date" \
    git commit -m "Commit #$i on $date" > /dev/null 2>&1

    if [[ $? -ne 0 ]]; then
      echo "Error: Git commit failed for $date, commit #$i. Check your Git setup."
      exit 1
    else
      echo "  Committed #$i for $date at $(printf "%02d:%02d" "$hour" "$minute")"
    fi
  done
done < "$CONTRIBUTIONS_FILE"

echo "Contribution generation complete!"
