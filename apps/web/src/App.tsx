// apps/web/src/App.tsx
import React, { useState, useEffect } from 'react';
import { appStore } from './services/store';
import { Header } from './components/Header';
import { CustomerPortal } from './components/CustomerPortal';
import { AdminPortal } from './components/AdminPortal';
import { CustomerAuth } from './components/CustomerAuth';
import { AdminAuth } from './components/AdminAuth';

export const App: React.FC = () => {
  // Mặc định giao diện ngoài cổng (Customer Website) là trang đầu tiên
  const [currentView, setCurrentView] = useState<'customer' | 'admin' | 'customer_auth' | 'admin_auth'>('customer');
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#login' || hash === '#admin-login' || hash === '#dang-nhap') {
        setCurrentView('admin_auth');
      } else if (hash === '#admin') {
        setCurrentView('admin');
      } else if (hash === '#customer' || hash === '#home' || hash === '' || hash === '#top') {
        // Chỉ về customer nếu đang ở admin_auth hoặc admin
        if (window.location.hash === '#customer') {
          setCurrentView('customer');
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => {
    const unsubscribe = appStore.subscribe(() => {
      setTick(t => t + 1);
    });
    return unsubscribe;
  }, []);

  const currentUser = appStore.getCurrentUser();
  const intakes = appStore.getIntakes();
  const jobs = appStore.getJobs();
  const catalog = appStore.getCatalog();
  const reservations = appStore.getReservations();
  const quotes = appStore.getQuotes();
  const payments = appStore.getPayments();
  const auditLogs = appStore.getAuditLogs();
  const customers = appStore.getCustomers();
  const staffMembers = appStore.getStaffMembers();
  const authenticatedStaff = appStore.getAuthenticatedStaff();
  const authenticatedCustomer = appStore.getAuthenticatedCustomer();
  const articles = appStore.getArticles();
  const promotions = appStore.getPromotions();
  const companyInfo = appStore.getCompanyInfo();

  return (
    <div className="min-h-screen bg-[#faf8f5] font-sans text-[#1a1f2c] flex flex-col">
      {/* Header chỉ hiển thị khi ở website công khai của khách hàng, KHÔNG hiển thị trên trang Đăng nhập quản trị hoặc trang Admin */}
      {currentView === 'customer' && (
        <Header
          currentView={currentView}
          onViewChange={(view) => {
            if (view === 'admin_auth') {
              window.location.hash = '#login';
            }
            setCurrentView(view);
          }}
          currentUser={currentUser}
          authenticatedStaff={authenticatedStaff}
          authenticatedCustomer={authenticatedCustomer}
          companyInfo={companyInfo}
        />
      )}

      {/* Vùng hiển thị chính */}
      <div className="flex-1">
        {/* 1. Website Khách Hàng (Mặc định ngoài cổng) */}
        {currentView === 'customer' && (
          <CustomerPortal
            articles={articles}
            promotions={promotions}
            companyInfo={companyInfo}
          />
        )}

        {/* 2. Đăng Ký / Đăng Nhập Khách Hàng */}
        {currentView === 'customer_auth' && (
          <CustomerAuth
            onBack={() => setCurrentView('customer')}
            onSuccess={() => setCurrentView('customer')}
          />
        )}

        {/* 3. Đăng Nhập Quản Trị Viên */}
        {currentView === 'admin_auth' && (
          <AdminAuth
            onBack={() => {
              window.location.hash = '';
              setCurrentView('customer');
            }}
            onSuccess={() => {
              window.location.hash = '#admin';
              setCurrentView('admin');
            }}
          />
        )}

        {/* 4. Web Quản Lý Điều Hành (Admin Portal với Left Menu hoàn chỉnh) */}
        {currentView === 'admin' && (
          <AdminPortal
            currentUser={currentUser}
            intakes={intakes}
            jobs={jobs}
            catalog={catalog}
            reservations={reservations}
            quotes={quotes}
            payments={payments}
            auditLogs={auditLogs}
            customers={customers}
            staffMembers={staffMembers}
            articles={articles}
            promotions={promotions}
            companyInfo={companyInfo}
            onBackToCustomerSite={() => setCurrentView('customer')}
          />
        )}
      </div>
    </div>
  );
};

export default App;
