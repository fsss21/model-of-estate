import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslations } from '../../contexts/LanguageContext';

import mainMenuImg from '../../assets/main_menu_img.png';
import mainMenuImg4k from '../../assets/main_menu_img-4k.png';
import styles from './MainMenu.module.css';
import ModalSettings from './ModalSettings/modalSettings';
import ModalAutoShow from './ModalAutoShow/modalAutoShow';
import { selectSettings } from '../../store/settingsSlice';

import SettingsIcon from '@mui/icons-material/Settings';

// 1080p — до 1920px по ширине, 4K — выше
const WIDTH_4K = 1920;

function getBackgroundForWidth(width) {
  return width > WIDTH_4K ? mainMenuImg4k : mainMenuImg;
}

export default function MainMenu() {
  const [data, setData] = useState(null);
  const [bgImage, setBgImage] = useState(() => getBackgroundForWidth(typeof window !== 'undefined' ? window.innerWidth : 1920));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [autoShowOpen, setAutoShowOpen] = useState(false);
  const settings = useSelector(selectSettings);
  const { t } = useTranslations();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/data/menu.json')
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  useEffect(() => {
    const updateBg = () => setBgImage(getBackgroundForWidth(window.innerWidth));
    updateBg();
    window.addEventListener('resize', updateBg);
    return () => window.removeEventListener('resize', updateBg);
  }, []);

  if (!data) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.loading}>{t.loading || 'Загрузка...'}</div>
      </div>
    );
  }

  const openSettings = () => setSettingsOpen(true);
  const closeSettings = () => setSettingsOpen(false);

  const openAutoShow = () => setAutoShowOpen(true);

  const chooseEra = () => {
    navigate('/catalog-era')
  }

  return (
    <div
      className={styles.wrapper}
      style={{
        backgroundImage: `url(${bgImage})`,
        filter: settings.brightness < 100 ? `brightness(${0.3 + (settings.brightness / 100) * 0.7})` : undefined,
      }}
    >
      <ModalSettings isOpen={settingsOpen} onClose={closeSettings} />
      <ModalAutoShow isOpen={autoShowOpen} onClose={() => setAutoShowOpen(false)} />

      <main className={styles.main}>
        <div className={styles.wrapperBtn}>
          <button
            onClick={openAutoShow}
            type="button"
            className={styles.primaryBtn}
            dangerouslySetInnerHTML={{ __html: t.automaticDisplay || data.buttons[0].label }}
          />
        </div>
        <div onClick={chooseEra} className={styles.wrapperBtn}>
          <button
            type="button"
            className={styles.primaryBtn}
            dangerouslySetInnerHTML={{ __html: t.chooseEra || data.buttons[1].label }}
          />
        </div>
      </main>
      <button
        onClick={openSettings}
        type="button"
        className={styles.settingsBtn}
        title={t.settings?.title || 'Настройки'}
        aria-label={t.settings?.title || 'Настройки'}
      >
        <SettingsIcon sx={{ opacity: '0.6' }} />
      </button>
    </div>
  );
}
