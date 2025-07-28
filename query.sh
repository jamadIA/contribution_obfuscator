#!/bin/bash

command -v gh >/dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "gh command not found. install github cli first."
  exit 1
fi

from="${1:-$(date -d "1 year ago" +"%Y")-01-01}"

gh api graphql \
-F from="$from"'T00:00:01Z' \
-f query='
  query($from: DateTime!) {
    viewer {
      contributionsCollection(from: $from) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }' | jq \
-r '.data.viewer.contributionsCollection.contributionCalendar.weeks[] | .contributionDays[] | "\(.date),\(.contributionCount)"' \
> contribution_graph.csv

exit 0


GIT_USERNAME="$1"
from="${2:-2024-01-01}"
to="${3:-2024-12-31}"

gh api graphql -F username="$GIT_USERNAME" \
-F from="$from"'T00:00:00Z' \
-F to="$to"'T23:59:59Z' \
-f query='
  query($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }' | jq \
-r '.data.user.contributionsCollection.contributionCalendar.weeks[] | .contributionDays[] | "\(.date),\(.contributionCount)"' \
> contribution_graph.csv
