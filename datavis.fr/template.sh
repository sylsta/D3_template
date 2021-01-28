#!/usr/bin/env bash
# -*- coding: utf-8 -*-

if [ "$#" -ne 1 ]; then
 echo "Usage : ./template.sh \$1"
 echo "   \$1 => chaîne = nom de la copie des fichiers de template"
 exit -1
fi
cp template.css $1.css
cp template.js $1.js
cp template.html $1.html

sed -i -e "s/template/$1/g" $1.html
mkdir d3js/$1