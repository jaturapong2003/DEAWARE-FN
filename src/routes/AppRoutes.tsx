import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import HistoryPage from '../pages/HistoryPage';
import ApiTestPage from '../test/ApiTestPage';
import MainLayout from '../components/layouts/MainLayout';

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/api-test" element={<ApiTestPage />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
};

export default AppRoutes;
