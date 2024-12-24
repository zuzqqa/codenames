import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';

import Home from './views/Home/Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
