import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layouts/MainLayout';
import LoadingPage from '../components/common/LoadingPage';

// Lazy load pages
const HomePage = lazy(() => import('../pages/Home/HomePage'));
const HistoryPage = lazy(() => import('../pages/HistoryPage'));
const ApiTestPage = lazy(() => import('../ApiTestPage'));
const EmployeesPage = lazy(() => import('@/pages/Employee/EmployeesPage'));
const EmployeeIdPage = lazy(() => import('@/pages/employeeId/EmployeeIdpage'));
const AttendanceMePage = lazy(
  () => import('@/pages/AttendanceMe/AttendanceMePage')
);
const KpiDashboardPage = lazy(
  () => import('@/pages/Employee/KpiDashboardPage')
);

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <MainLayout>
        <Suspense
          fallback={
            <LoadingPage message="กำลังโหลดหน้า..." fullScreen={true} />
          }
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/attendance" element={<AttendanceMePage />} />
            <Route path="/api-test" element={<ApiTestPage />} />
            <Route path="/employees">
              <Route index element={<EmployeesPage />} />
              <Route path="kpi" element={<KpiDashboardPage />} />
              <Route path=":id" element={<EmployeeIdPage />} />
            </Route>
            <Route path="*" element={<div>404 Not Found</div>} />
          </Routes>
        </Suspense>
      </MainLayout>
    </BrowserRouter>
  );
};

export default AppRoutes;
