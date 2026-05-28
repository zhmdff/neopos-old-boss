import React, { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { stripNeoPosInternalTags } from '../../utils/auditNotifyText';
import { getApiOrigin } from '../../utils/apiBaseUrl';

/** AuditLogService / SignalR `title` ilə eyni normalizasiya (AZ hərfləri). */
const normalizeAuditTitle = (title) =>
  String(title || '')
    .toUpperCase()
    .replace(/İ/g, 'I')
    .replace(/İ/g, 'I')
    .replace(/Ə/g, 'E')
    .replace(/ı/g, 'I')
    .replace(/Ç/g, 'C')
    .replace(/Ş/g, 'S')
    .replace(/Ö/g, 'O')
    .replace(/Ü/g, 'U')
    .replace(/Ğ/g, 'G');

const isProductDeletionAudit = (title) => {
  const n = normalizeAuditTitle(title);
  return n.includes('MEHSUL') && n.includes('SILINDI');
};

const isArchiveCheckReopenedAudit = (title) => {
  const n = normalizeAuditTitle(title);
  return n.includes('ARXIV') && n.includes('CEK') && n.includes('YENILENDI');
};

const isTableTransferAudit = (title) => {
  const n = normalizeAuditTitle(title);
  return n.includes('MASA') && n.includes('KOCURULDU');
};

const isBossCriticalWebPushAudit = (title) =>
  isProductDeletionAudit(title) || isArchiveCheckReopenedAudit(title) || isTableTransferAudit(title);

const buildNotificationHubUrl = () => {
  let base = getApiOrigin();
  if (!base) return '';
  base = base.replace(/\/?api$/i, '');
  const token = localStorage.getItem('token') || '';
  const path = `${base}/notificationHub`;
  return token ? `${path}?access_token=${encodeURIComponent(token)}` : path;
};

/**
 * Boss-da girişdən sonra SignalR — məhsul silinmə, arxiv çek, masa köçürməsi
 * (Telegram bildirişi ilə eyni auditlər; panel açıq olanda toast).
 */
export default function BossAuditLiveNotify({ companyId }) {
  const connRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const cid = String(companyId || '')
      .trim()
      .toLowerCase();
    if (!cid) return;

    const hubUrl = buildNotificationHubUrl();
    if (!hubUrl) {
      console.warn('BossAuditLiveNotify: API ünvanı tapılmadı — SignalR qoşulmur.');
      return;
    }

    let stopped = false;

    const run = async () => {
      try {
        const prev = connRef.current;
        if (prev) {
          try {
            await prev.stop();
          } catch {
            /* */
          }
          connRef.current = null;
        }
      } catch {
        /* */
      }

      const conn = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => localStorage.getItem('token') || '',
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .build();

      conn.on('ReceiveNotification', (msg) => {
        const title = msg?.title ?? msg?.Title ?? '';
        if (!isBossCriticalWebPushAudit(title)) return;

        const body = stripNeoPosInternalTags(msg?.body ?? msg?.Body ?? '');
        const userName = msg?.userName ?? msg?.UserName ?? '';
        const tableName = msg?.tableName ?? msg?.TableName ?? '';
        const hallName = msg?.hallName ?? msg?.HallName ?? '';
        const time = msg?.time ?? msg?.Time ?? '';
        const meta = [time, userName, tableName || hallName].filter(Boolean).join(' · ');
        const productDel = isProductDeletionAudit(title);
        const transfer = isTableTransferAudit(title);
        const titleClass = productDel
          ? 'text-red-700'
          : transfer
            ? 'text-blue-800'
            : 'text-amber-700';
        const icon = productDel ? '❗' : transfer ? '🔄' : '📂';

        toast(
          (_t) => (
            <button
              type="button"
              onClick={() => navigate('/boss/audit-logs')}
              className="w-full text-left"
            >
              <div className={`font-black ${titleClass}`}>{title}</div>
              {meta ? <div className="mt-1 text-xs font-bold text-slate-600">{meta}</div> : null}
              {body ? <div className="mt-1 text-xs text-slate-500">{body}</div> : null}
              <div className="mt-1 text-[10px] font-bold text-sky-600">Hərəkət tarixi →</div>
            </button>
          ),
          { duration: 9000, icon }
        );

        console.log('[NeoPos] Audit bildirişi gəldi (SignalR):', title, body || '');
        window.dispatchEvent(new Event('neopos-audit-live'));
      });

      conn.on('ReceivePendingDeleteRefresh', () => {
        window.dispatchEvent(new CustomEvent('neopos-pending-delete-refresh'));
      });

      connRef.current = conn;
      try {
        await conn.start();
        if (stopped) return;
        await conn.invoke('JoinCompanyGroup', cid);
      } catch (e) {
        console.warn('SignalR /notificationHub:', e?.message || e);
      }
    };

    void run();

    return () => {
      stopped = true;
      const c = connRef.current;
      connRef.current = null;
      if (c) void c.stop();
    };
  }, [companyId, navigate]);

  return null;
}
