import { exec } from "node:child_process";
import { promisify } from "node:util";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { command } = await req.json();

    if (!command || typeof command !== "string") {
      return NextResponse.json({ error: "Commande invalide" }, { status: 400 });
    }

    // Avertissement de sécurité : exécuter des commandes arbitraires est dangereux.
    // Ceci est une implémentation de base pour répondre au besoin, mais devrait être sandboxée en production (ex: Docker).

    // On ajoute un timeout pour éviter de bloquer indéfiniment
    const { stdout, stderr } = await execAsync(command, { timeout: 10_000 });

    return NextResponse.json({
      output: stdout || stderr || "Commande exécutée sans sortie.",
      error: stderr ? true : false,
    });
  } catch (error: any) {
    return NextResponse.json({
      output: error.stderr || error.message || "Erreur d'exécution",
      error: true,
    });
  }
}
