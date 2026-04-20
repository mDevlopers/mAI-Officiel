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
let cachedGatewayProvider:
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

function getGatewayProvider(): ReturnType<typeof createOpenAI> | null {
  if (cachedGatewayProvider !== undefined) {
    return cachedGatewayProvider;
  }

  const gatewayKey = process.env.AI_GATEWAY_API_KEY;
  if (!gatewayKey) {
    cachedGatewayProvider = null;
    return cachedGatewayProvider;
  }

  cachedGatewayProvider = createOpenAI({
    apiKey: gatewayKey,
    baseURL: "https://ai-gateway.vercel.sh/v1",
  });

  return cachedGatewayProvider;
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
  if (fsProvider) {
    return fsProvider.chat(normalizeModelId(modelId));
  }

  const gatewayProvider = getGatewayProvider();
  if (gatewayProvider) {
    return gatewayProvider.chat(modelId);
  }

  throw new Error(
    "No AI provider is initialized. Configure FS_API_KEY or AI_GATEWAY_API_KEY."
  );
}

export function getTitleModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }

  const fsProvider = getFsProvider();
  if (fsProvider) {
    return fsProvider.chat(normalizeModelId(titleModel.id));
  }

  const gatewayProvider = getGatewayProvider();
  if (gatewayProvider) {
    return gatewayProvider.chat(titleModel.id);
  }

  throw new Error(
    "No AI provider is initialized. Configure FS_API_KEY or AI_GATEWAY_API_KEY."
  );
}
