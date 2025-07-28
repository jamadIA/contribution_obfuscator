#!/bin/bash

if ! [ -f $1 ]; then
  echo "Usage: $0 <start-date> [OPTIONS]"
  exit 1
fi

start_date="$1"

LOCALPYTHON
command -v python >/dev/null 2>&1
if [ -z $@ ]; then
  LOCALPYTHON='python'
else
  command -v python3 >/dev/null 2>&1
  if [ -z $@ ]; then
    LOCALPYTHON='python3'
  else
    echo "Python not found. Install it and run the script again."
    exit 1
fi

$LOCALPYTHON git_obfuscate.py "$@"

shift 1

echo "$@"
