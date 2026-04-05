const fs = require("node:fs");

const file = "lib/subscription.ts";
let code = fs.readFileSync(file, "utf8");

// Ajouter maxTags aux limites
code = code.replace('newsSearchesPerDay: 3,\n      healthRequestsPerMonth: 5,\n    },\n  },\n  plus: {', 'newsSearchesPerDay: 3,\n      healthRequestsPerMonth: 5,\n      maxTags: 5,\n    },\n  },\n  plus: {');
code = code.replace('newsSearchesPerDay: 15,\n      healthRequestsPerMonth: 20,\n    },\n  },\n  pro: {', 'newsSearchesPerDay: 15,\n      healthRequestsPerMonth: 20,\n      maxTags: 10,\n    },\n  },\n  pro: {');
code = code.replace('newsSearchesPerDay: 50,\n      healthRequestsPerMonth: -1,\n    },\n  },\n  max: {', 'newsSearchesPerDay: 50,\n      healthRequestsPerMonth: -1,\n      maxTags: 20,\n    },\n  },\n  max: {');
code = code.replace('newsSearchesPerDay: -1,\n      healthRequestsPerMonth: -1,\n    },\n  },\n};', 'newsSearchesPerDay: -1,\n      healthRequestsPerMonth: -1,\n      maxTags: 50,\n    },\n  },\n};');

fs.writeFileSync(file, code);
