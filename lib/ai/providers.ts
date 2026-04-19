import { customProvider } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { isTestEnvironment } from "../constants";
import { titleModel } from "./models";

const FS_API_BASE_URL =
  process.env.FS_API_BASE_URL ?? "https://api.francestudent.org/v1/";
const FS_API_KEY = process.env.FS_API_KEY;

function normalizeModelId(modelId: string): string {
  const slashIndex = modelId.indexOf("/");
  return slashIndex !== -1 ? modelId.slice(slashIndex + 1) : modelId;
}

let cachedFsProvider:
  | ReturnType<typeof createOpenAI>
  | null
  | undefined;

function getFsProvider(): ReturnType<typeof createOpenAI> | null {
  if (cachedFsProvider !== undefined) {
    return cachedFsProvider;
  }

  if (isTestEnvironment) {
    cachedFsProvider = null;
    return cachedFsProvider;
  }

  if (!FS_API_KEY) {
    console.error(
      "[FranceStudent] FS_API_KEY manquante: le provider AI SDK est désactivé."
    );
    cachedFsProvider = null;
    return cachedFsProvider;
  }

  cachedFsProvider = createOpenAI({
    apiKey: FS_API_KEY,
    baseURL: FS_API_BASE_URL,
  });

  return cachedFsProvider;
}

export const myProvider = isTestEnvironment
  ? (() => {
      const { chatModel, titleModel } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "title-model": titleModel,
        },
      });
    })()
  : null;

export function getLanguageModel(modelId: string) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel(modelId);
  }

  const fsProvider = getFsProvider();

  if (!fsProvider) {
    throw new Error("FranceStudent provider is not initialized (missing FS_API_KEY)");
  }

  return fsProvider.chat(normalizeModelId(modelId));
}

export function getTitleModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }

  const fsProvider = getFsProvider();

  if (!fsProvider) {
    throw new Error("FranceStudent provider is not initialized (missing FS_API_KEY)");
  }

  return fsProvider.chat(normalizeModelId(titleModel.id));
}
