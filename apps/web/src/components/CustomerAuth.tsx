// apps/web/src/components/CustomerAuth.tsx
import React, { useState } from 'react';
import { User, Phone, MapPin, Mail, ArrowLeft, Crown, Sparkles, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { appStore, INITIAL_CUSTOMERS } from '../services/store';

interface CustomerAuthProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const CustomerAuth: React.FC<CustomerAuthProps> = ({ onBack, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Trạng thái modal tùy chọn tài khoản Google / Facebook
  const [socialModal, setSocialModal] = useState<'google' | 'facebook' | null>(null);
  const [socialName, setSocialName] = useState('');
  const [socialEmail, setSocialEmail] = useState('');
  const [socialPhone, setSocialPhone] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = appStore.loginCustomer(phone);
    if (res.success) {
      onSuccess();
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = appStore.registerCustomer({ fullName, phone, email, address });
    if (res.success) {
      onSuccess();
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleQuickCustomerLogin = (cPhone: string) => {
    const res = appStore.loginCustomer(cPhone);
    if (res.success) onSuccess();
  };

  const handleOpenSocialModal = (provider: 'google' | 'facebook') => {
    setSocialModal(provider);
    if (provider === 'google') {
      setSocialName('Nguyễn Văn An');
      setSocialEmail('an.nguyen.events@gmail.com');
      setSocialPhone('0912 888 999');
    } else {
      setSocialName('Trần Mai Lan');
      setSocialEmail('mailan.wedding@facebook.com');
      setSocialPhone('0988 777 666');
    }
  };

  const handleConfirmSocialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialModal) return;
    const res = appStore.loginCustomerWithOAuth(socialModal, {
      name: socialName.trim(),
      email: socialEmail.trim(),
      phone: socialPhone.trim(),
    });
    setSocialModal(null);
    if (res.success) {
      onSuccess();
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleInstantSocialLogin = (provider: 'google' | 'facebook') => {
    const profile = provider === 'google'
      ? { name: 'Khách Hàng Google (Gmail)', email: 'khachhang.gmail@gmail.com', phone: '0912 333 444' }
      : { name: 'Khách Hàng Facebook', email: 'khachhang.fb@facebook.com', phone: '0988 222 333' };
    const res = appStore.loginCustomerWithOAuth(provider, profile);
    if (res.success) {
      onSuccess();
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-[#ede8de] overflow-hidden">
        
        {/* Banner Top */}
        <div className="bg-[#161c2b] p-6 text-center text-white relative">
          <button
            onClick={onBack}
            className="absolute left-4 top-4 text-slate-400 hover:text-white flex items-center gap-1 text-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>
          
          <div className="w-14 h-14 mx-auto rounded-full border border-[#c5a059] flex items-center justify-center bg-gradient-to-tr from-[#1f2638] to-[#2c3750] shadow-md mb-3">
            <Crown className="w-7 h-7 text-[#dfba73]" />
          </div>
          <h2 className="font-serif-luxury text-2xl font-bold tracking-wider text-[#f5ecd8] uppercase">
            CỔNG THÔNG TIN KHÁCH HÀNG
          </h2>
          <p className="text-xs text-[#c5a059] mt-1">
            Tra cứu hợp đồng, theo dõi tiến độ chuẩn bị sự kiện
          </p>
        </div>

        {/* Tab chuyển đổi Đăng Nhập vs Đăng Ký */}
        <div className="flex border-b border-slate-200 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => { setMode('login'); setErrorMessage(''); }}
            className={`flex-1 py-3.5 text-center transition-colors cursor-pointer ${
              mode === 'login'
                ? 'border-b-2 border-[#c5a059] text-[#161c2b] bg-amber-50/30 font-extrabold'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            onClick={() => { setMode('register'); setErrorMessage(''); }}
            className={`flex-1 py-3.5 text-center transition-colors cursor-pointer ${
              mode === 'register'
                ? 'border-b-2 border-[#c5a059] text-[#161c2b] bg-amber-50/30 font-extrabold'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Đăng Ký Mới
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {errorMessage}
            </div>
          )}

          {/* CÁC NÚT ĐĂNG NHẬP MẠNG XÃ HỘI (GOOGLE / GMAIL & FACEBOOK) */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
              Đăng nhập tiện lợi bằng mạng xã hội
            </div>

            {/* Nút Đăng nhập bằng Google / Gmail */}
            <button
              type="button"
              onClick={() => handleOpenSocialModal('google')}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-3 transition-all shadow-2xs hover:shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Tiếp tục bằng tài khoản Google / Gmail</span>
            </button>

            {/* Nút Đăng nhập bằng Facebook */}
            <button
              type="button"
              onClick={() => handleOpenSocialModal('facebook')}
              className="w-full py-2.5 px-4 rounded-xl border border-[#1877F2]/30 bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold text-xs flex items-center justify-center gap-3 transition-all shadow-2xs hover:shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Tiếp tục bằng tài khoản Facebook</span>
            </button>
          </div>

          {/* Đường kẻ phân cách */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Hoặc dùng số điện thoại
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại liên hệ *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="0912 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-[#c5a059]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl gold-gradient text-[#161c2b] font-bold text-xs uppercase tracking-wider shadow-md hover:brightness-108 transition-all cursor-pointer"
              >
                Đăng Nhập Khách Hàng
              </button>

              {/* Đăng nhập nhanh khách hàng mẫu để kiểm thử */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                  Đăng nhập nhanh khách hàng có sẵn:
                </span>
                <div className="space-y-1.5">
                  {INITIAL_CUSTOMERS.slice(0, 3).map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleQuickCustomerLogin(c.phone)}
                      className="w-full p-2 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 text-left text-xs text-slate-800 flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <strong>{c.fullName}</strong>
                        <span className="text-[10px] text-slate-500 ml-1">({c.phone})</span>
                      </div>
                      <span className="text-[10px] text-[#b8860b] font-bold">Chọn</span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ và tên gia đình / đại diện *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Anh Nam & Chị Lan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Số điện thoại *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="0988 123 456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email (tùy chọn)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    placeholder="khachhang@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Địa chỉ (Thôn, Xã, Huyện)</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Ví dụ: Quang Châu, Việt Yên, Bắc Giang"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl gold-gradient text-[#161c2b] font-bold uppercase tracking-wider shadow-md hover:brightness-108 transition-all cursor-pointer"
              >
                Đăng Ký Tài Khoản Khách Hàng
              </button>
            </form>
          )}
        </div>

      </div>

      {/* MODAL XÁC NHẬN ĐĂNG NHẬP GOOGLE / FACEBOOK */}
      {socialModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 sm:p-7 relative animate-fade-in text-slate-800">
            <button
              onClick={() => setSocialModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center mb-3 shadow-sm bg-slate-50 border border-slate-100">
                {socialModal === 'google' ? (
                  <svg className="w-7 h-7" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                ) : (
                  <svg className="w-7 h-7 fill-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                )}
              </div>
              <h3 className="font-bold text-lg text-slate-900">
                {socialModal === 'google' ? 'Đăng nhập bằng tài khoản Google' : 'Đăng nhập bằng tài khoản Facebook'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Liên kết tài khoản để tra cứu hợp đồng và thông tin chuẩn bị tiệc
              </p>
            </div>

            <form onSubmit={handleConfirmSocialLogin} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ tên hiển thị *</label>
                <input
                  type="text"
                  required
                  value={socialName}
                  onChange={(e) => setSocialName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email tài khoản *</label>
                <input
                  type="email"
                  required
                  value={socialEmail}
                  onChange={(e) => setSocialEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Số điện thoại liên hệ *</label>
                <input
                  type="tel"
                  required
                  value={socialPhone}
                  onChange={(e) => setSocialPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleInstantSocialLogin(socialModal)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Đăng nhập 1-chạm
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2.5 rounded-xl font-bold text-white shadow-md cursor-pointer ${
                    socialModal === 'google' ? 'bg-[#4285F4] hover:bg-[#3367d6]' : 'bg-[#1877F2] hover:bg-[#166fe5]'
                  }`}
                >
                  Xác nhận & Vào
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
