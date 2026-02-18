import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import HistoryPage from '../pages/HistoryPage';
import ApiTestPage from '../test/ApiTestPage';
import MainLayout from '../components/layouts/MainLayout';
import EmployeesPage from '@/pages/EmployeesPage';
import EmployeeAttendancePage from '@/pages/EmployeeAttendancePage';


const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/attendance" element={<EmployeeAttendancePage />} />
          <Route path="/api-test" element={<ApiTestPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/employees/:id" element={<EmployeesPage />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
};

export default AppRoutes;
