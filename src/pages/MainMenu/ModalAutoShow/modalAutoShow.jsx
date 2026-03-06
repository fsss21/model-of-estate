import { useState, useRef, useEffect } from 'react';
import Slider from '@mui/material/Slider';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslations } from '../../../contexts/LanguageContext';
import styles from './modalAutoShow.module.css';
import vpStyles from '../../CatalogEra/ModalVideoPlayer/modalVideoPlayer.module.css';

import backMainImg from '../../../assets/back_modal_video_main_img.png';
import backMainImg4k from '../../../assets/back_modal_video_main_img-4k.png';

const WIDTH_4K = 1920;

const SEGMENT_LABEL_KEYS = ['constructionCap', 'flourishingCap', 'transformation1Cap', 'transformation2Cap', 'restorationCap'];
const SEGMENT_DURATIONS = [180, 120, 90, 90, 120];
const TOTAL_DURATION = SEGMENT_DURATIONS.reduce((a, d) => a + d, 0);

function getModalBgForWidth(width) {
  return width > WIDTH_4K ? backMainImg4k : backMainImg;
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getMarks() {
  let acc = 0;
  return SEGMENT_DURATIONS.map((duration, i) => {
    acc += duration;
    const value = Math.round((acc / TOTAL_DURATION) * 100);
    return { value };
  });
}

const MARKS = getMarks();

function getCurrentBlockIndex(time) {
  let acc = 0;
  for (let i = 0; i < SEGMENT_DURATIONS.length; i++) {
    if (time < acc + SEGMENT_DURATIONS[i]) return i;
    acc += SEGMENT_DURATIONS[i];
  }
  return SEGMENT_DURATIONS.length - 1;
}

export default function ModalAutoShow({ isOpen, onClose }) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showPlayOverlay, setShowPlayOverlay] = useState(true);
  const [modalBg, setModalBg] = useState(() =>
    typeof window !== 'undefined' ? getModalBgForWidth(window.innerWidth) : backMainImg
  );
  const hideOverlayTimeoutRef = useRef(null);
  const playbackIntervalRef = useRef(null);
  const { t } = useTranslations();

  const HIDE_PLAY_OVERLAY_MS = 3000;

  const progress = TOTAL_DURATION > 0 ? (currentTime / TOTAL_DURATION) * 100 : 0;
  const currentBlockIndex = getCurrentBlockIndex(currentTime);
  const segmentLabel = t[SEGMENT_LABEL_KEYS[currentBlockIndex]];
  const currentBlockLabel = segmentLabel
    ? `${t.blockNum ?? 'Блок'} ${currentBlockIndex + 1}: ${segmentLabel}`
    : '';

  const scheduleHidePlayOverlay = () => {
    if (hideOverlayTimeoutRef.current) clearTimeout(hideOverlayTimeoutRef.current);
    hideOverlayTimeoutRef.current = setTimeout(() => {
      setShowPlayOverlay(false);
      hideOverlayTimeoutRef.current = null;
    }, HIDE_PLAY_OVERLAY_MS);
  };

  const handleVideoAreaClick = () => {
    setShowPlayOverlay(true);
    scheduleHidePlayOverlay();
  };

  const handlePlayBtnClick = (e) => {
    e.stopPropagation();
    setPlaying((p) => !p);
    setShowPlayOverlay(true);
    scheduleHidePlayOverlay();
  };

  useEffect(() => {
    const updateBg = () => setModalBg(getModalBgForWidth(window.innerWidth));
    window.addEventListener('resize', updateBg);
    return () => window.removeEventListener('resize', updateBg);
  }, []);

  useEffect(() => {
    if (!playing) {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
        playbackIntervalRef.current = null;
      }
      return;
    }
    playbackIntervalRef.current = setInterval(() => {
      setCurrentTime((t) => {
        if (t >= TOTAL_DURATION) {
          if (playbackIntervalRef.current) {
            clearInterval(playbackIntervalRef.current);
            playbackIntervalRef.current = null;
          }
          setPlaying(false);
          return TOTAL_DURATION;
        }
        return t + 0.1;
      });
    }, 100);
    return () => {
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
    };
  }, [playing]);

  useEffect(() => {
    return () => {
      if (hideOverlayTimeoutRef.current) clearTimeout(hideOverlayTimeoutRef.current);
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
    };
  }, []);

  const handleProgressChange = (_, value) => {
    const time = ((Number(value) || 0) / 100) * TOTAL_DURATION;
    setCurrentTime(time);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose} aria-hidden="false">
      <div className={styles.modalBack} onClick={(e) => e.stopPropagation()}>
        <div
          className={styles.modal}
          style={{ backgroundImage: `url(${modalBg})` }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="auto-show-title"
        >
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={t.closeLabel || 'Закрыть'}
          >
            <CloseIcon />
          </button>


          <p className={styles.startLabel}>{t.startShow ?? 'начать показ'}</p>

          <div className={styles.videoWrap} onClick={handleVideoAreaClick}>
            <div className={styles.videoPlaceholder} />
            {showPlayOverlay && (
              <div
                className={styles.playOverlay}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className={vpStyles.playBtn}
                  onClick={handlePlayBtnClick}
                  aria-label={playing ? (t.pause || 'Пауза') : (t.play || 'Воспроизведение')}
                >
                  {playing ? <PauseIcon /> : <PlayArrowIcon />}
                </button>
              </div>
            )}
          </div>

          <div className={styles.timelineSection}>
            <div className={styles.currentBlockWrap}>
              <span className={styles.currentBlockLabel}>{currentBlockLabel}</span>
            </div>
            <div className={styles.sliderWrap}>
              <div className={vpStyles.sliderRow}>
                <Slider
                  min={0}
                  max={100}
                  value={progress}
                  onChange={handleProgressChange}
                  className={`${vpStyles.progressSlider} ${styles.sliderWithMarks}`}
                  marks={MARKS.map((m) => ({ value: m.value }))}
                  slotProps={{
                    rail: { className: vpStyles.sliderRail },
                    track: { className: vpStyles.sliderTrack },
                    thumb: { className: vpStyles.sliderThumb },
                  }}
                />
              </div>
            </div>
          </div>

          <div className={styles.controlsRow}>
            <div className={styles.volumeGroup}>
              <button
                type="button"
                className={styles.volumeBtn}
                onClick={() => setShowVolumeSlider((s) => !s)}
                aria-label={t.volumeLabel || 'Громкость'}
              >
                {volume === 0 ? <VolumeOffIcon /> : <VolumeUpIcon />}
              </button>
              {showVolumeSlider && (
                <Slider
                  className={styles.volumeSlider}
                  min={0}
                  max={100}
                  step={1}
                  value={Number(volume * 100)}
                  onChange={(_, val) => setVolume(Number(val) / 100)}
                  size="small"
                  sx={{
                    width: 100,
                    color: '#695d43',
                    '& .MuiSlider-rail': { height: 6, borderRadius: 3, backgroundColor: '#695d43', opacity: 1 },
                    '& .MuiSlider-track': { height: 6, borderRadius: 3, backgroundColor: '#cbb485' },
                    '& .MuiSlider-thumb': { width: 16, height: 16, backgroundColor: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' },
                  }}
                />
              )}
            </div>
            <span className={styles.timer}>
              {formatTime(currentTime)} / {formatTime(TOTAL_DURATION)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
