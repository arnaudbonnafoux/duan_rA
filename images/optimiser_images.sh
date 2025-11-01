#!/bin/bash

# Dossier source et destination
SRC_DIR="${1:-.}"
DST_DIR="${2:-./images_optimisees}"
MAX_WIDTH=1920
JPEG_QUALITE=85  # Qualité JPEG : 85% (ajustable)

# Vérifications des outils
for cmd in convert jpegoptim optipng; do
    command -v $cmd >/dev/null 2>&1 || { echo >&2 "$cmd n'est pas installé. Installez-le avec : sudo apt install imagemagick jpegoptim optipng"; exit 1; }
done

echo "Optimisation des images..."
echo "Source : $SRC_DIR"
echo "Destination : $DST_DIR"
echo "Largeur max : $MAX_WIDTH px"
echo "Qualité JPEG : $JPEG_QUALITE%"
echo "-----------------------------"

# Traite les images
find "$SRC_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) -print0 | while IFS= read -r -d '' img; do
    # Chemin relatif
    rel_path="${img#$SRC_DIR/}"
    dst_path="$DST_DIR/$rel_path"
    dst_dir=$(dirname "$dst_path")

    mkdir -p "$dst_dir"

    echo "Traitement : $rel_path"

    # Redimensionner d'abord dans un fichier temporaire
    convert "$img" -resize "${MAX_WIDTH}x>" "$dst_path"

    # Compression selon format
    if [[ "$dst_path" =~ \.jpe?g$ ]]; then
        jpegoptim --max=$JPEG_QUALITE --strip-all "$dst_path" > /dev/null
    elif [[ "$dst_path" =~ \.png$ ]]; then
        optipng -o2 "$dst_path" > /dev/null
    fi
done

echo "Optimisation terminée. Fichiers disponibles dans : $DST_DIR"
