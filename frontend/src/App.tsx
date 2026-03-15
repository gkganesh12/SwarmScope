import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './views/Home';
import Simulation from './views/Simulation';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/simulation" element={<Simulation />} />
      </Routes>
    </Router>
  );
}

export default App;
