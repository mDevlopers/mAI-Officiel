git checkout lib/db/schema.ts
sed -i 's/files: json("files").default(\[\]), \/\/ uploaded files metadata/files: json("files").default(\[\]), \/\/ uploaded files metadata\n  agentIds: json("agentIds").$type<string[]>().default(\[\]), \/\/ selected mAI ids/g' lib/db/schema.ts
