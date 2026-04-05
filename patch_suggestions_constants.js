const fs = require("node:fs");

const file = "lib/constants.ts";
let code = fs.readFileSync(file, "utf8");

const newSuggestions = `
export const suggestions = [
  "Rédige un plan projet pour lancer une nouvelle fonctionnalité IA.",
  "Crée un résumé des actions à faire cette semaine avec priorités.",
  "Aide-moi à structurer une base de connaissances pour mon équipe.",
  "Propose 5 idées de contenu pour présenter mon produit en français.",
  "Écris un email professionnel pour demander un retour client.",
  "Explique-moi l'apprentissage profond comme si j'avais 10 ans.",
  "Aide-moi à déboguer un composant React qui ne se met pas à jour.",
  "Quels sont les meilleurs frameworks frontend en 2024 ?",
];
`;

code = code.replace(
  'export const suggestions = [\n  "Rédige un plan projet pour lancer une nouvelle fonctionnalité IA.",\n  "Crée un résumé des actions à faire cette semaine avec priorités.",\n  "Aide-moi à structurer une base de connaissances pour mon équipe.",\n  "Propose 5 idées de contenu pour présenter mon produit en français.",\n];',
  newSuggestions
);

fs.writeFileSync(file, code);
