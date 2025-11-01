#!/bin/bash

# Dossier à traiter (par défaut : dossier courant)
DIR="${1:-.}"
PREFIX="visuel"
COUNT=1

echo "Renommage des images dans : $DIR"
echo "--------------------------------"

# On se place dans le dossier
cd "$DIR" || { echo "Dossier introuvable : $DIR"; exit 1; }

# Trie les fichiers JPEG et PNG (insensibles à la casse)
for file in $(find . -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) | sort); do
    EXT="${file##*.}"
    NEW_NAME="${PREFIX}_${COUNT}.${EXT,,}"  # Extension en minuscules
    echo "Renomme : $file → $NEW_NAME"
    mv -i "$file" "$NEW_NAME"
    COUNT=$((COUNT + 1))
done

echo "Renommage terminé."
