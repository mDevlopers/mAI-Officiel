const fs = require('fs');
let code = fs.readFileSync('components/chat/message-actions.tsx', 'utf8');

const replacement = `  const usedTools = message.parts
    ?.filter((part) => part.type === "tool-invocation" || part.type.startsWith("tool-"))
    .map((part) => {
      // In Vercel AI SDK, tool-invocation has toolName, or if we map internal types starting with tool-
      if ("toolName" in part) return part.toolName;
      if (part.toolInvocation?.toolName) return part.toolInvocation.toolName;
      return part.type.replace("tool-", "");
    });`;

code = code.replace(
  /  const usedTools = message\.parts\n    \?\.filter\(\(part\) => part\.type\.startsWith\("tool-"\)\)\n    \.map\(\(part\) => \{\n      const toolName = part\.type\.replace\("tool-", ""\);\n      return toolName;\n    \}\);/,
  replacement
);

fs.writeFileSync('components/chat/message-actions.tsx', code);
