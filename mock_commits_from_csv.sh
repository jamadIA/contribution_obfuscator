#!/bin/bash

# Each line in the file should be in the format: YYYY-MM-DD,NUM_COMMITS
GIT_URL="$1"
CONTRIBUTIONS_FILE="${2:-./contributions.csv}"

# Name of the file that will be modified and committed.
ACTIVITY_LOG_FILE="mock-activity.log"
SCRIPT_PATH="$(dirname $(realpath "$0"))"
TMP_REPO_DIR_NAME="tmp_clone"
TMP_REPO_DIR_PATH="$SCRIPT_PATH/$TMP_REPO_DIR_NAME"

if [[ ! -f "$CONTRIBUTIONS_FILE" ]]; then
  echo "Error: Contributions file '$CONTRIBUTIONS_FILE' not found."
  echo "Please create it with one entry per line in 'YYYY-MM-DD:NUM_COMMITS' format."
  exit 1
fi

if [[ -z "$GIT_URL" ]]; then
  echo "Usage: $0 <repository-url> <contribution-csv>"
fi


git clone "$GIT_URL" "$TMP_REPO_DIR_PATH" || { echo "Error: Could not clone repository. Make sure it doesn't already exist. The script is being stopped."; exit 1; }

> "$TMP_REPO_DIR_PATH/$ACTIVITY_LOG_FILE" || { echo "Error: Could not create/clear '$ACTIVITY_LOG_FILE'. Check permissions."; exit 1; }

echo "Starting to generate Git contributions from '$CONTRIBUTIONS_FILE'..." 
while IFS=',' read -r date count; do 
  if [[ -z "$date" || -z "$count" ]]; then 
    echo "Warning: Skipping invalid line: '$date $count' in '$CONTRIBUTIONS_FILE'."
    continue
  fi

  if ! [[ "$date" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
    echo "Warning: Skipping '$date' due to invalid format. Date must be in the form YYYY-MM-DD only."
    continue
  fi

  if ! [[ "$count" =~ ^[0-9]+$ ]]; then 
    echo "Warning: Skipping '$date' due to invalid commit count: '$count'. Count must be a non-negative number."
    continue
  fi

  for ((i = 1; i <= count; i++)); do
    echo "$date mock commit" >> "$ACTIVITY_LOG_FILE"
    git add "$ACTIVITY_LOG_FILE"

    hour=$((RANDOM % 23))
    minute=$((RANDOM % 59))
    commit_date="${date}T$(printf "%02d:%02d:00" "$hour" "$minute")"

    GIT_AUTHOR_DATE="$commit_date" \
    GIT_COMMITTER_DATE="$commit_date" \
    git commit -m "Commit #$i on $date" > /dev/null 2>&1

    if [[ $? -ne 0 ]]; then
      echo "Error: Git commit failed for $date, commit #$i/$count. Check your Git setup."
      exit 1
    else
      echo "Committed #$i for $date at $(printf "%02d:%02d" "$hour" "$minute")"
    fi
  done
done < "$CONTRIBUTIONS_FILE"

#rm -f "$TMP_REPO_DIR_PATH/.git"
#rm -r "$TMP_REPO_DIR_PATH"

echo "Contribution generation complete! Look up the git log."
