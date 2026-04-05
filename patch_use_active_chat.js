const fs = require("node:fs");

const file = "hooks/use-active-chat.tsx";
let code = fs.readFileSync(file, "utf8");

const importLine = 'import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";';
code = code.replace(importLine, 'import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";\nimport { useEffect as useIsomorphicLayoutEffect } from "react";');

const initialModel = `  const [currentModelId, setCurrentModelId] = useState(DEFAULT_CHAT_MODEL);
  const currentModelIdRef = useRef(currentModelId);
  useEffect(() => {
    currentModelIdRef.current = currentModelId;
  }, [currentModelId]);

  useEffect(() => {
    if (isNewChat) {
      fetch("/api/user/default-model").then(r => r.json()).then(defaultModel => {
        if(defaultModel) setCurrentModelId(defaultModel);
      }).catch(console.error);
    }
  }, [isNewChat]);`;

code = code.replace('  const [currentModelId, setCurrentModelId] = useState(DEFAULT_CHAT_MODEL);\n  const currentModelIdRef = useRef(currentModelId);\n  useEffect(() => {\n    currentModelIdRef.current = currentModelId;\n  }, [currentModelId]);', initialModel);

fs.writeFileSync(file, code);
