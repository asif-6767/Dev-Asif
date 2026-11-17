import React, { useEffect } from 'react';
import { X, Check, ArrowRight } from 'lucide-react';
import type { ServiceItem } from '../types/site';
import { PlatformIcon, ServiceIcon } from './Icons';

interface ServiceModalProps {
  service: ServiceItem | null;
  onClose: () => void;
  onSelectForContact: (serviceTitle: string) => void;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({
  service,
  onClose,
  onSelectForContact,
}) => {
  useEffect(() => {
    if (!service) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [service, onClose]);

  if (!service) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-[fadeIn_0.2s_ease]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="glow-frame relative max-h-[88dvh] w-full max-w-2xl overflow-y-auto rounded-[22px] border border-[var(--accent)]/30 bg-gradient-to-br from-[#151A25] to-[#0D1017] p-6 sm:p-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close service details"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl border border-white/15 bg-white/5 text-[#F5F7FA] transition hover:border-[var(--accent)] hover:text-[var(--accent)] cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5 flex items-center gap-4 pr-10">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-[var(--accent)]/30 bg-gradient-to-br from-[var(--accent)]/15 to-[var(--accent-purple)]/15 text-[var(--accent)]">
            <ServiceIcon iconKey={service.iconKey} className="h-6 w-6" />
          </div>
          <div>
            <span className="font-mono text-xs tracking-widest text-[var(--accent-2)]">
              SERVICE {service.serviceNumber}
            </span>
            <h3 id="service-modal-title" className="font-display text-xl sm:text-2xl font-bold text-[#F5F7FA]">
              {service.title}
            </h3>
          </div>
        </div>

        <p className="mb-6 text-sm sm:text-base leading-relaxed text-[#D0D6E2]">
          {service.fullDescription}
        </p>

        <div className="mb-3 font-mono text-xs uppercase tracking-widest text-[var(--accent)]">
          Key Capabilities
        </div>
        <ul className="mb-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {service.features.map((feat, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-[#E2E8F0]"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-2)]" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>

        {service.platforms.length > 0 && (
          <div className="mb-6">
            <div className="mb-2.5 font-mono text-xs uppercase tracking-widest text-[var(--accent)]">
              Relevant Platforms
            </div>
            <div className="flex flex-wrap gap-2">
              {service.platforms.map((plat) => (
                <span
                  key={plat}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-[#F5F7FA]"
                >
                  <PlatformIcon platformKey={plat} className="h-4 w-4 text-[var(--accent)]" />
                  <span className="capitalize">{plat === 'uiux' ? 'UI/UX' : plat}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onSelectForContact(service.title)}
            className="btn-3d btn-primary-3d"
          >
            <span>{service.contactButtonText || 'Request This Service'}</span>
            <ArrowRight className="btn-arrow h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
