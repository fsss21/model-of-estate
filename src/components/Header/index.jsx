import { useLocation } from 'react-router-dom'
import { useTranslations } from '../../contexts/LanguageContext'
import styles from './Header.module.css'

const Header = () => {
  const { pathname } = useLocation()
  const { t, language } = useTranslations()
  const isCatalogEra = pathname === '/catalog-era'
  const isEn = language === 'en'
  const title = isCatalogEra ? (t.chooseEra ?? 'выбор эпохи') : (t.headerTitle ?? 'Зал с макетом усадьбы')

  return (
    <header className={`${styles.header} ${isCatalogEra ? styles.headerLeft : ''} ${isEn ? styles.headerEn : ''}`}>
      <div className={styles.headerTitleBlock}>
        <h2 className={`${styles.headerTitle} ${isCatalogEra ? styles.headerTitleLeft : ''} ${isEn ? styles.headerTitleEn : ''}`}>{title}</h2>
      </div>
    </header>
  )
}

export default Header