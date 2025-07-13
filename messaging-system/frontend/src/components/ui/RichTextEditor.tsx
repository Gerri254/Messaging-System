import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BoldIcon,
  ItalicIcon,
  LinkIcon,
  ListBulletIcon,
  NumberedListIcon,
  CodeBracketIcon,
  FaceSmileIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  enableVariables?: boolean;
  showVariableHelper?: boolean;
  variables?: string[];
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Type your message...',
  maxLength = 1600,
  enableVariables = false,
  showVariableHelper = false,
  variables = [],
  className = '',
}) => {
  const [showVariables, setShowVariables] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Common emojis for quick access
  const commonEmojis = [
    '😊', '😄', '😃', '😀', '😆', '😅', '🤣', '😂',
    '❤️', '💕', '💖', '💗', '💙', '💚', '💛', '🧡',
    '👍', '👏', '🙌', '👋', '✌️', '🤝', '💪', '🎉',
    '🔥', '⭐', '✨', '💫', '🌟', '🎊', '🎈', '🎁',
  ];

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  // Handle text selection for cursor position
  const handleTextSelection = useCallback(() => {
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart || 0);
    }
  }, []);

  // Insert text at cursor position
  const insertTextAtCursor = useCallback((text: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const startPos = textarea.selectionStart || 0;
      const endPos = textarea.selectionEnd || 0;
      const beforeText = value.substring(0, startPos);
      const afterText = value.substring(endPos);
      const newValue = beforeText + text + afterText;
      
      if (newValue.length <= maxLength) {
        onChange(newValue);
        
        // Set cursor position after inserted text
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(startPos + text.length, startPos + text.length);
        }, 0);
      }
    }
  }, [value, onChange, maxLength]);

  // Insert variable
  const insertVariable = (variable: string) => {
    insertTextAtCursor(variable + ' ');
    setShowVariables(false);
  };

  // Insert emoji
  const insertEmoji = (emoji: string) => {
    insertTextAtCursor(emoji);
    setShowEmoji(false);
  };

  // Format text (for future rich text features)
  const formatText = (format: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const selectedText = value.substring(start, end);

    if (selectedText) {
      let formattedText = selectedText;
      
      switch (format) {
        case 'bold':
          formattedText = `*${selectedText}*`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'code':
          formattedText = `\`${selectedText}\``;
          break;
        default:
          return;
      }

      const beforeText = value.substring(0, start);
      const afterText = value.substring(end);
      const newValue = beforeText + formattedText + afterText;
      
      if (newValue.length <= maxLength) {
        onChange(newValue);
        
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(
            start + formattedText.length,
            start + formattedText.length
          );
        }, 0);
      }
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          formatText('bold');
          break;
        case 'i':
          e.preventDefault();
          formatText('italic');
          break;
        case 'k':
          e.preventDefault();
          // Handle link insertion
          break;
      }
    }

    // Insert variable on @ symbol
    if (e.key === '@' && enableVariables) {
      setShowVariables(true);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-1">
          {/* Formatting buttons */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => formatText('bold')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
            title="Bold (Ctrl+B)"
          >
            <BoldIcon className="h-4 w-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => formatText('italic')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
            title="Italic (Ctrl+I)"
          >
            <ItalicIcon className="h-4 w-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => formatText('code')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
            title="Code"
          >
            <CodeBracketIcon className="h-4 w-4" />
          </motion.button>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          {/* Variables button */}
          {enableVariables && variables.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowVariables(!showVariables)}
              className={`
                p-2 rounded-lg transition-colors
                ${showVariables
                  ? 'text-indigo-600 bg-indigo-100'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }
              `}
              title="Insert Variable"
            >
              <TagIcon className="h-4 w-4" />
            </motion.button>
          )}

          {/* Emoji button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowEmoji(!showEmoji)}
            className={`
              p-2 rounded-lg transition-colors
              ${showEmoji
                ? 'text-indigo-600 bg-indigo-100'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }
            `}
            title="Insert Emoji"
          >
            <FaceSmileIcon className="h-4 w-4" />
          </motion.button>
        </div>

        {/* Character count */}
        <div className="text-sm text-gray-500">
          <span className={value.length > maxLength * 0.9 ? 'text-red-600' : ''}>
            {value.length}
          </span>
          /{maxLength}
        </div>
      </div>

      {/* Text area */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onSelect={handleTextSelection}
          onClick={handleTextSelection}
          placeholder={placeholder}
          className="w-full min-h-[120px] max-h-[400px] p-4 border-0 resize-none focus:ring-0 focus:outline-none rounded-b-lg"
          style={{ fontSize: '16px', lineHeight: '1.5' }}
        />

        {/* Variable suggestions */}
        <AnimatePresence>
          {showVariables && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-4 left-4 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-w-xs"
            >
              <div className="p-2">
                <div className="text-xs text-gray-500 mb-2 px-2">
                  Available Variables:
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {variables.map((variable, index) => (
                    <motion.button
                      key={variable}
                      whileHover={{ backgroundColor: '#f3f4f6' }}
                      onClick={() => insertVariable(variable)}
                      className="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    >
                      {variable}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emoji picker */}
        <AnimatePresence>
          {showEmoji && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
            >
              <div className="p-3">
                <div className="text-xs text-gray-500 mb-2">
                  Quick Emojis:
                </div>
                <div className="grid grid-cols-8 gap-1 max-w-xs">
                  {commonEmojis.map((emoji, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => insertEmoji(emoji)}
                      className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Click outside to close dropdowns */}
      {(showVariables || showEmoji) && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => {
            setShowVariables(false);
            setShowEmoji(false);
          }}
        />
      )}

      {/* Helpful hints */}
      {enableVariables && (
        <div className="mt-2 text-xs text-gray-500">
          <p>
            💡 Use variables like {variables.slice(0, 2).join(', ')} to personalize messages.
            {variables.length > 2 && ` +${variables.length - 2} more available.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;