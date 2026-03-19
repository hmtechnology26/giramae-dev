import React, { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useUserSearch } from '@/hooks/useUserSearch';
import { buildAvatarUrl } from '@/lib/cdn';
import { cn } from '@/lib/utils';

type UserSearchMode = 'absolute' | 'flow';

interface UserSearchProps {
  className?: string;
  inputClassName?: string;
  mode?: UserSearchMode;
  placeholder?: string;
  onSelectUser: (userId: string) => void;
  onEscape?: () => void;
}

const UserSearch: React.FC<UserSearchProps> = ({
  className,
  inputClassName,
  mode = 'absolute',
  placeholder = 'Buscar mães...',
  onSelectUser,
  onEscape,
}) => {
  const { users, isSearching, searchUsers } = useUserSearch();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const showResults = open && query.trim().length >= 2;

  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    const timer = setTimeout(() => {
      searchUsers(trimmed);
    }, 250);
    return () => clearTimeout(timer);
  }, [open, query, searchUsers]);

  const handleClear = () => {
    setQuery('');
    searchUsers('');
    inputRef.current?.focus();
  };

  const handleSelect = (userId: string) => {
    setOpen(false);
    setQuery('');
    onSelectUser(userId);
  };

  const resultsPanel = showResults ? (
    <div
      className={cn(
        mode === 'absolute'
          ? 'absolute left-0 right-0 top-full mt-2 z-50'
          : 'mt-2'
      )}
    >
      <div className="premium-card rounded-[1.5rem] border border-white/60 bg-white/80 backdrop-blur-2xl shadow-xl overflow-hidden">
        <div className="max-h-72 overflow-y-auto">
          {isSearching && users.length === 0 ? (
            <div className="px-4 py-3 text-xs font-bold text-foreground/50 uppercase tracking-widest">
              Buscando...
            </div>
          ) : users.length === 0 ? (
            <div className="px-4 py-3 text-xs font-bold text-foreground/50 uppercase tracking-widest">
              Nenhuma mãe encontrada
            </div>
          ) : (
            <div className="p-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(u.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-primary/5 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-2xl bg-white/70 border border-white/60 overflow-hidden flex items-center justify-center shrink-0">
                    {u.avatar_url ? (
                      <img src={buildAvatarUrl(u.avatar_url)} alt={u.nome} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-black text-foreground/40">
                        {(u.nome || '?').slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-foreground tracking-tight truncate">{u.nome}</p>
                    {u.username && (
                      <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest truncate">
                        @{u.username}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setOpen(false);
              setQuery('');
              onEscape?.();
            }
          }}
          placeholder={placeholder}
          className={cn(
            'w-full h-10 rounded-full bg-white/60 border border-white/70 backdrop-blur-xl pl-9 pr-9 text-[12px] font-bold text-foreground/70 placeholder:text-foreground/30 outline-none focus:ring-2 focus:ring-primary/20',
            inputClassName
          )}
        />
        {query.length > 0 && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onPointerDown={(e) => e.preventDefault()}
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full hover:bg-primary/5 flex items-center justify-center transition-colors"
            aria-label="Limpar busca"
          >
            <X className="h-4 w-4 text-foreground/30" />
          </button>
        )}
      </div>

      {resultsPanel}
    </div>
  );
};

export default UserSearch;

