#!/bin/bash

# Liste des extensions à traiter
extensions=("*.jpg" "*.png")

# Boucle sur chaque type de fichier
for ext in "${extensions[@]}"; do
  for fichier in $ext; do
    # Vérifie que le fichier existe (important si aucun fichier de ce type)
    [ -e "$fichier" ] || continue

    echo "🧹 Traitement de : $fichier"
    exiftool -all= -overwrite_original "$fichier"

    sauvegarde="${fichier}_original"
    if [ -f "$sauvegarde" ]; then
      rm "$sauvegarde"
      echo "🗑️ Sauvegarde supprimée : $sauvegarde"
    else
      echo "✅ Aucun fichier de sauvegarde à supprimer."
    fi

    echo ""
  done
done

echo "🎉 Nettoyage terminé."

