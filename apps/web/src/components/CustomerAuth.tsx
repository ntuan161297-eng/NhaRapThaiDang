// apps/web/src/components/CustomerAuth.tsx
import React, { useState } from 'react';
import { User, Phone, MapPin, Mail, Lock, ArrowLeft, CheckCircle2, Crown, Sparkles } from 'lucide-react';
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

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-[#ede8de] overflow-hidden">
        
        {/* Banner Top */}
        <div className="bg-[#161c2b] p-6 text-center text-white relative">
          <button
            onClick={onBack}
            className="absolute left-4 top-4 text-slate-400 hover:text-white flex items-center gap-1 text-xs"
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
            className={`flex-1 py-3.5 text-center transition-colors ${
              mode === 'login'
                ? 'border-b-2 border-[#c5a059] text-[#161c2b] bg-amber-50/30 font-extrabold'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            onClick={() => { setMode('register'); setErrorMessage(''); }}
            className={`flex-1 py-3.5 text-center transition-colors ${
              mode === 'register'
                ? 'border-b-2 border-[#c5a059] text-[#161c2b] bg-amber-50/30 font-extrabold'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Đăng Ký Mới
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {errorMessage}
            </div>
          )}

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
                className="w-full py-3.5 rounded-xl gold-gradient text-[#161c2b] font-bold text-xs uppercase tracking-wider shadow-md hover:brightness-108 transition-all"
              >
                Đăng Nhập Khách Hàng
              </button>

              {/* Đăng nhập nhanh khách hàng mẫu để kiểm thử */}
              <div className="pt-4 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                  Đăng nhập nhanh khách hàng có sẵn:
                </span>
                <div className="space-y-1.5">
                  {INITIAL_CUSTOMERS.slice(0, 3).map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleQuickCustomerLogin(c.phone)}
                      className="w-full p-2 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 text-left text-xs text-slate-800 flex items-center justify-between"
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
            <form onSubmit={handleRegister} className="space-y-4 text-xs">
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
                className="w-full py-3.5 rounded-xl gold-gradient text-[#161c2b] font-bold uppercase tracking-wider shadow-md hover:brightness-108 transition-all"
              >
                Đăng Ký Tài Khoản Khách Hàng
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
