"use client";

import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { EditorState, Transaction } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { monokai } from "@uiw/codemirror-theme-monokai";
import { EditorView } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { memo, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Suggestion, CodeSnippet } from "@/lib/db/schema";
import { ChevronDownIcon } from "./icons";

type EditorTheme = "one-dark" | "dracula" | "monokai";
type EditorLanguage = "python" | "javascript" | "typescript" | "html" | "css" | "bash";

const themes: Record<EditorTheme, any> = {
  "one-dark": oneDark,
  "dracula": dracula,
  "monokai": monokai,
};

const languages: Record<EditorLanguage, any> = {
  python: python(),
  javascript: javascript(),
  typescript: javascript({ typescript: true }),
  html: html(),
  css: css(),
  bash: null,
};

type EditorProps = {
  content: string;
  onSaveContent: (updatedContent: string, debounce: boolean) => void;
  status: "streaming" | "idle";
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  suggestions: Suggestion[];
  snippets?: CodeSnippet[];
  onRun?: () => void;
  onSaveSnippet?: (title: string) => void;
};

function PureCodeEditor({ content, onSaveContent, status, onRun, onSaveSnippet, snippets = [] }: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorView | null>(null);
  const userScrolledRef = useRef(false);
  const [theme, setTheme] = useState<EditorTheme>("one-dark");
  const [language, setLanguage] = useState<EditorLanguage>("python");
  const [showSnippetModal, setShowSnippetModal] = useState(false);
  const [snippetTitle, setSnippetTitle] = useState("");

  const getExtensions = () => {
    const exts = [basicSetup];
    if (languages[language]) {
      exts.push(languages[language]);
    }
    exts.push(themes[theme]);
    return exts;
  };

  useEffect(() => {
    if (containerRef.current && !editorRef.current) {
      const startState = EditorState.create({
        doc: content,
        extensions: getExtensions(),
      });

      editorRef.current = new EditorView({
        state: startState,
        parent: containerRef.current,
      });
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      const currentSelection = editorRef.current.state.selection;
      const newState = EditorState.create({
        doc: editorRef.current.state.doc,
        extensions: [
          ...getExtensions(),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const transaction = update.transactions.find(
                (tr) => !tr.annotation(Transaction.remote)
              );

              if (transaction) {
                const newContent = update.state.doc.toString();
                onSaveContent(newContent, true);
              }
            }
          }),
          EditorView.domEventHandlers({
            scroll() {
              if (status !== "streaming") {
                return;
              }
              const dom = editorRef.current?.scrollDOM;
              if (!dom) {
                return;
              }
              const atBottom =
                dom.scrollHeight - dom.scrollTop - dom.clientHeight < 40;
              userScrolledRef.current = !atBottom;
            },
          }),
        ],
        selection: currentSelection,
      });

      editorRef.current.setState(newState);
    }
  }, [theme, language, onSaveContent, status]);

  useEffect(() => {
    if (status !== "streaming") {
      userScrolledRef.current = false;
    }
  }, [status]);

  useEffect(() => {
    if (editorRef.current && content) {
      const currentContent = editorRef.current.state.doc.toString();

      if (status === "streaming" || currentContent !== content) {
        const transaction = editorRef.current.state.update({
          changes: {
            from: 0,
            to: currentContent.length,
            insert: content,
          },
          annotations: [Transaction.remote.of(true)],
        });

        editorRef.current.dispatch(transaction);

        if (status === "streaming" && !userScrolledRef.current) {
          requestAnimationFrame(() => {
            const dom = editorRef.current?.scrollDOM;
            if (dom) {
              dom.scrollTo({ top: dom.scrollHeight });
            }
          });
        }
      }
    }
  }, [content, status]);

  return (
    <div className="not-prose relative w-full min-h-[400px] flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-background/80 backdrop-blur">
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                {language} <ChevronDownIcon size={12} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {Object.keys(languages).map((lang) => (
                <DropdownMenuItem 
                  key={lang} 
                  onClick={() => setLanguage(lang as EditorLanguage)}
                  className="text-xs"
                >
                  {lang}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                {theme} <ChevronDownIcon size={12} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {Object.keys(themes).map((t) => (
                <DropdownMenuItem 
                  key={t} 
                  onClick={() => setTheme(t as EditorTheme)}
                  className="text-xs"
                >
                  {t}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          {/* Snippets Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                Snippets <ChevronDownIcon size={12} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {snippets.length === 0 ? (
                <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                  Aucun snippet sauvegardé
                </DropdownMenuItem>
              ) : (
                snippets.map((snippet) => (
                  <DropdownMenuItem 
                    key={snippet.id} 
                    onClick={() => {
                      if (editorRef.current) {
                        const transaction = editorRef.current.state.update({
                          changes: {
                            from: 0,
                            to: editorRef.current.state.doc.length,
                            insert: snippet.code,
                          },
                        });
                        editorRef.current.dispatch(transaction);
                        setLanguage(snippet.language as EditorLanguage);
                      }
                    }}
                    className="text-xs flex flex-col items-start"
                  >
                    <span className="font-medium">{snippet.title}</span>
                    <span className="text-muted-foreground">{snippet.language}</span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-xs"
            onClick={() => onSaveSnippet && onSaveSnippet(snippetTitle)}
          >
            Sauvegarder
          </Button>

          <Button 
            variant="default" 
            size="sm" 
            className="h-7 text-xs"
            onClick={onRun}
          >
            ▶ Exécuter
          </Button>
        </div>
      </div>

      <div
        className="flex-1 min-h-[300px] pb-[calc(50dvh)]"
        ref={containerRef}
      />
    </div>
  );
}

export const CodeEditor = memo(PureCodeEditor, (prevProps, nextProps) => {
  // Lors du streaming, on ne re-rend que si le contenu change réellement
  if (prevProps.status === "streaming" && nextProps.status === "streaming") {
    return prevProps.content === nextProps.content;
  }

  if (prevProps.content !== nextProps.content) return false;
  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.currentVersionIndex !== nextProps.currentVersionIndex) return false;
  if (prevProps.isCurrentVersion !== nextProps.isCurrentVersion) return false;
  if (prevProps.suggestions !== nextProps.suggestions) return false;
  if (prevProps.snippets !== nextProps.snippets) return false;
  
  return true;
});
