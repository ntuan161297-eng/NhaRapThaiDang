import { navigatePublicLink } from '../utils/publicSite';

export function PublicBookingSteps() {
  return <nav className="public-booking-steps" aria-label="Đi đến phần trong biểu mẫu đặt lịch">
    {[
      { id: 'booking-service', label: 'Dịch vụ & quy mô' },
      { id: 'booking-schedule', label: 'Thời gian & địa điểm' },
      { id: 'booking-contact', label: 'Thông tin liên hệ' },
    ].map((step, index) => <a href={`#${step.id}`} key={step.id}
      onClick={event => { event.preventDefault(); navigatePublicLink(`#${step.id}`); }}>
      <span>0{index + 1}</span><strong>{step.label}</strong>
    </a>)}
  </nav>;
}
