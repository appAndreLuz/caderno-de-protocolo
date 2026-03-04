
import { Psalm } from '../types';
import { getAllPsalms } from '../constants';

const ALL_PSALMS = getAllPsalms();

export const getRandomPsalm = (): Psalm => {
  const randomIndex = Math.floor(Math.random() * ALL_PSALMS.length);
  return ALL_PSALMS[randomIndex];
};

export const persistPsalm = (psalm: Psalm) => {
  localStorage.setItem('last_psalm', JSON.stringify(psalm));
};

export const getPersistedPsalm = (): Psalm | null => {
  const saved = localStorage.getItem('last_psalm');
  return saved ? JSON.parse(saved) : null;
};
