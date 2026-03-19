
import React from 'react';

// Utilitários para processar menções em mensagens

export interface ParsedMention {
  username: string;
  startIndex: number;
  endIndex: number;
}

// Regex para detectar menções no formato @username
export const MENTION_REGEX = /@(\w+)/g;

// Extrair todas as menções de um texto
export const extractMentions = (text: string): ParsedMention[] => {
  const mentions: ParsedMention[] = [];
  let match;
  
  // Reset regex
  MENTION_REGEX.lastIndex = 0;
  
  while ((match = MENTION_REGEX.exec(text)) !== null) {
    mentions.push({
      username: match[1],
      startIndex: match.index,
      endIndex: match.index + match[0].length
    });
  }
  
  return mentions;
};

// Renderizar texto com menções como JSX
export const renderTextWithMentions = (text: string): (string | JSX.Element)[] => {
  const mentions = extractMentions(text);
  
  if (mentions.length === 0) {
    return [text];
  }
  
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  
  mentions.forEach((mention, index) => {
    // Adicionar texto antes da menção
    if (mention.startIndex > lastIndex) {
      parts.push(text.slice(lastIndex, mention.startIndex));
    }
    
    // Adicionar a menção como link
    parts.push(
      React.createElement(
        'span',
        {
          key: `mention-${index}`,
          className: "text-blue-600 font-medium bg-blue-50 px-1 rounded cursor-pointer hover:bg-blue-100",
          onClick: () => {
            // TODO: Implementar navegação para perfil
            console.log('Navegar para perfil:', mention.username);
          }
        },
        `@${mention.username}`
      )
    );
    
    lastIndex = mention.endIndex;
  });
  
  // Adicionar texto restante
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  return parts;
};

// Validar formato de username
export const isValidUsername = (username: string): boolean => {
  return /^[a-z0-9_]{3,20}$/.test(username);
};

// Buscar usernames únicos em um texto
export const getUniqueUsernames = (text: string): string[] => {
  const mentions = extractMentions(text);
  return Array.from(new Set(mentions.map(m => m.username)));
};
