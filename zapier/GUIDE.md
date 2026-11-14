# Scan & Cook sur Zapier Chatbots — guide pas à pas

Tout tient dans le plan **gratuit** de Zapier (2 chatbots, directive personnalisée).
Les noms de menus peuvent légèrement varier : cherche le libellé le plus proche.

## 1. Créer le chatbot
1. Va sur https://zapier.com/app/chatbots et connecte-toi (« Continue with Google »).
2. Clique sur **Create** (ou « + New chatbot »), puis **Start from scratch** (partir de zéro).
3. **Nom** : `Scan & Cook`
4. **Description** (si demandée) : `Un bip, une recette. Ton coach cuisine qui transforme un produit de supermarché en recette adaptée à ton objectif.`

## 2. Le cerveau du chatbot
5. Champ **Directive** : colle tout le contenu de `directive.txt`.
6. Champ **Greeting** (message d'accueil) : colle `greeting.txt`.
7. **Suggested responses / opening prompts** (boutons proposés) : ajoute les 4 lignes de `suggestions.txt`, une par bouton.
8. **Modèle d'IA** : garde le modèle proposé par défaut sur le plan gratuit.

## 3. L'apparence (onglet Theme / Style)
9. **Couleur principale** : `#2E9E5B` (vert). Couleur d'accent si demandée : `#F28C28` (orange).
10. **Couleur du texte** : `#1F2A24`. **Fond** : `#F6F8F5`.
11. **Embed logo / avatar** : importe `logo-scan-cook.png`.

## 4. Tester et rendre le projet
12. Clique sur **Preview** / **Test** et fais le parcours complet (voir la liste ci-dessous).
13. Clique sur **Share** (ou Publish) et copie le **lien public** : c'est ce lien que tu rends.

## Parcours de test
- « C'est parti » → les 6 questions arrivent une par une → récapitulatif + 3 chiffres + mention « pas un avis médical ».
  Exemple : Femme, 25 ans, 65 kg, 170 cm, légèrement active, maintien → environ 1 427 / 1 961 / 650 kcal.
- « pois chiches en boîte » → recette au format attendu (badges, macros, liste de courses, étapes, astuce, mention).
- Répondre 1 → une recette différente. Répondre 2 → ajoutée aux favoris. « Mes favoris » → la liste.
- Avec l'allergie « Fruits à coque » : « Nutella » → alerte AVANT la recette, avec le choix 1) / 2).
- « lessive » → refus gentil.
