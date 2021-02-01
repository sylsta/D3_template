#!/usr/bin/env bash
# -*- coding: utf-8 -*-

if [ "$#" -ne 2 ]; then
 echo "Usage : ./template.sh \$1 \$2"
 echo "   \$1 => chaîne = nom du projet à cloner."
 echo "   \$2 => chaîne = nom du nouveau projet"
 exit -1
fi

# todo : tester l'existence des fichiers et répertoires
cp $1.css $2.css
cp $1.js $2.js
cp $1.html $2.html
cp -r d3js/$1 d3js/$2
