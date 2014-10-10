#!/bin/bash

URL="https://quill-writer.firebaseapp.com/#/"

PROMPTS="1 2 3 4 5"

USERS="1 2"
PAIRSNEEDED="50"

newRandomThing()
{
  echo "`od -vAn -N4 -tu4 < /dev/urandom | md5`"
}

for p in $PROMPTS;
do
  echo "======================"
  echo "= URLS for Prompt $p ="
  echo "======================"
  SESSION=`newRandomThing`
  echo " Session ID: $SESSION"
  echo " Players:"
  for u in $USERS;
  do
    USER=`newRandomThing`
    echo "     User ID: $USER"
    echo "     $URL?uid=$USER&sid=$SESSION&activityPrompt=$p"
  done
done
