const fs = require("fs");
let content = fs.readFileSync(
  "components/ai-elements/model-selector.tsx",
  "utf8"
);

const oldLogoFunction = `export const ModelSelectorLogo = ({
  provider,
  className,
  ...props
}: ModelSelectorLogoProps) => (
  <img
    {...props}
    alt={\`\${provider} logo\`}
    className={cn("size-4 dark:invert", className)}
    height={16}
    src={\`https://models.dev/logos/\${provider}.svg\`}
    width={16}
  />
);`;

const newLogoFunction = `export const ModelSelectorLogo = ({
  provider,
  className,
  ...props
}: ModelSelectorLogoProps) => {
  let logoProvider = provider;
  if (provider === "ollama") logoProvider = "meta";
  if (provider === "openrouter") logoProvider = "fastrouter";

  return (
    <img
      {...props}
      alt={\`\${provider} logo\`}
      className={cn("size-4 dark:invert", className)}
      height={16}
      src={\`https://models.dev/logos/\${logoProvider}.svg\`}
      width={16}
    />
  );
};`;

content = content.replace(oldLogoFunction, newLogoFunction);
fs.writeFileSync("components/ai-elements/model-selector.tsx", content);
