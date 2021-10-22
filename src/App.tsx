import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { HomePage } from './pages/HomePage';
import { PlayerPage } from './pages/PlayerPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="player" element={<PlayerPage />} />
      </Routes>
    </Router>
  );
};

export default App;
