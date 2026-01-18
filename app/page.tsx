'use client'

import { useState, useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { Message, FileItem } from './types'

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Welcome to Claude Code! I\'m your AI coding assistant. I can help you write code, debug issues, explain concepts, and more. What would you like to build today?'
    }
  ])
  const [input, setInput] = useState('')
  const [files, setFiles] = useState<FileItem[]>([
    {
      name: 'example.ts',
      language: 'typescript',
      content: `// Welcome to Claude Code!
// Start typing or ask me to help you write code

function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`
    }
  ])
  const [activeFileIndex, setActiveFileIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<any>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor
  }

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      const newFiles = [...files]
      newFiles[activeFileIndex].content = value
      setFiles(newFiles)
    }
  }

  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return 'Hello! How can I help you with your code today?'
    }

    if (lowerMessage.includes('create') && (lowerMessage.includes('file') || lowerMessage.includes('component'))) {
      const fileName = lowerMessage.includes('react') ? 'Component.tsx' :
                       lowerMessage.includes('python') ? 'script.py' :
                       lowerMessage.includes('java') ? 'Main.java' : 'newfile.js'

      const content = fileName.endsWith('.tsx') ?
        `import React from 'react'\n\nexport default function Component() {\n  return (\n    <div>\n      <h1>Hello World</h1>\n    </div>\n  )\n}` :
        fileName.endsWith('.py') ?
        `def main():\n    print("Hello World")\n\nif __name__ == "__main__":\n    main()` :
        `function main() {\n  console.log("Hello World");\n}\n\nmain();`

      setFiles([...files, {
        name: fileName,
        language: fileName.endsWith('.tsx') ? 'typescript' :
                 fileName.endsWith('.py') ? 'python' :
                 fileName.endsWith('.java') ? 'java' : 'javascript',
        content: content
      }])
      setActiveFileIndex(files.length)

      return `I've created a new file called ${fileName} with a basic template. You can see it in the editor!`
    }

    if (lowerMessage.includes('bug') || lowerMessage.includes('error') || lowerMessage.includes('fix')) {
      return `I can help you debug! Here are some steps:
1. Check the console for error messages
2. Verify variable types and function signatures
3. Make sure all dependencies are imported
4. Test edge cases

What specific issue are you encountering?`
    }

    if (lowerMessage.includes('explain')) {
      const currentCode = files[activeFileIndex].content
      if (currentCode.includes('fibonacci')) {
        return `This code implements the Fibonacci sequence using recursion. The fibonacci function:
- Returns n if n is 0 or 1 (base case)
- Otherwise, recursively calls itself with n-1 and n-2 and returns their sum
- The result grows exponentially: 0, 1, 1, 2, 3, 5, 8, 13...`
      }
      return 'I can explain any code you have in the editor. What would you like me to clarify?'
    }

    if (lowerMessage.includes('optimize') || lowerMessage.includes('improve')) {
      return `Here are some optimization suggestions:
- Use memoization for recursive functions
- Avoid nested loops where possible
- Use const/let instead of var
- Implement proper error handling
- Add type annotations for better type safety

Would you like me to help with a specific optimization?`
    }

    if (lowerMessage.includes('react') || lowerMessage.includes('component')) {
      return `I can help you build React components! I can create:
- Functional components with hooks
- TypeScript interfaces
- State management with useState
- Side effects with useEffect
- Custom hooks

What would you like to build?`
    }

    if (lowerMessage.includes('api') || lowerMessage.includes('fetch')) {
      return `For API calls, I recommend:
- Use fetch() or axios for HTTP requests
- Handle loading states
- Implement error handling with try/catch
- Use async/await for cleaner code
- Consider using React Query or SWR for data fetching

Need help implementing an API call?`
    }

    return `I'm here to help! I can:
- Write and explain code
- Debug issues
- Create new files and components
- Optimize code performance
- Answer programming questions
- Suggest best practices

What would you like to work on?`
  }

  const handleSendMessage = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      role: 'user',
      content: input
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    setTimeout(() => {
      const assistantMessage: Message = {
        role: 'assistant',
        content: generateResponse(input)
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const createNewFile = () => {
    const newFile: FileItem = {
      name: `untitled-${files.length + 1}.js`,
      language: 'javascript',
      content: '// New file\n'
    }
    setFiles([...files, newFile])
    setActiveFileIndex(files.length)
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-orange-500">Claude Code</h1>
          <p className="text-xs text-gray-400 mt-1">AI Code Editor</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <div className="flex items-center justify-between mb-2 px-2">
              <span className="text-xs font-semibold text-gray-400 uppercase">Files</span>
              <button
                onClick={createNewFile}
                className="text-orange-500 hover:text-orange-400 text-lg"
                title="New File"
              >
                +
              </button>
            </div>
            {files.map((file, index) => (
              <div
                key={index}
                onClick={() => setActiveFileIndex(index)}
                className={`px-3 py-2 rounded cursor-pointer mb-1 ${
                  activeFileIndex === index
                    ? 'bg-orange-600 text-white'
                    : 'hover:bg-gray-700 text-gray-300'
                }`}
              >
                <span className="text-sm">{file.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-700 text-xs text-gray-500">
          <div className="mb-1">⌘ + S to save</div>
          <div className="mb-1">⌘ + P to open file</div>
          <div>⌘ + / to comment</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Editor */}
        <div className="flex-1 border-b border-gray-700">
          <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
            <span className="text-sm text-gray-300">{files[activeFileIndex]?.name}</span>
          </div>
          <Editor
            height="100%"
            language={files[activeFileIndex]?.language}
            value={files[activeFileIndex]?.content}
            theme="vs-dark"
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: true,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>

        {/* Chat Interface */}
        <div className="h-80 flex flex-col bg-gray-850">
          <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
            <span className="text-sm font-semibold text-gray-300">AI Assistant</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat-message flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-gray-100 rounded-lg px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="border-t border-gray-700 p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about code..."
                className="flex-1 bg-gray-700 text-gray-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
