import { createContext, useContext } from 'react';

export type ActiveTab = 'home' | 'settings';

export const ActiveTabContext = createContext<{
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}>({
  activeTab: 'home',
  setActiveTab: () => {},
});

export const useActiveTab = () => useContext(ActiveTabContext);
