import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PO, Lang } from '../../App';
import { BOOKING_MATRIX } from '../../data/referenceData';
import { IconEdit } from '../icons/index';

interface OverrideData {
  carrier: string;
  service: string;
  vessel: string;
  voyage: string;
  etd: string;
  eta: string;
}

interface OverridePanelProps {
  po: PO;
  lang: Lang;
  onConfirm: (data: OverrideData) => void;
  onCancel: () => void;
}

export function OverridePanel({ po, lang, onConfirm, onCancel }: OverridePanelProps) {
  const laneEntries = useMemo(
    () => BOOKING_MATRIX.filter(e => e.polCode === po.pol && e.podCode === po.pod),
    [po.pol, po.pod]
  );
  const carriers = [...new Set(laneEntries.map(e => e.carrier))];

  const [carrier, setCarrier] = useState(po.carrier || carriers[0] || '');
  const [service, setService] = useState(
    po.service || laneEntries.find(e => e.carrier === (po.carrier || carriers[0]))?.service || ''
  );
  const [vessel, setVessel] = useState(po.vessel || '');
  const [voyage, setVoyage] = useState(po.voyage || '');
  const today = new Date().toISOString().slice(0, 10);
  const [etd, setEtd] = useState(po.etd || today);
  const [eta, setEta] = useState(po.eta || '');

  const isValid = !!(carrier && service && vessel && voyage && etd && eta && eta >= etd);

  const handleCarrierChange = (c: string) => {
    setCarrier(c);
    const entry = laneEntries.find(e => e.carrier === c);
    if (entry) setService(entry.service);
  };

  return (
    <motion.div
      className="mt-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="text-[10px] font-semibold text-[#6D28D9] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
        <IconEdit />
        <span>Manual Override</span>
        <span className="text-[#C5CFDB]">·</span>
        <span className="text-[#8A98AB] font-normal normal-case tracking-normal">z.dorothy</span>
      </div>

      <div className="bg-white border border-[#E9D5FF] rounded-xl p-4 shadow-sm">
        <p className="text-xs text-[#4A5A6E] mb-3 leading-relaxed">
          You are overriding the AI assignment for{' '}
          <span className="font-mono font-semibold">{po.moovRef || po.lot}</span>.
          This action will be logged with your name and timestamp.
        </p>

        <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 mb-4">
          <div>
            <label className="block text-[10px] font-semibold text-[#4A5A6E] uppercase tracking-wider mb-1">Carrier</label>
            <select
              value={carrier}
              onChange={e => handleCarrierChange(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#C5CFDB] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent bg-white"
            >
              {carriers.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-[#4A5A6E] uppercase tracking-wider mb-1">Service</label>
            <input
              type="text"
              value={service}
              onChange={e => setService(e.target.value)}
              placeholder="e.g. NE2"
              className="w-full px-2.5 py-1.5 border border-[#C5CFDB] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-[#4A5A6E] uppercase tracking-wider mb-1">Vessel</label>
            <input
              type="text"
              value={vessel}
              onChange={e => setVessel(e.target.value)}
              placeholder="Vessel name"
              className="w-full px-2.5 py-1.5 border border-[#C5CFDB] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-[#4A5A6E] uppercase tracking-wider mb-1">Voyage</label>
            <input
              type="text"
              value={voyage}
              onChange={e => setVoyage(e.target.value)}
              placeholder="e.g. 0FAYPE1MA"
              className="w-full px-2.5 py-1.5 border border-[#C5CFDB] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-[#4A5A6E] uppercase tracking-wider mb-1">ETD</label>
            <input
              type="date"
              value={etd}
              min={today}
              onChange={e => setEtd(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#C5CFDB] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-[#4A5A6E] uppercase tracking-wider mb-1">ETA</label>
            <input
              type="date"
              value={eta}
              min={etd || today}
              onChange={e => setEta(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#C5CFDB] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-medium border border-[#C5CFDB] rounded-lg hover:bg-[#F8FAFC] text-[#4A5A6E] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => isValid && onConfirm({ carrier, service, vessel, voyage, etd, eta })}
            disabled={!isValid}
            className="px-3 py-1.5 text-xs font-medium rounded-lg text-white transition-colors"
            style={{ background: isValid ? '#7C3AED' : '#C5CFDB', cursor: isValid ? 'pointer' : 'not-allowed' }}
          >
            Confirm Override
          </button>
        </div>
      </div>
    </motion.div>
  );
}
