import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../Pages/Home';
import Login from '../Pages/Auth/Login';
import Register from '../Pages/Auth/Register';
import LibraryDetails from '../Pages/LibraryDetails';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/libraries/:id" element={<LibraryDetails />} />
            </Routes>
        </BrowserRouter>
    );
}