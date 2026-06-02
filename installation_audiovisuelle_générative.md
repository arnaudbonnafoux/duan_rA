C'est un projet très cohérent pour le web.

Tu peux considérer ta page comme une **installation audiovisuelle générative** :

```text
Moteur sonore (Web Audio API)
            ↕
      Paramètres communs
            ↕
Moteur visuel (Canvas/WebGL)
```

L'idée intéressante est de ne pas faire le son et l'image séparément. Utilise les mêmes variables pour piloter les deux.

Par exemple :

```js
const energy = Math.random();
```

Cette variable peut :

* augmenter la fréquence d'un oscillateur ;
* accélérer la rotation d'une forme ;
* modifier la couleur ;
* augmenter le nombre de particules.

Ainsi, le son et l'image semblent naturellement liés.

### Quelques pistes simples pour commencer

#### Installation "drone"

* 3 à 5 oscillateurs.
* Fréquences qui dérivent lentement.
* Cercles translucides qui flottent.
* Dégradés de couleurs évolutifs.

#### Installation "chaotique"

* Fréquences aléatoires.
* Bruits filtrés.
* Particules nombreuses.
* Distorsions visuelles.

#### Installation "cosmique"

* Drones graves.
* Étoiles génératives.
* Mouvement lent de caméra.
* Réverbération importante.

---

### Technologies que je choisirais

Pour une première version :

* Canvas 2D natif
* Web Audio API
* JavaScript pur

Pas besoin de bibliothèque.

Quand tu voudras aller plus loin :

* p5.js pour accélérer le développement créatif ;
* Three.js pour la 3D ;
* WebGL shaders pour des effets visuels plus expérimentaux.

---

### Une idée qui fonctionne bien

Crée une installation qui ne produit jamais exactement le même résultat.

Au chargement :

```js
const seed = Date.now();
```

Cette graine influence :

* les fréquences ;
* les rythmes ;
* les couleurs ;
* les mouvements.

Chaque visite devient alors une performance unique.

C'est une approche très utilisée dans l'art génératif : le programme est l'œuvre, et chaque exécution en est une interprétation.

Et comme tout est déjà en JavaScript, le jour où tu voudras enregistrer certaines sessions, tu pourras capturer :

* le Canvas → vidéo ;
* le Web Audio → audio ;
* puis assembler le tout avec FFmpeg pour créer des pièces audiovisuelles exportables. 😉
