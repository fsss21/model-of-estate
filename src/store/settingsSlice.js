import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'estate-settings';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      return {
        language: s.language === 'en' ? 'en' : 'ru',
        brightness: Math.min(100, Math.max(0, Number(s.brightness) ?? 100)),
        volume: Math.min(100, Math.max(0, Number(s.volume) ?? 100)),
      };
    }
  } catch (_) {}
  return { language: 'ru', brightness: 100, volume: 100 };
}

function saveToStorage(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (_) {}
}

const initialState = loadFromStorage();

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      const lang = action.payload === 'en' ? 'en' : 'ru';
      state.language = lang;
      saveToStorage(state);
    },
    setBrightness: (state, action) => {
      state.brightness = Math.min(100, Math.max(0, Number(action.payload) ?? 100));
      saveToStorage(state);
    },
    setVolume: (state, action) => {
      state.volume = Math.min(100, Math.max(0, Number(action.payload) ?? 100));
      saveToStorage(state);
    },
    updateSettings: (state, action) => {
      const { language, brightness, volume } = action.payload;
      if (language !== undefined) state.language = language === 'en' ? 'en' : 'ru';
      if (brightness !== undefined) state.brightness = Math.min(100, Math.max(0, Number(brightness) ?? 100));
      if (volume !== undefined) state.volume = Math.min(100, Math.max(0, Number(volume) ?? 100));
      saveToStorage(state);
    },
  },
});

export const { setLanguage, setBrightness, setVolume, updateSettings } = settingsSlice.actions;
export const selectLanguage = (state) => state.settings.language;
export const selectBrightness = (state) => state.settings.brightness;
export const selectVolume = (state) => state.settings.volume;
export const selectSettings = (state) => state.settings;

export default settingsSlice.reducer;
