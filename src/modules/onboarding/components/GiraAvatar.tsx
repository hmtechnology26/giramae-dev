import React from 'react';
import { GIRA_ASSETS } from '../constants/gira-assets';
import type { GiraEmotion } from '../types';
import '../styles/gira-avatar.css';

interface GiraAvatarProps {
  emotion: GiraEmotion;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = { sm: 48, md: 80, lg: 120 };

export const GiraAvatar = ({ emotion, size = 'md' }: GiraAvatarProps) => {
  const asset = GIRA_ASSETS[emotion];
  const pixels = SIZES[size];
  
  return (
    <div className="gira-avatar" style={{ width: pixels, height: pixels }}>
      <img 
        src={asset.path} 
        alt={asset.description}
        width={pixels}
        height={pixels}
        loading="eager" // GIFs do tour precisam carregar rápido
      />
    </div>
  );
};