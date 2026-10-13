// apps/web/src/App.tsx
import React, { useState, useEffect } from 'react';
import { appStore } from './services/store';
import { Header } from './components/Header';
import { CustomerPortal } from './components/CustomerPortal';
import { AdminPortal } from './components/AdminPortal';
import { UnifiedAuth } from './components/UnifiedAuth';
import { ToastContainer, ConfirmModal } from './services/notification';

export const App: React.FC = () => {
  // Mặc định giao diện ngoài cổng (Customer Website) là trang đầu tiên
  const [currentView, setCurrentView] = useState<'customer' | 'admin' | 'login'>('customer');
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      const staff = appStore.getAuthenticatedStaff();
      if (
        hash === '#login' || 
        hash === '#admin-login' || 
        hash === '#dang-nhap' || 
        hash === '#customer-auth' || 
        hash === '#auth-khach-hang'
      ) {
        setCurrentView('login');
      } else if (hash === '#admin') {
        if (staff) {
          setCurrentView('admin');
        } else {
          // Chưa đăng nhập quản trị -> Chuyển hướng sang màn hình đăng nhập chung
          window.location.hash = '#login';
          setCurrentView('login');
        }
      } else if (hash === '#customer' || hash === '#home' || hash === '' || hash === '#top') {
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
    <div className="min-h-screen bg-[#faf8f5] font-sans text-[#1a1f2c] flex flex-col overflow-x-hidden">
      {/* Toast thông báo toàn cục */}
      <ToastContainer />

      {/* Modal Popup xác nhận toàn cục */}
      <ConfirmModal />

      {/* Header chỉ hiển thị khi ở website công khai của khách hàng */}
      {currentView === 'customer' && (
        <Header
          currentView={currentView}
          onViewChange={(view) => {
            if (view === 'login') {
              window.location.hash = '#login';
            } else if (view === 'admin') {
              window.location.hash = '#admin';
            } else if (view === 'customer') {
              window.location.hash = '';
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

        {/* 2. Cổng Đăng Nhập Gộp Chung (Khách hàng & Quản trị) */}
        {currentView === 'login' && (
          <UnifiedAuth
            onBack={() => {
              window.location.hash = '';
              setCurrentView('customer');
            }}
            onSuccess={(role) => {
              if (role === 'admin') {
                window.location.hash = '#admin';
                setCurrentView('admin');
              } else {
                window.location.hash = '';
                setCurrentView('customer');
              }
            }}
          />
        )}

        {/* 3. Web Quản Lý Điều Hành (Admin Portal với Left Menu hoàn chỉnh & Đăng xuất) */}
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
            onBackToCustomerSite={() => {
              window.location.hash = '';
              setCurrentView('customer');
            }}
            onLogout={() => {
              window.location.hash = '#login';
              setCurrentView('login');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default App;

