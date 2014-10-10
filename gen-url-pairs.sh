#!/bin/bash

URL="https://quill-writer.firebaseapp.com/#/"

PROMPTS="1 2 3 4 5 6"

USERS="1 2"
PAIRSNEEDEDPERPROMPT="5"


newRandomThing()
{
  echo "`od -vAn -N4 -tu4 < /dev/urandom | cksum | awk '{print $1}'`"
}

for p in $PROMPTS;
do
  echo "ActivityPrompt $p"
  for s in `seq 1 $PAIRSNEEDEDPERPROMPT`
  do
    SESSION=`newRandomThing`
    echo "Session $s"
    for u in $USERS;
    do
      USER=`newRandomThing`
      echo "$URL?uid=$USER&sid=$SESSION&activityPrompt=$p"
    done
  done
done
