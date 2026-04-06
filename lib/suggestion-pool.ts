export const suggestionPool = [
  "Rédige un plan projet pour lancer une nouvelle fonctionnalité IA.",
  "Crée un résumé des actions à faire cette semaine avec priorités.",
  "Aide-moi à structurer une base de connaissances pour mon équipe.",
  "Propose 5 idées de contenu pour présenter mon produit en français.",
  "Prépare un email client pour annoncer une évolution produit.",
  "Construis une checklist d'onboarding pour un nouveau collaborateur.",
  "Transforme ces notes en plan d'exécution sur 30 jours.",
  "Fais un audit rapide UX de ma landing page.",
  "Génère un script de réunion hebdo avec points d'action.",
  "Propose des KPI simples pour suivre mon projet.",
  "Résume ce texte en version executive puis version opérationnelle.",
  "Aide-moi à écrire une FAQ produit claire en français.",
  "Crée une to-do list priorisée à partir de mon objectif principal.",
  "Donne 10 idées de posts LinkedIn pour mon activité.",
  "Prépare un plan de tests pour valider une nouvelle feature.",
  "Rédige un brief créatif pour une campagne marketing.",
  "Crée un tableau de risques projet avec mitigation.",
  "Écris un template de compte-rendu de réunion actionnable.",
  "Propose un workflow no-code pour automatiser mes tâches répétitives.",
  "Aide-moi à clarifier la proposition de valeur de mon produit.",
] as string[];

export function pickRandomSuggestions(count = 4): string[] {
  const copy = [...suggestionPool];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j] as string, copy[i] as string];
  }

  return copy.slice(0, Math.min(count, copy.length));
}
