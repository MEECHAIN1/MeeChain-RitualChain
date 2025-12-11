
import React from 'react';
import { generateMeeBotTraits } from '../services/geminiService';
import { translations } from '../utils/translations';

export const GenesisRitual: React.FC<{ lang: 'en' | 'th' }> = ({ lang }) => {
  const traits = generateMeeBotTraits();
  const t = translations[lang];
  return (
    <div>
      <h2>{t.genesis.title}</h2>
      <pre>{JSON.stringify(traits, null, 2)}</pre>
    </div>
  );
};
