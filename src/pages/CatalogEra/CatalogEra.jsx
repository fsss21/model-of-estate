import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslations } from '../../contexts/LanguageContext';
import catalogEraImg from '../../assets/catalog_era_img.png';
import catalogEraImg4k from '../../assets/catalog_era_img-4k.png';
import ModalVideoPlayer from './ModalVideoPlayer/modalVideoPlayer';
import styles from './CatalogEra.module.css';

const WIDTH_4K = 1920;

export const BLOCKS = [
    { id: 'construction', labelKey: 'construction' },
    { id: 'flourishing', labelKey: 'flourishing' },
    { id: 'transformation1', labelKey: 'transformation1' },
    { id: 'transformation2', labelKey: 'transformation2' },
    { id: 'restoration', labelKey: 'restoration' },
];

function getBgForWidth(width) {
    return width > WIDTH_4K ? catalogEraImg4k : catalogEraImg;
}

export default function CatalogEra() {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedBlockId, setSelectedBlockId] = useState(null);
    const [bgImage, setBgImage] = useState(() =>
        typeof window !== 'undefined' ? getBgForWidth(window.innerWidth) : catalogEraImg
    );
    const { t } = useTranslations();
    const blocks = useMemo(
        () => BLOCKS.map((b) => ({ ...b, label: t[b.labelKey] ?? b.id })),
        [t]
    );
    const navigate = useNavigate();

    useEffect(() => {
        const updateBg = () => setBgImage(getBgForWidth(window.innerWidth));
        window.addEventListener('resize', updateBg);
        return () => window.removeEventListener('resize', updateBg);
    }, []);

    const openPlayer = (blockId) => {
        setSelectedBlockId(blockId);
        setModalOpen(true);
    };

    const handleBackBtn = () => {
        navigate('/')
    }

    return (
        <div
            className={styles.catalogEra}
            style={{
                backgroundImage: `url(${bgImage})`,

            }}
        >
            <div className={styles.blocksGrid}>
                {blocks.map((b) => (
                    <div key={b.id} className={styles.blockBackBtn}>
                        <button
                            type="button"
                            className={styles.blockBtn}
                            onClick={() => openPlayer(b.id)}
                        >
                            {b.label}
                        </button>
                    </div>
                ))}
            </div>

            <ModalVideoPlayer
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                selectedBlockId={selectedBlockId}
                onSelectBlock={setSelectedBlockId}
                blocks={blocks}
            />

            <button className={styles.backBtn} onClick={handleBackBtn}>{t.back ?? 'назад'}</button>

        </div>
    );
}
