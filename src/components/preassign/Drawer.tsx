import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PO, Lang } from '../../App';
import { t } from '../../i18n';
import { buildTraceLog, TraceEntry } from '../../utils/traceBuilder';
import { StatusPill } from '../common/StatusPill';
import { TraceStep } from './TraceStep';
import { AgentPrompt } from './AgentPrompt';
import { OverridePanel } from './OverridePanel';
import { IconClose, IconRefresh, IconSparkle, IconAlert, IconEdit } from '../icons/index';

interface AgentIntercept {
  type: 'crdLaterThanFob' | 'tooEarly';
  po: PO;
  onModifyAndRun: (newCrd: string) => void;
  onProceedAsIs: () => void;
  onCancel: () => void;
}

interface DrawerProps {
  po: PO | null;
  open: boolean;
  onClose: () => void;
  runningStep: number | null;
  isLiveRun: boolean;
  onRerun: () => void;
  lang: Lang;
  onGoToException?: () => void;
  allocationUsage?: Record<string, { preassign: number; booked: number }>;
  initialAllocation?: Record<string, number>;
  agentIntercept?: AgentIntercept | null;
  onOverride?: (data: { carrier: string; service: string; vessel: string; voyage: string; etd: string; eta: string }) => void;
}

export function Drawer({ po, open, onClose, runningStep, isLiveRun, onRerun, lang, onGoToException, allocationUsage, initialAllocation, agentIntercept, onOverride }: DrawerProps) {
  const trace = useMemo(() => po ? buildTraceLog(po, lang, allocationUsage, initialAllocation) : [], [po, lang, allocationUsage, initialAllocation]);
  const isLive = isLiveRun && runningStep !== null;
  const [showOverride, setShowOverride] = useState(false);
  const progressPct = isLive
    ? Math.min(100, (runningStep - 1) / 5 * 100)
    : po
      ? (po.status === 'ASSIGNED' ? 100 : po.status === 'ON_HOLD' ? (1 / 5 * 100) : ((Math.min(po.exceptionAtStep || 1, 4) - 1) / 5 * 100))
      : 0;

  if (!po) return null;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-[rgba(0,79,124,0.18)] backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>
      
      <motion.div
        className="fixed top-0 right-0 bottom-0 w-[600px] max-w-full bg-[#F8FAFC] z-[51] flex flex-col shadow-[-8px_0_32px_rgba(0,0,0,0.1)]"
        initial={{ x: '100%' }}
        animate={{ x: open ? 0 : '100%' }}
        transition={{ type: 'tween', duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="px-6 py-4 border-b border-[#DEE5EC] bg-white flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs uppercase tracking-wider text-[#8A98AB] font-semibold">{t(lang, 'drawer.title')}</span>
            <button onClick={onClose} className="p-1 hover:bg-[#F8FAFC] rounded text-[#4A5A6E] transition-colors">
              <IconClose />
            </button>
          </div>
          <div className="text-[10px] text-[#8A98AB] font-mono mb-0.5">{po.moovRef || po.poNo}</div>
          <div className="text-lg font-semibold tracking-tight font-mono text-[#004F7C]">{po.lot}</div>
          <div className="mt-2 flex items-center gap-2 text-xs text-[#4A5A6E]">
            <StatusPill status={isLive ? 'RUNNING' : po.status} lang={lang} />
            <span className="truncate flex-1">{po.article}</span>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mt-4 pt-3 border-t border-dashed border-[#DEE5EC]">
            <MetaItem label={t(lang, 'drawer.lane')} value={`${po.pol} → ${po.pod}`} />
            <MetaItem label={t(lang, 'drawer.container')} value={`${po.teu} × ${po.ctr}`} />
            <MetaItem label={t(lang, 'drawer.crdFob')} value={`${po.crdWeek} / ${po.fobWeek}`} />
            <MetaItem label={t(lang, 'drawer.ldd')} value={po.ldd} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold tracking-tight text-[#0F1E2E]">{t(lang, 'drawer.pipeline')}</h3>
            <span className="text-xs text-[#4A5A6E] font-mono font-medium">
              {isLive ? t(lang, 'drawer.progress', { current: runningStep, pct: Math.round(progressPct) }) : po.status === 'ASSIGNED' ? t(lang, 'drawer.completed') : ''}
            </span>
          </div>
          
          <div className="h-1 bg-[#E6EBF0] rounded-full overflow-hidden mb-6">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#004F7C] to-[#337296] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>

          {(agentIntercept ? trace.slice(0, 1) : trace).map((entry) => (
            <TraceStep key={entry.step} entry={entry} currentStep={isLive ? runningStep : null} lang={lang} />
          ))}

          {agentIntercept && (
            <AgentPrompt
              type={agentIntercept.type}
              po={agentIntercept.po}
              lang={lang}
              onModifyAndRun={agentIntercept.onModifyAndRun}
              onProceedAsIs={agentIntercept.onProceedAsIs}
              onCancel={agentIntercept.onCancel}
            />
          )}

          {!isLive && !agentIntercept && po.status === 'ASSIGNED' && (
            <>
              <ResultCardAssigned po={po} lang={lang} />
              {showOverride && onOverride && (
                <OverridePanel
                  po={po}
                  lang={lang}
                  onConfirm={(data) => { onOverride(data); setShowOverride(false); }}
                  onCancel={() => setShowOverride(false)}
                />
              )}
            </>
          )}
          {!isLive && !agentIntercept && po.status === 'MANUALLY_OVERRIDDEN' && (
            <ResultCardOverridden po={po} lang={lang} />
          )}
          {!isLive && !agentIntercept && po.status === 'ON_HOLD' && <ResultCardOnHold po={po} lang={lang} />}
          {!isLive && !agentIntercept && po.status === 'EXCEPTION' && <ResultCardException po={po} lang={lang} />}
        </div>

        <div className="px-6 py-3 border-t border-[#DEE5EC] bg-white flex-shrink-0 flex gap-2 justify-end">
          {po.status === 'EXCEPTION' && onGoToException && (
            <button
              onClick={onGoToException}
              className="px-3 py-1.5 text-xs font-medium border border-[#C5CFDB] rounded hover:bg-[#F8FAFC] transition-colors"
            >
              Resolve
            </button>
          )}
          {(po.status === 'EXCEPTION' || po.status === 'ON_HOLD') && (
            <button
              onClick={onRerun}
              className="px-3 py-1.5 text-xs font-medium bg-[#004F7C] text-white rounded hover:bg-[#337296] transition-colors flex items-center gap-1"
            >
              <IconRefresh /> Re-run
            </button>
          )}
          {po.status === 'ASSIGNED' && !showOverride && onOverride && (
            <button
              onClick={() => setShowOverride(true)}
              className="px-3 py-1.5 text-xs font-medium border border-[#E9D5FF] text-[#6D28D9] rounded hover:bg-[#F5F3FF] transition-colors flex items-center gap-1"
            >
              <IconEdit /> Override
            </button>
          )}
          {po.status === 'ASSIGNED' && (
            <button
              onClick={() => { setShowOverride(false); onRerun(); }}
              className="px-3 py-1.5 text-xs font-medium border border-[#C5CFDB] rounded hover:bg-[#F8FAFC] transition-colors flex items-center gap-1"
            >
              <IconRefresh /> {t(lang, 'btn.rerun')}
            </button>
          )}
          {po.status === 'MANUALLY_OVERRIDDEN' && (
            <button
              onClick={onRerun}
              className="px-3 py-1.5 text-xs font-medium border border-[#C5CFDB] rounded hover:bg-[#F8FAFC] transition-colors flex items-center gap-1"
            >
              <IconRefresh /> Re-run AI
            </button>
          )}
          <button onClick={onClose} className="px-3 py-1.5 text-xs font-medium border border-[#C5CFDB] rounded hover:bg-[#F8FAFC] transition-colors">
            {t(lang, 'btn.close')}
          </button>
        </div>
      </motion.div>
    </>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-xs">
      <div className="text-[#8A98AB] uppercase tracking-wider font-semibold">{label}</div>
      <div className="text-[#0F1E2E] mt-0.5 font-mono text-xs font-medium">{value}</div>
    </div>
  );
}

function ResultCardAssigned({ po, lang }: { po: PO; lang: Lang }) {
  return (
    <motion.div 
      className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg p-4 mt-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <IconSparkle />
        <h4 className="text-sm font-bold text-[#0F1E2E]">{t(lang, 'result.assignedTitle')}</h4>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <ResultItem label={t(lang, 'result.carrier')} value={po.carrier || ''} />
        <ResultItem label={t(lang, 'result.service')} value={po.service || ''} />
        <div className="col-span-2">
          <ResultItem label={t(lang, 'result.vesselVoyage')} value={`${po.vessel} · ${po.voyage}`} />
        </div>
        <ResultItem label={t(lang, 'result.etd')} value={po.etd || ''} />
        <ResultItem label={t(lang, 'result.eta')} value={po.eta || ''} />
      </div>
    </motion.div>
  );
}

function ResultCardOnHold({ po, lang }: { po: PO; lang: Lang }) {
  return (
    <motion.div 
      className="bg-[#FEF1E7] border border-[#FED8C0] rounded-lg p-4 mt-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <IconAlert />
        <h4 className="text-sm font-bold text-[#FE5000]">{t(lang, 'result.onHoldTitle')}</h4>
      </div>
      <div className="text-xs text-[#0F1E2E] leading-relaxed">
        {t(lang, 'onHoldReasons.' + (po.onHoldKey || 'crdLater'))}
      </div>
    </motion.div>
  );
}

function ResultCardException({ po, lang }: { po: PO; lang: Lang }) {
  return (
    <motion.div 
      className="bg-[#fef2f2] border border-[#fecaca] rounded-lg p-4 mt-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <IconAlert />
        <h4 className="text-sm font-bold text-[#dc2626]">{t(lang, 'result.exceptionTitle')}</h4>
      </div>
      <div className="text-xs text-[#0F1E2E] leading-relaxed">
        <strong>{t(lang, 'result.failedAtStep', { n: po.exceptionAtStep || 1 })}</strong>
        {t(lang, 'exceptionReasons.' + (po.exceptionKey || 'noSpace'))}
      </div>
    </motion.div>
  );
}

function ResultCardOverridden({ po, lang }: { po: PO; lang: Lang }) {
  const ts = po.overriddenAt ? new Date(po.overriddenAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
  return (
    <motion.div
      className="bg-[#F5F3FF] border border-[#E9D5FF] rounded-lg p-4 mt-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <IconEdit />
        <h4 className="text-sm font-bold text-[#6D28D9]">Manually Overridden</h4>
        {po.overriddenBy && (
          <span className="ml-auto text-[10px] text-[#8A98AB] font-mono">{po.overriddenBy} · {ts}</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <ResultItem label={t(lang, 'result.carrier')} value={po.carrier || ''} />
        <ResultItem label={t(lang, 'result.service')} value={po.service || ''} />
        <div className="col-span-2">
          <ResultItem label={t(lang, 'result.vesselVoyage')} value={`${po.vessel} · ${po.voyage}`} />
        </div>
        <ResultItem label={t(lang, 'result.etd')} value={po.etd || ''} />
        <ResultItem label={t(lang, 'result.eta')} value={po.eta || ''} />
      </div>
    </motion.div>
  );
}

function ResultItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-[#8A98AB] uppercase tracking-wider font-semibold">{label}</div>
      <div className="text-sm font-mono mt-0.5 text-[#0F1E2E] font-medium">{value}</div>
    </div>
  );
}