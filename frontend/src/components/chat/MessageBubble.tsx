import { format } from 'date-fns';
import { Message } from '../../types';
import { getFileDownloadUrl } from '../../api/files';
import Avatar from '../common/Avatar';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const time = format(new Date(message.created_at), 'HH:mm');
  const sender = message.sender;

  const isImage =
    message.message_type === 'image' ||
    message.file_attachment?.mime_type?.startsWith('image/');

  return (
    <div className={`flex gap-2 mb-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {!isOwn && sender && (
        <Avatar
          name={sender.display_name}
          color={sender.avatar_color}
          size="sm"
        />
      )}

      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Sender name */}
        {!isOwn && sender && (
          <p className="text-xs font-medium text-gray-500 mb-1 ml-1">
            {sender.display_name}
          </p>
        )}

        <div
          className={`rounded-2xl px-4 py-2 ${
            isOwn
              ? 'bg-blue-500 text-white rounded-tr-sm'
              : 'bg-white text-gray-800 rounded-tl-sm shadow-sm'
          }`}
        >
          {/* Text content */}
          {message.content && (
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}

          {/* File attachment */}
          {message.file_attachment && (
            <div className="mt-1">
              {isImage ? (
                <a
                  href={getFileDownloadUrl(message.file_attachment.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={getFileDownloadUrl(message.file_attachment.id)}
                    alt={message.file_attachment.original_filename}
                    className="max-w-full rounded-lg max-h-60 object-cover"
                    loading="lazy"
                  />
                </a>
              ) : (
                <a
                  href={getFileDownloadUrl(message.file_attachment.id)}
                  download
                  className={`flex items-center gap-2 p-2 rounded-lg transition ${
                    isOwn
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <svg
                    className={`w-8 h-8 flex-shrink-0 ${
                      isOwn ? 'text-blue-200' : 'text-blue-500'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        isOwn ? 'text-white' : 'text-gray-800'
                      }`}
                    >
                      {message.file_attachment.original_filename}
                    </p>
                    <p
                      className={`text-xs ${
                        isOwn ? 'text-blue-200' : 'text-gray-400'
                      }`}
                    >
                      {formatFileSize(message.file_attachment.file_size)}
                    </p>
                  </div>
                </a>
              )}
            </div>
          )}

          {/* Timestamp */}
          <p
            className={`text-[10px] mt-1 ${
              isOwn ? 'text-blue-200' : 'text-gray-400'
            }`}
          >
            {time}
          </p>
        </div>
      </div>
    </div>
  );
}
