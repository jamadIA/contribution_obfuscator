#!/bin/bash

REPO_URL=""
CHART_FILE=""
REMOTE_GRAPH_FILE="remote_contribution_graph.csv"

SCRIPT_DIR="$(cd $(dirname "$0") || exit 1)"


declare LOCALPYTHON
command -v python3 >/dev/null 2>&1
if [[ $? == 0 ]]; then
  LOCALPYTHON='python3'
else
  command -v python >/dev/null 2>&1
  if [[ $? == 0 ]]; then
    LOCALPYTHON='python'
  else
    echo "Python not found. Install it and run the script again."
    exit 1
  fi
fi

ARGS=("$@")
for indx in "${!ARGS[@]}"; do
  if [[ "${ARGS[$indx]}" =~ ^(-f|--file)$ ]]; then
    CHART_FILE="${ARGS[$(($indx + 1))]}"
  elif [[ "${ARGS[$indx]}" =~ ^(-r|--repository)$ ]]; then
    REPO_URL="${ARGS[$(($indx + 1))]}"
  elif [[ "${ARGS[$indx]}" =~ ^-?-editor$ ]]; then
    cd "$SCRIPT_DIR"/UI || (echo "missing GUI deps. Quitting."; exit 1;)
    exit_status=0
    ttyd -i 127.0.0.1 --port 8888 --writable bash & #>/dev/null 2>&1 &
    ttyd_id="$!"
    $LOCALPYTHON -m http.server 8080 & 
    ps cax | grep "$ttyd_id" >/dev/null
    [ $? -eq 0 ] || echo "ttyd failed to open"
    server_id="`pgrep -f "python3 -m http.server 8080"`"
    [ $? == 0 ] && open "http://127.0.0.1:8080/" #>/dev/null 2>&1 &
    if [ $? == 0 ]; then
      echo "Press any key to disconnect"
      read -s -r -n 1
      echo
      echo "cleaning up server job id: $server_id"
      kill $server_id
    else
      echo "failed to host the server"
      exit_status=1
    fi
    echo "cleaning up ttyd job id: $ttyd_id"
    kill $ttyd_id
    exit $exit_status
  fi
done

exit 1



# Determine if we 1) use a .chart
#                 2) create a .chart
if [ -f $CHART_FILE ]; then
  # 1) use a .chart:
  # extract the header date timestamp
  # and query the remote

  if ! [[ "$CHART_FILE" =~ ^.*\.chart$ ]]; then
    echo -e "Warning: --file $(basename "$CHART_FILE") should have .chart extension"
  fi

  command -v gh >/dev/null 2>&1
  if [ $? -ne 0 ]; then
    echo "gh command not found."
    echo "the script will thus assume the remote chart is blank"
    read -p "Continue anyway? (y/N)" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      touch "$REMOTE_GRAPH_FILE" # mock empty remote
    else
      exit 1
    fi
  else
    bash $SCRIPT_DIR/query.sh "$REMOTE_GRAPH_FILE" "`head -c10 <"$CHART_FILE"`"
    if [ -n $? ]; then
      echo "Error occured while running the query.sh"
      exit 1
    fi
  fi
else # 2) create a .chart
  echo "Preparing to generate the .chart file"
fi




$LOCALPYTHON git_obfuscate.py "$@"
if [ -f $CHART_FILE ] && ! [ -z "$REPO_URL" ]; then 
  # if we used .chart file that means
  # we wanted to prepare commits based on it
  bash mock_commits_from_csv.sh "$REPO_URL"
fi
