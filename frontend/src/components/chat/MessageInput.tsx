import { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useChatStore } from '../../stores/chatStore';
import { uploadFile } from '../../api/files';

interface MessageInputProps {
  onSend: (data: Record<string, unknown>) => void;
}

export default function MessageInput({ onSend }: MessageInputProps) {
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const activeGroupId = useChatStore((s) => s.activeGroupId);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  const handleSendText = () => {
    if (!text.trim() || !activeGroupId) return;

    onSend({
      type: 'chat_message',
      group_id: activeGroupId,
      content: text.trim(),
      message_type: 'text',
    });
    setText('');
    inputRef.current?.focus();
  };

  const handleFileUpload = useCallback(
    async (files: File[]) => {
      if (!activeGroupId || files.length === 0) return;
      setUploading(true);

      try {
        for (const file of files) {
          const attachment = await uploadFile(file);
          const isImage = file.type.startsWith('image/');
          onSend({
            type: 'chat_message',
            group_id: activeGroupId,
            content: null,
            message_type: isImage ? 'image' : 'file',
            file_attachment_id: attachment.id,
          });
        }
      } catch (err) {
        console.error('File upload failed:', err);
      } finally {
        setUploading(false);
      }
    },
    [activeGroupId, onSend]
  );

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop: handleFileUpload,
    noClick: true,
    noKeyboard: true,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }

    // Typing indicator
    if (activeGroupId) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      onSend({
        type: 'typing',
        group_id: activeGroupId,
        is_typing: true,
      });
      typingTimeoutRef.current = window.setTimeout(() => {
        onSend({
          type: 'typing',
          group_id: activeGroupId,
          is_typing: false,
        });
      }, 2000);
    }
  };

  if (!activeGroupId) return null;

  return (
    <div {...getRootProps()} className="relative">
      {/* Drop overlay */}
      {dragActive && (
        <div className="absolute inset-0 bg-blue-50 border-2 border-dashed border-blue-400 rounded-xl flex items-center justify-center z-10">
          <p className="text-blue-500 font-medium">Faylni shu yerga tashlang</p>
        </div>
      )}

      <div className="p-4 border-t border-gray-200 bg-white">
        {uploading && (
          <div className="mb-2 text-sm text-blue-500 flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Fayl yuklanmoqda...
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* File attach button */}
          <button
            onClick={open}
            disabled={uploading}
            className="p-2 text-gray-400 hover:text-blue-500 transition flex-shrink-0"
            title="Fayl biriktirish"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>

          <input {...getInputProps()} />

          {/* Text input */}
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Xabar yozing..."
            rows={1}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm max-h-32"
            style={{ minHeight: '42px' }}
          />

          {/* Send button */}
          <button
            onClick={handleSendText}
            disabled={!text.trim()}
            className="p-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
