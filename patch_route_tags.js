const fs = require("node:fs");

const file = "app/api/chat/route.ts";
let code = fs.readFileSync(file, "utf8");

code = code.replace(
  '      selectedVisibilityType,\n      contextualActions,\n      ghostMode,\n    } = requestBody;',
  '      selectedVisibilityType,\n      contextualActions,\n      ghostMode,\n      tags,\n    } = requestBody;'
);

code = code.replace(
  '        title: "New chat",\n        visibility: selectedVisibilityType,\n      });\n      titlePromise = generateTitleFromUserMessage({ message });',
  '        title: "New chat",\n        visibility: selectedVisibilityType,\n        tags: tags || [],\n      });\n      titlePromise = generateTitleFromUserMessage({ message });'
);

fs.writeFileSync(file, code);
