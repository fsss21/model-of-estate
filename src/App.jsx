import { Routes, Route } from 'react-router-dom'

import styles from './App.module.css';

import Header from './components/Header';
import MainMenu from './pages/MainMenu/MainMenu';
import CatalogEra from './pages/CatalogEra/CatalogEra';


function App() {

  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.mainContent}>
        <Routes>
          <Route path='/' element={<MainMenu />} />
          <Route path='/catalog-era' element={<CatalogEra />} />
        </Routes>
      </main>
    </div>
  )
}

export default App;
