#!/bin/bash

URL="https://quill-writer.firebaseapp.com/#/"

PROMPTS="1 2 3 4 5"

USERS="1 2"

newRandomThing()
{
  echo "`od -vAn -N4 -tu4 < /dev/urandom | md5`"
}

for p in $PROMPTS;
do
  echo "URLS for Prompt $p"
  SESSION=`newRandomThing`
  for u in $USERS;
  do
    USER=`newRandomThing`
    echo "$URL?uid=$USER&sid=$SESSION&activityPrompt=$p"
  done
  echo "========================"
done
