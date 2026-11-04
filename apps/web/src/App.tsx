// apps/web/src/App.tsx
import React, { Suspense, lazy, useState, useEffect } from 'react';
import { appStore } from './services/store';
import { Header } from './components/Header';
import { CustomerPortal } from './components/CustomerPortal';
import { ToastContainer, ConfirmModal } from './services/notification';
import { useAccount } from './services/eventStore';
import './components/EventWorkspace.css';
import './components/WeddingStyles.css';

const AdminPortal = lazy(() => import('./components/AdminPortal').then(module => ({ default: module.AdminPortal })));
const UnifiedAuth = lazy(() => import('./components/UnifiedAuth').then(module => ({ default: module.UnifiedAuth })));
const PublicWeddingInvitation = lazy(() => import('./components/PublicWeddingInvitation').then(module => ({ default: module.PublicWeddingInvitation })));
const CustomerAccountPanel = lazy(() => import('./components/CustomerAccountPanel').then(module => ({ default: module.CustomerAccountPanel })));

export const App: React.FC = () => {
  // Mặc định giao diện ngoài cổng (Customer Website) là trang đầu tiên
  const [currentView, setCurrentView] = useState<'customer' | 'account' | 'admin' | 'login' | 'invitation'>('customer');
  const [accountSection, setAccountSection] = useState<'profile' | 'invitations' | 'bookings'>('profile');
  const [invitationSlug, setInvitationSlug] = useState('');
  const { account, ready } = useAccount();
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (!ready) return;
      const staff = account?.role === 'admin';
      if (hash === '#tai-khoan' || hash.startsWith('#tai-khoan/') || hash === '#tra-cuu') {
        if (!account) { sessionStorage.setItem('td_auth_return', hash); window.location.hash = '#login'; setCurrentView('login'); return; }
        setAccountSection(hash.endsWith('/thiep-online') ? 'invitations' : hash.endsWith('/lich-hen') || hash === '#tra-cuu' ? 'bookings' : 'profile');
        setCurrentView('account');
        return;
      }
      if (hash.startsWith('#thiep/')) {
        setInvitationSlug(hash.slice(7));
        setCurrentView('invitation');
        return;
      }
      if (
        hash === '#login' || 
        hash === '#admin-login' || 
        hash === '#dang-nhap' || 
        hash === '#customer-auth' || 
        hash === '#auth-khach-hang'
      ) {
        setCurrentView('login');
      } else if (hash === '#admin' || hash.startsWith('#admin/')) {
        if (staff) {
          setCurrentView('admin');
        } else {
          // Chưa đăng nhập quản trị -> Chuyển hướng sang màn hình đăng nhập chung
          window.location.hash = '#login';
          setCurrentView('login');
        }
      } else {
        setCurrentView('customer');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [ready, account?.id, account?.role]);

  useEffect(() => {
    if (currentView !== 'account') return;
    const frame = requestAnimationFrame(() => window.scrollTo(0, 0));
    return () => cancelAnimationFrame(frame);
  }, [currentView, accountSection]);

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
  const authenticatedStaff = account?.role === 'admin' ? appStore.getAuthenticatedStaff() : null;
  const authenticatedCustomer = account?.role === 'customer' ? account : null;
  const articles = appStore.getArticles();
  const promotions = appStore.getPromotions();
  const companyInfo = appStore.getCompanyInfo();
  const monthEvents = appStore.getMonthEvents();
  const debtItems = appStore.getDebtItems();
  const reminderTasks = appStore.getReminderTasks();
  const warehouseAlerts = appStore.getWarehouseAlerts();

  return (
    <div className={`${currentView === 'customer' || currentView === 'account' ? 'public-app-shell ' : ''}min-h-screen bg-[#faf8f5] font-sans text-[#1a1f2c] flex flex-col overflow-x-hidden`}>
      {/* Toast thông báo toàn cục */}
      <ToastContainer />

      {/* Modal Popup xác nhận toàn cục */}
      <ConfirmModal />

      {/* Header chỉ hiển thị khi ở website công khai của khách hàng */}
      {(currentView === 'customer' || currentView === 'account') && (
        <Header
          currentView={currentView}
          onViewChange={(view) => {
            if (view === 'login') {
              window.location.hash = '#login';
            } else if (view === 'admin') {
              if (!window.location.hash.startsWith('#admin')) window.location.hash = '#admin';
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
        <Suspense fallback={<p className="event-empty" role="status">Đang tải giao diện…</p>}>
        {currentView === 'account' && <CustomerAccountPanel key={account?.id} section={accountSection} />}
        {currentView === 'invitation' && <PublicWeddingInvitation key={invitationSlug} slug={invitationSlug} />}
        {/* 1. Website Khách Hàng (Mặc định ngoài cổng) */}
        {currentView === 'customer' && (
          <CustomerPortal
            articles={articles}
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
                const destination = sessionStorage.getItem('td_auth_return') || '#tai-khoan';
                sessionStorage.removeItem('td_auth_return');
                window.location.hash = destination;
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
            monthEvents={monthEvents}
            debtItems={debtItems}
            reminderTasks={reminderTasks}
            warehouseAlerts={warehouseAlerts}
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
        </Suspense>
      </div>
    </div>
  );
};

export default App;

