"use client"
import { useRef, useCallback } from 'react'
import Editor, { type Monaco } from "@monaco-editor/react"
import type { editor } from "monaco-editor"
import { TemplateFile } from "../lib/path-to-json"
import { configureMonaco, defaultEditorOptions, getEditorLanguage } from "../lib/editor-config"

interface PlaygroundEditorProps {
    activeFile: TemplateFile | undefined
    content: string
    onContentChange: (newContent: string) => void
}

const PlaygroundEditor = ({ activeFile, content, onContentChange }: PlaygroundEditorProps) => {
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
    const monacoRef = useRef<Monaco | null>(null)

    const updateEditorLanguage = useCallback(() => {
        if (!activeFile || !monacoRef.current || !editorRef.current) return
        const model = editorRef.current.getModel()
        if (!model) return
        const language = getEditorLanguage(activeFile.fileExtension || "")
        try {
            monacoRef.current.editor.setModelLanguage(model, language)
        } catch (e) {
            console.warn("Failed to set Editor language:", e)
        }
    }, [activeFile])

    const handleEditorDidMount = useCallback((editorInstance: editor.IStandaloneCodeEditor, monaco: Monaco) => {
        editorRef.current = editorInstance
        monacoRef.current = monaco
        console.log("Editor instance mounted:", !!editorRef.current)
        editorInstance.updateOptions({ ...defaultEditorOptions })
        configureMonaco(monaco)
        updateEditorLanguage()
    }, [updateEditorLanguage])

    return (
        <div className="h-full relative">
            <Editor
                height={"100%"}
                width="100%"
                value={content}
                onChange={(value) => onContentChange(value || "")}
                onMount={handleEditorDidMount}
                language={activeFile ? getEditorLanguage(activeFile.fileExtension || "") : "plaintext"}
                options={defaultEditorOptions}
            />
        </div>
    )
}

export default PlaygroundEditor