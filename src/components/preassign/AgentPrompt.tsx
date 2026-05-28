import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PO, Lang } from '../../App';
import { IconSparkle } from '../icons/index';

interface AgentPromptProps {
  type: 'crdLaterThanFob' | 'tooEarly';
  po: PO;
  lang: Lang;
  onModifyAndRun: (newCrd: string) => void;
  onProceedAsIs: () => void;
  onCancel: () => void;
}

function formatDMY(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y.slice(2)}`;
}

function weekMonday(weekStr: string): string {
  const [w, y] = weekStr.split('/').map(Number);
  const year = 2000 + y;
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dow = jan4.getUTCDay() || 7;
  const mon = new Date(jan4);
  mon.setUTCDate(jan4.getUTCDate() - dow + 1 + (w - 1) * 7);
  return mon.toISOString().slice(0, 10);
}

function weekLabel(weekStr: string): string {
  const [w, y] = weekStr.split('/');
  return `W${w} / 20${y}`;
}

export function AgentPrompt({ type, po, lang, onModifyAndRun, onProceedAsIs, onCancel }: AgentPromptProps) {
  const fobMonday = weekMonday(po.fobWeek);
  const today = new Date().toISOString().slice(0, 10);
  const [newCrd, setNewCrd] = useState(fobMonday);
  const bufferW = parseInt(po.fobWeek.split('/')[0]) - parseInt(po.crdWeek.split('/')[0]);
  const crdValid = !!newCrd && newCrd >= today && newCrd <= fobMonday;

  return (
    <motion.div
      className="mt-5 flex gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#004F7C] flex items-center justify-center text-white mt-0.5">
        <IconSparkle />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-semibold text-[#004F7C] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <span>AI Agent</span>
          <span className="text-[#C5CFDB]">·</span>
          <span className="text-[#8A98AB] font-normal normal-case tracking-normal">Pre-Assign Engine paused — input required</span>
        </div>

        <div className="bg-white border border-[#DEE5EC] rounded-xl rounded-tl-sm p-4 shadow-sm">
          {type === 'crdLaterThanFob' ? (
            <>
              <p className="text-sm text-[#0F2A3F] leading-relaxed mb-3">
                I detected a scheduling conflict on{' '}
                <span className="font-mono font-semibold">{po.moovRef || po.lot}</span>. The CRD{' '}
                <span className="font-mono font-semibold text-red-500">{formatDMY(po.crd)}</span>{' '}
                falls after the FOB window{' '}
                <span className="font-mono font-semibold">{weekLabel(po.fobWeek)} · {formatDMY(fobMonday)}</span>.
                {' '}Pre-assign cannot proceed — please advise.
              </p>
              <div className="bg-[#F8FAFC] border border-[#DEE5EC] rounded-lg p-3 mb-3">
                <label className="block text-xs font-medium text-[#4A5A6E] mb-1.5">
                  Update CRD to a date on or before {weekLabel(po.fobWeek)}:
                </label>
                <input
                  type="date"
                  value={newCrd}
                  min={today}
                  max={fobMonday}
                  onChange={e => setNewCrd(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#C5CFDB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004F7C] focus:border-transparent bg-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onProceedAsIs}
                  className="px-3 py-1.5 text-xs font-medium border border-[#C5CFDB] rounded-lg hover:bg-[#F8FAFC] text-[#4A5A6E] transition-colors"
                >
                  Keep original (Exception)
                </button>
                <button
                  onClick={() => crdValid && onModifyAndRun(newCrd)}
                  disabled={!crdValid}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg text-white transition-colors"
                  style={{ background: crdValid ? '#004F7C' : '#C5CFDB', cursor: crdValid ? 'pointer' : 'not-allowed' }}
                >
                  Modify CRD & Continue
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-[#0F2A3F] leading-relaxed mb-3">
                <span className="font-mono font-semibold">{po.moovRef || po.lot}</span> is{' '}
                <span className="font-semibold text-blue-600">{bufferW} weeks ahead</span>{' '}
                of FOB (CRD: <span className="font-mono">{weekLabel(po.crdWeek)}</span>, FOB:{' '}
                <span className="font-mono">{weekLabel(po.fobWeek)}</span>). Vessel schedules this
                far ahead may not be confirmed. If I proceed, this LOT will be marked{' '}
                <span className="font-semibold">ON_HOLD</span>. How would you like to continue?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={onCancel}
                  className="px-3 py-1.5 text-xs font-medium border border-[#C5CFDB] rounded-lg hover:bg-[#F8FAFC] text-[#4A5A6E] transition-colors"
                >
                  Skip for now
                </button>
                <button
                  onClick={onProceedAsIs}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg text-white transition-colors"
                  style={{ background: '#004F7C', cursor: 'pointer' }}
                >
                  Proceed (mark ON_HOLD)
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
