import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSettings, selectSettings } from '../../../store/settingsSlice';
import { useTranslations } from '../../../contexts/LanguageContext';
import CloseIcon from '@mui/icons-material/Close';
import styles from './modalSettings.module.css';

import backSettingsImg from '../../../assets/back_settings_img.png';
import backSettingsImg4k from '../../../assets/back_settings_img-4k.png';

import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import SunnyIcon from '@mui/icons-material/Sunny';
import Slider from '@mui/material/Slider';

const WIDTH_4K = 1920;

function getModalBgForWidth(width) {
    return width > WIDTH_4K ? backSettingsImg4k : backSettingsImg;
}

const SETTINGS_FALLBACK = {
    title: 'Настройки',
    language: 'Язык',
    langRu: 'Русский',
    langEn: 'English',
    brightness: 'Яркость',
    volume: 'Звук',
};

export default function ModalSettings({ isOpen, onClose }) {
    const dispatch = useDispatch();
    const settings = useSelector(selectSettings);
    const { t } = useTranslations();
    const [modalBg, setModalBg] = useState(() =>
        typeof window !== 'undefined' ? getModalBgForWidth(window.innerWidth) : backSettingsImg
    );

    useEffect(() => {
        const updateBg = () => setModalBg(getModalBgForWidth(window.innerWidth));
        window.addEventListener('resize', updateBg);
        return () => window.removeEventListener('resize', updateBg);
    }, []);

    if (!isOpen) return null;

    const updateSetting = (key, value) => {
        dispatch(updateSettings({ [key]: value }));
    };

    const tSettings = t?.settings ?? SETTINGS_FALLBACK;

    return (
        <div className={styles.backdrop}>
            <div className={styles.modalBack}
                onClick={onClose}
                aria-hidden="false">
                <div
                    className={styles.modal}
                    style={{ backgroundImage: `url(${modalBg})` }}
                    onClick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="settings-title"
                >
                    <h2 id="settings-title" className={styles.title}>
                        {tSettings.title}
                    </h2>


                    <div className={styles.sliders}>
                        <div className={styles.row}>
                            <SunnyIcon sx={{ color: "#5A503B" }} />
                            <Slider
                                id="brightness-slider"
                                min={0}
                                max={100}
                                value={settings.brightness}
                                onChange={(_, value) => updateSetting('brightness', value)}
                                className={styles.slider}
                                slotProps={{
                                    rail: { className: styles.sliderRail },
                                    track: { className: styles.sliderTrack },
                                    thumb: { className: styles.sliderThumb },
                                }}
                            />
                        </div>

                        <div className={styles.row}>
                            <VolumeUpIcon sx={{ color: "#5A503B" }} />
                            <Slider
                                id="volume-slider"
                                min={0}
                                max={100}
                                value={settings.volume}
                                onChange={(_, value) => updateSetting('volume', value)}
                                className={styles.slider}
                                slotProps={{
                                    rail: { className: styles.sliderRail },
                                    track: { className: styles.sliderTrack },
                                    thumb: { className: styles.sliderThumb },
                                }}
                            />
                        </div>
                    </div>

                    <div className={styles.rowBtns}>
                        <div className={styles.langSwitch}>
                            <button
                                type="button"
                                className={settings.language === 'ru' ? styles.langBtnActive : styles.langBtn}
                                onClick={() => updateSetting('language', 'ru')}
                            >
                                {tSettings.langRu}
                            </button>
                            <button
                                type="button"
                                className={settings.language === 'en' ? styles.langBtnActive : styles.langBtn}
                                onClick={() => updateSetting('language', 'en')}
                            >
                                {tSettings.langEn}
                            </button>
                        </div>
                    </div>
                    <button type="button" className={styles.closeBtn} onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
            </div>
        </div>

    );
}
