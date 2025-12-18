#!/bin/bash

# Script pour convertir et redimensionner les nouvelles images
# Format: WebP 1920x1920px (comme les images existantes)

DIR="${1:-.}"
cd "$DIR" || { echo "Erreur: dossier '$DIR' introuvable"; exit 1; }

echo "🔄 Conversion des images visuel_23 à visuel_31..."

for i in {23..31}; do
  FILE="visuel_$i.png"
  OUTPUT="visuel_$i.webp"
  
  if [ -f "$FILE" ]; then
    echo "📸 Traitement: $FILE..."
    
    # Redimensionner et convertir en WebP
    convert "$FILE" -resize 1920x1920 -quality 80 "$OUTPUT"
    
    if [ $? -eq 0 ]; then
      echo "✅ $OUTPUT créé"
      # Optionnel: supprimer l'original PNG
      # rm "$FILE"
    else
      echo "❌ Erreur lors de la conversion de $FILE"
    fi
  else
    echo "⚠️  $FILE non trouvé"
  fi
done

echo "✨ Conversion terminée!"
