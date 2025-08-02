#!/bin/bash

from="${2:-$(date -d "1 year ago" +"%Y")-01-01}"
output_file="${1:-remote_contribution_graph.csv}"

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
> "$output_file"

exit $?

# TODO delete:
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
