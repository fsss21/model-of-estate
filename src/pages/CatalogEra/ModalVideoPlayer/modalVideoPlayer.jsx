import { useState, useRef, useEffect } from 'react';
import Slider from '@mui/material/Slider';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslations } from '../../../contexts/LanguageContext';
import styles from './modalVideoPlayer.module.css';

import backVideoplayerImg from '../../../assets/back_videoplayer_img.png';
import backVideoplayerImg4k from '../../../assets/back_videoplayer_img-4k.png';

const WIDTH_4K = 1920;

function getModalBgForWidth(width) {
  return width > WIDTH_4K ? backVideoplayerImg4k : backVideoplayerImg;
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ModalVideoPlayer({
  isOpen,
  onClose,
  selectedBlockId,
  onSelectBlock,
  blocks,
}) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showPlayOverlay, setShowPlayOverlay] = useState(true);
  const [modalBg, setModalBg] = useState(() =>
    typeof window !== 'undefined' ? getModalBgForWidth(window.innerWidth) : backVideoplayerImg
  );
  const videoRef = useRef(null);
  const hideOverlayTimeoutRef = useRef(null);
  const { t } = useTranslations();

  const HIDE_PLAY_OVERLAY_MS = 3000;

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

  const block = blocks?.find((b) => b.id === selectedBlockId);

  useEffect(() => {
    const updateBg = () => setModalBg(getModalBgForWidth(window.innerWidth));
    window.addEventListener('resize', updateBg);
    return () => window.removeEventListener('resize', updateBg);
  }, []);

  useEffect(() => {
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setShowPlayOverlay(true);
  }, [selectedBlockId]);

  useEffect(() => {
    return () => {
      if (hideOverlayTimeoutRef.current) clearTimeout(hideOverlayTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTimeUpdate = () => setCurrentTime(v.currentTime);
    const onLoadedMetadata = () => setDuration(v.duration);
    const onEnded = () => setPlaying(false);
    v.addEventListener('timeupdate', onTimeUpdate);
    v.addEventListener('loadedmetadata', onLoadedMetadata);
    v.addEventListener('ended', onEnded);
    return () => {
      v.removeEventListener('timeupdate', onTimeUpdate);
      v.removeEventListener('loadedmetadata', onLoadedMetadata);
      v.removeEventListener('ended', onEnded);
    };
  }, [selectedBlockId]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) v.play().catch(() => setPlaying(false));
    else v.pause();
  }, [playing, selectedBlockId]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = volume;
  }, [volume]);

  const handleProgressChange = (_, value) => {
    const v = videoRef.current;
    if (!v || !Number.isFinite(value)) return;
    const time = (value / 100) * (v.duration || 0);
    v.currentTime = time;
    setCurrentTime(time);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose} aria-hidden="false">
      <div className={styles.modalBack}
        onClick={(e) => e.stopPropagation()}>
        <div
          className={styles.modal}
          style={{ backgroundImage: `url(${modalBg})` }}

          role="dialog"
          aria-modal="true"
          aria-labelledby="video-player-title"
        >
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={t.closeLabel || 'Закрыть'}
          >
            <CloseIcon />
          </button>

          <h2 id="video-player-title" className={styles.playerTitle}>
            {block?.label}
          </h2>
          <p className={styles.startLabel}>{t.startShow ?? 'начать показ'}</p>

          <div className={styles.videoWrap} onClick={handleVideoAreaClick}>
            <video
              ref={videoRef}
              className={styles.video}
              src=""
              playsInline
              key={selectedBlockId}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            />
            {showPlayOverlay && (
              <div
                className={styles.playOverlay}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className={styles.playBtn}
                  onClick={handlePlayBtnClick}
                  aria-label={playing ? (t.pause || 'Пауза') : (t.play || 'Воспроизведение')}
                >
                  {playing ? <PauseIcon /> : <PlayArrowIcon />}
                </button>
              </div>
            )}
          </div>

          <div className={styles.sliderRow}>
            <Slider
              min={0}
              max={100}
              value={progress}
              onChange={handleProgressChange}
              className={styles.progressSlider}
              slotProps={{
                rail: { className: styles.sliderRail },
                track: { className: styles.sliderTrack },
                thumb: { className: styles.sliderThumb },
              }}
            />
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
                    '& .MuiSlider-rail': {
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#695d43',
                      opacity: 1,
                    },
                    '& .MuiSlider-track': {
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#cbb485',
                    },
                    '& .MuiSlider-thumb': {
                      width: 16,
                      height: 16,
                      backgroundColor: '#fff',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    },
                  }}
                />
              )}
            </div>
            <span className={styles.timer}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className={styles.blockButtons}>
            <button
              type="button"
              className={styles.blockNavBtn}
              onClick={() => {
                const idx = blocks?.findIndex((b) => b.id === selectedBlockId) ?? 0;
                const prevIdx = idx <= 0 ? (blocks?.length ?? 1) - 1 : idx - 1;
                onSelectBlock(blocks?.[prevIdx]?.id);
              }}
            >
              {t.prevPeriod ?? 'предыдущий период'}
            </button>
            <button
              type="button"
              className={styles.blockNavBtn}
              onClick={() => {
                const idx = blocks?.findIndex((b) => b.id === selectedBlockId) ?? 0;
                const nextIdx = idx < 0 || !blocks?.length ? 0 : (idx + 1) % blocks.length;
                onSelectBlock(blocks?.[nextIdx]?.id);
              }}
            >
              {t.nextPeriod ?? 'следующий период'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
