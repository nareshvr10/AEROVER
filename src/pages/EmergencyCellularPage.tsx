
import React, { useEffect, useState } from 'react';
import {
  RadioTower, ShieldCheck, MapPin, Wifi, AlertTriangle,
  Battery, ClipboardList, Download, RefreshCw, LifeBuoy,
  Activity, LockKeyhole, CheckCircle2, Circle, FileText,
  Clock, Users, Plane, Plus, Trash2
} from 'lucide-react';

type TestPoint = {
  id: string;
  label: string;
  distanceM: string;
  result: 'planned' | 'passed' | 'failed' | 'not_measured';
  notes: string;
  time: string;
};

type SurvivorRequest = {
  id: string;
  name: string;
  contact: string;
  location: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'received' | 'assigned' | 'resolved';
  notes: string;
  time: string;
};

type ChecklistItem = {
  id: string;
  label: string;
  checked: boolean;
};

type EventRecord = {
  id: string;
  time: string;
  type: string;
  detail: string;
};

type DashboardData = {
  testPoints: TestPoint[];
  survivors: SurvivorRequest[];
  checklist: ChecklistItem[];
  events: EventRecord[];
  approvalReference: string;
  approvalExpiry: string;
  operatorName: string;
  operatorCoordinated: boolean;
  gpsChecked: boolean;
  batteryChecked: boolean;
  flightLinkChecked: boolean;
  rthChecked: boolean;
};

const STORAGE_KEY = 'aerover_emergency_cellular_v2';

const INITIAL_CHECKLIST: ChecklistItem[] = [
  { id: 'approval', label: 'Required regulatory authorization verified externally', checked: false },
  { id: 'operator', label: 'Mobile network operator coordination confirmed', checked: false },
  { id: 'payload', label: 'Cellular payload inspection completed', checked: false },
  { id: 'safety', label: 'Flight and ground safety review completed', checked: false },
  { id: 'emergency', label: 'Emergency shutdown procedure reviewed', checked: false },
  { id: 'privacy', label: 'Privacy and survivor data handling reviewed', checked: false },
];

const DEFAULT_DATA: DashboardData = {
  testPoints: [],
  survivors: [],
  checklist: INITIAL_CHECKLIST,
  events: [],
  approvalReference: '',
  approvalExpiry: '',
  operatorName: '',
  operatorCoordinated: false,
  gpsChecked: false,
  batteryChecked: false,
  flightLinkChecked: false,
  rthChecked: false,
};

const loadData = (): DashboardData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    const parsed = JSON.parse(raw) as Partial<DashboardData>;
    return {
      ...DEFAULT_DATA,
      ...parsed,
      checklist: Array.isArray(parsed.checklist)
        ? parsed.checklist
        : INITIAL_CHECKLIST,
      testPoints: Array.isArray(parsed.testPoints) ? parsed.testPoints : [],
      survivors: Array.isArray(parsed.survivors) ? parsed.survivors : [],
      events: Array.isArray(parsed.events) ? parsed.events : [],
    };
  } catch {
    return DEFAULT_DATA;
  }
};

const downloadFile = (filename: string, content: string, mime: string) => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const csvCell = (value: unknown) =>
  `"${String(value ?? '').replace(/"/g, '""')}"`;

const cardClass =
  'rounded-xl border border-[#263746] bg-[#101C28] p-4 sm:p-5';

const inputClass =
  'w-full rounded-lg border border-[#344657] bg-[#0B1420] px-3 py-2.5 text-sm text-[#F2F5F7] outline-none focus:border-cyan-400';

const buttonClass =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-[#344657] px-3 py-2 text-sm text-[#D8E2EA] transition hover:bg-[#1A2B3A] disabled:cursor-not-allowed disabled:opacity-40';

export const EmergencyCellularPage: React.FC = () => {
  const [data, setData] = useState<DashboardData>(loadData);
  const [tab, setTab] = useState<
    'overview' | 'coverage' | 'survivors' | 'safety' | 'reports'
  >('overview');

  const [pointLabel, setPointLabel] = useState('');
  const [pointDistance, setPointDistance] = useState('0');
  const [pointResult, setPointResult] =
    useState<TestPoint['result']>('not_measured');
  const [pointNotes, setPointNotes] = useState('');

  const [survivorName, setSurvivorName] = useState('');
  const [survivorContact, setSurvivorContact] = useState('');
  const [survivorLocation, setSurvivorLocation] = useState('');
  const [survivorPriority, setSurvivorPriority] =
    useState<SurvivorRequest['priority']>('high');
  const [survivorNotes, setSurvivorNotes] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const update = (patch: Partial<DashboardData>) => {
    setData(previous => ({ ...previous, ...patch }));
  };

  const logEvent = (type: string, detail: string) => {
    const event: EventRecord = {
      id: crypto.randomUUID(),
      time: new Date().toISOString(),
      type,
      detail,
    };
    setData(previous => ({
      ...previous,
      events: [event, ...previous.events].slice(0, 500),
    }));
  };

  const updateChecklist = (id: string, checked: boolean) => {
    const checklist = data.checklist.map(item =>
      item.id === id ? { ...item, checked } : item
    );
    update({ checklist });
    logEvent('Safety checklist', `${id}: ${checked ? 'checked' : 'unchecked'}`);
  };

  const addTestPoint = () => {
    if (!pointLabel.trim()) {
      window.alert('Enter a name for this test point.');
      return;
    }

    const point: TestPoint = {
      id: crypto.randomUUID(),
      label: pointLabel.trim(),
      distanceM: pointDistance,
      result: pointResult,
      notes: pointNotes.trim(),
      time: new Date().toISOString(),
    };

    update({ testPoints: [point, ...data.testPoints] });
    logEvent('Coverage test', `${point.label}: ${point.result}`);
    setPointLabel('');
    setPointNotes('');
  };

  const addSurvivorRequest = () => {
    if (!survivorName.trim() && !survivorContact.trim()) {
      window.alert('Enter a name or contact reference.');
      return;
    }

    const request: SurvivorRequest = {
      id: `SOS-${Date.now().toString(36).toUpperCase()}`,
      name: survivorName.trim() || 'Unknown survivor',
      contact: survivorContact.trim(),
      location: survivorLocation.trim(),
      priority: survivorPriority,
      status: 'received',
      notes: survivorNotes.trim(),
      time: new Date().toISOString(),
    };

    update({ survivors: [request, ...data.survivors] });
    logEvent('SOS request logged', request.id);
    setSurvivorName('');
    setSurvivorContact('');
    setSurvivorLocation('');
    setSurvivorNotes('');
  };

  const updateSurvivorStatus = (
    id: string,
    status: SurvivorRequest['status']
  ) => {
    update({
      survivors: data.survivors.map(request =>
        request.id === id ? { ...request, status } : request
      ),
    });
    logEvent('SOS status updated', `${id}: ${status}`);
  };

  const exportJSON = () => {
    downloadFile(
      `aerover-rescue-report-${Date.now()}.json`,
      JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          radioTransmissionEnabled: false,
          data,
        },
        null,
        2
      ),
      'application/json'
    );
    logEvent('Report export', 'JSON report downloaded');
  };

  const exportCSV = () => {
    const rows = [
      ['Record Type', 'ID', 'Timestamp', 'Name / Label', 'Status', 'Details'],
      ...data.testPoints.map(point => [
        'Coverage',
        point.id,
        point.time,
        point.label,
        point.result,
        `Distance=${point.distanceM}m; ${point.notes}`,
      ]),
      ...data.survivors.map(request => [
        'SOS',
        request.id,
        request.time,
        request.name,
        request.status,
        `Priority=${request.priority}; Contact=${request.contact}; Location=${request.location}; ${request.notes}`,
      ]),
      ...data.events.map(event => [
        'Event',
        event.id,
        event.time,
        event.type,
        'logged',
        event.detail,
      ]),
    ];

    downloadFile(
      `aerover-rescue-report-${Date.now()}.csv`,
      rows.map(row => row.map(csvCell).join(',')).join('\r\n'),
      'text/csv;charset=utf-8'
    );
    logEvent('Report export', 'CSV report downloaded');
  };

  const clearLocalData = () => {
    const confirmed = window.confirm(
      'Delete this page’s locally saved test points, SOS records, and event history? This cannot be undone.'
    );
    if (!confirmed) return;

    const fresh: DashboardData = {
      ...DEFAULT_DATA,
      checklist: INITIAL_CHECKLIST.map(item => ({ ...item, checked: false })),
    };
    setData(fresh);
    logEvent('Local data reset', 'Records cleared by operator');
  };

  const checkedCount = data.checklist.filter(item => item.checked).length;
  const safetyComplete = checkedCount === data.checklist.length;
  const openSOS = data.survivors.filter(
    item => item.status !== 'resolved'
  ).length;

  const Metric = ({
    label,
    value,
    sub,
    icon: Icon,
    color = 'text-cyan-300',
  }: {
    label: string;
    value: string;
    sub: string;
    icon: React.ElementType;
    color?: string;
  }) => (
    <div className={cardClass}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-[#8A9AA5]">
            {label}
          </p>
          <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
          <p className="mt-2 text-xs text-[#8A9AA5]">{sub}</p>
        </div>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 text-[#F2F5F7]">
      <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 p-3">
            <RadioTower className="h-7 w-7 text-cyan-300" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Emergency Cellular Rescue
              </h1>
              <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                Radio locked
              </span>
            </div>
            <p className="mt-1 text-sm text-[#8A9AA5]">
              AEROVER / SAR COMMAND / LOCAL PLANNING CONSOLE
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className={buttonClass} onClick={exportCSV}>
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button type="button" className={buttonClass} onClick={exportJSON}>
            <FileText className="h-4 w-4" /> Export JSON
          </button>
        </div>
      </header>

      <section className="rounded-xl border border-amber-500/40 bg-amber-500/[0.08] p-4">
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
          <div>
            <h2 className="font-semibold text-amber-200">
              Cellular transmission is disabled
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#C5D0D8]">
              This dashboard does not transmit cellular signals, connect
              mobile phones, contact a carrier, or verify regulatory approval.
              All checklist entries and test results are operator-entered.
              Hardware telemetry is unavailable until a real device integration
              is implemented.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Payload link"
          value="N/A"
          sub="No hardware telemetry"
          icon={Wifi}
          color="text-amber-300"
        />
        <Metric
          label="Payload power"
          value="N/A"
          sub="No power sensor connected"
          icon={Activity}
          color="text-amber-300"
        />
        <Metric
          label="Drone battery"
          value="N/A"
          sub="Waiting for flight telemetry"
          icon={Battery}
          color="text-amber-300"
        />
        <Metric
          label="Open SOS records"
          value={String(openSOS)}
          sub="Locally recorded requests"
          icon={LifeBuoy}
          color="text-cyan-300"
        />
      </div>

      <nav className="flex gap-2 overflow-x-auto border-b border-[#263746] pb-2">
        {([
          ['overview', 'Command Overview'],
          ['coverage', 'Coverage Planning'],
          ['survivors', 'Survivor Assistance'],
          ['safety', 'Safety & Readiness'],
          ['reports', 'Reports & Events'],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`shrink-0 rounded-lg px-3 py-2 text-sm ${
              tab === id
                ? 'bg-cyan-400/10 text-cyan-200 border border-cyan-400/30'
                : 'border border-transparent text-[#8A9AA5] hover:bg-[#152330]'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === 'overview' && (
        <div className="grid gap-4 xl:grid-cols-3">
          <section className={`${cardClass} xl:col-span-2`}>
            <div className="mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-300" />
              <h2 className="font-semibold">System status</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['Cellular radio', 'Disabled by software design'],
                ['Hardware telemetry', 'Unavailable'],
                ['Coverage', 'Planning only'],
                ['Authorization', safetyComplete ? 'Checklist completed — external verification still required' : 'Checklist incomplete'],
                ['Data storage', 'Browser local storage'],
                ['Network operator', data.operatorName || 'Not recorded'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-[#263746] bg-[#0B1420] p-3"
                >
                  <p className="text-xs text-[#8A9AA5]">{label}</p>
                  <p className="mt-1 text-sm font-medium">{value}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-[#8A9AA5]">
              Completing the local checklist never changes the radio lock or
              establishes legal permission to transmit.
            </p>
          </section>

          <section className={cardClass}>
            <div className="mb-4 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-cyan-300" />
              <h2 className="font-semibold">Readiness checklist</h2>
            </div>
            <div className="mb-3 h-2 overflow-hidden rounded-full bg-[#263746]">
              <div
                className="h-full bg-cyan-400 transition-all"
                style={{ width: `${(checkedCount / data.checklist.length) * 100}%` }}
              />
            </div>
            <p className="mb-4 text-sm text-[#AAB6C2]">
              {checkedCount} of {data.checklist.length} items recorded
            </p>
            <button
              type="button"
              onClick={() => setTab('safety')}
              className="w-full rounded-lg bg-cyan-400 px-3 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
            >
              Review safety items
            </button>
          </section>

          <section className={`${cardClass} xl:col-span-3`}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-cyan-300" />
                <h2 className="font-semibold">Recent event log</h2>
              </div>
              <span className="text-xs text-[#8A9AA5]">
                {data.events.length} events
              </span>
            </div>
            {data.events.length === 0 ? (
              <p className="text-sm text-[#8A9AA5]">
                No operator events recorded yet.
              </p>
            ) : (
              <div className="space-y-2">
                {data.events.slice(0, 6).map(event => (
                  <div
                    key={event.id}
                    className="flex flex-col justify-between gap-1 rounded-lg border border-[#263746] p-3 sm:flex-row"
                  >
                    <div>
                      <p className="text-sm font-medium">{event.type}</p>
                      <p className="text-xs text-[#8A9AA5]">{event.detail}</p>
                    </div>
                    <time className="text-xs text-[#8A9AA5]">
                      {new Date(event.time).toLocaleString()}
                    </time>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {tab === 'coverage' && (
        <div className="space-y-4">
          <section className={cardClass}>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-cyan-300" />
              <h2 className="font-semibold">Coverage planning canvas</h2>
            </div>
            <div className="mt-4 grid gap-5 md:grid-cols-[220px_1fr] md:items-center">
              <div className="flex items-center justify-center">
                <div className="flex h-48 w-48 items-center justify-center rounded-full border border-dashed border-cyan-300/70 bg-cyan-300/[0.04]">
                  <div className="flex h-32 w-32 items-center justify-center rounded-full border border-dashed border-cyan-300/40">
                    <div className="text-center">
                      <MapPin className="mx-auto h-6 w-6 text-cyan-300" />
                      <p className="mt-2 text-lg font-bold">100 m</p>
                      <p className="text-xs text-[#8A9AA5]">Target radius</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3 text-sm text-[#C5D0D8]">
                <p className="font-medium text-amber-300">
                  Planning illustration — not a live map or measured RF coverage.
                </p>
                <p>GPS coordinates: N/A — no GPS receiver connected.</p>
                <p>Received signal level: N/A — no cellular measurement source.</p>
                <p>Phone connection count: N/A — no carrier integration.</p>
                <p className="text-xs text-[#8A9AA5]">
                  Enter field observations manually. The 100 m value is a
                  planning target, not a coverage guarantee.
                </p>
              </div>
            </div>
          </section>

          <section className={cardClass}>
            <h2 className="font-semibold">Record coverage test point</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <input
                className={inputClass}
                placeholder="Point name / reference"
                value={pointLabel}
                onChange={event => setPointLabel(event.target.value)}
              />
              <input
                className={inputClass}
                type="number"
                min="0"
                placeholder="Distance (m)"
                value={pointDistance}
                onChange={event => setPointDistance(event.target.value)}
              />
              <select
                className={inputClass}
                value={pointResult}
                onChange={event => setPointResult(event.target.value as TestPoint['result'])}
              >
                <option value="not_measured">Not measured</option>
                <option value="planned">Planned</option>
                <option value="passed">Passed — manually verified</option>
                <option value="failed">Failed — manually verified</option>
              </select>
              <button type="button" className={buttonClass} onClick={addTestPoint}>
                <Plus className="h-4 w-4" /> Add test point
              </button>
            </div>
            <textarea
              className={`${inputClass} mt-3`}
              rows={2}
              placeholder="Field notes / measurement method / operator"
              value={pointNotes}
              onChange={event => setPointNotes(event.target.value)}
            />
          </section>

          <section className={cardClass}>
            <h2 className="font-semibold">Coverage test log</h2>
            {data.testPoints.length === 0 ? (
              <p className="mt-3 text-sm text-[#8A9AA5]">
                No coverage points recorded.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {data.testPoints.map(point => (
                  <div
                    key={point.id}
                    className="flex flex-col gap-2 rounded-lg border border-[#263746] p-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-medium">{point.label}</p>
                      <p className="text-xs text-[#8A9AA5]">
                        {point.distanceM} m · {new Date(point.time).toLocaleString()}
                      </p>
                      {point.notes && <p className="mt-1 text-sm">{point.notes}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-cyan-200">{point.result.replace('_', ' ')}</span>
                      <button
                        type="button"
                        aria-label="Delete test point"
                        className={buttonClass}
                        onClick={() => update({
                          testPoints: data.testPoints.filter(item => item.id !== point.id)
                        })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {tab === 'survivors' && (
        <div className="space-y-4">
          <section className={cardClass}>
            <div className="flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-cyan-300" />
              <h2 className="font-semibold">Log survivor assistance request</h2>
            </div>
            <p className="mt-2 text-xs text-[#8A9AA5]">
              Local record only. This form does not contact emergency services
              or send a message to a survivor. For immediate danger, contact
              the appropriate emergency service directly.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <input
                className={inputClass}
                placeholder="Name / anonymous reference"
                value={survivorName}
                onChange={event => setSurvivorName(event.target.value)}
              />
              <input
                className={inputClass}
                placeholder="Contact number / reference"
                value={survivorContact}
                onChange={event => setSurvivorContact(event.target.value)}
              />
              <input
                className={inputClass}
                placeholder="Location / landmark"
                value={survivorLocation}
                onChange={event => setSurvivorLocation(event.target.value)}
              />
              <select
                className={inputClass}
                value={survivorPriority}
                onChange={event => setSurvivorPriority(event.target.value as SurvivorRequest['priority'])}
              >
                <option value="low">Low priority</option>
                <option value="medium">Medium priority</option>
                <option value="high">High priority</option>
                <option value="critical">Critical priority</option>
              </select>
              <textarea
                className={`${inputClass} md:col-span-2`}
                rows={2}
                placeholder="Needs / operator notes — avoid unnecessary personal data"
                value={survivorNotes}
                onChange={event => setSurvivorNotes(event.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={addSurvivorRequest}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
            >
              <Plus className="h-4 w-4" /> Record SOS request
            </button>
          </section>

          <section className={cardClass}>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-300" />
              <h2 className="font-semibold">Survivor assistance log</h2>
            </div>
            {data.survivors.length === 0 ? (
              <p className="mt-3 text-sm text-[#8A9AA5]">No SOS records yet.</p>
            ) : (
              <div className="mt-3 space-y-3">
                {data.survivors.map(request => (
                  <article key={request.id} className="rounded-lg border border-[#263746] p-4">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row">
                      <div>
                        <p className="font-semibold">{request.name}</p>
                        <p className="text-xs text-[#8A9AA5]">{request.id} · {new Date(request.time).toLocaleString()}</p>
                      </div>
                      <span className={`text-xs font-semibold uppercase ${
                        request.priority === 'critical' ? 'text-red-300' :
                        request.priority === 'high' ? 'text-amber-300' : 'text-cyan-300'
                      }`}>
                        {request.priority}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[#C5D0D8]">
                      Location: {request.location || 'Not recorded'} · Contact: {request.contact || 'Not recorded'}
                    </p>
                    {request.notes && <p className="mt-1 text-sm">{request.notes}</p>}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <label className="text-xs text-[#8A9AA5]">Status</label>
                      <select
                        className={inputClass + ' max-w-48'}
                        value={request.status}
                        onChange={event => updateSurvivorStatus(request.id, event.target.value as SurvivorRequest['status'])}
                      >
                        <option value="received">Received</option>
                        <option value="assigned">Assigned</option>
                        <option value="resolved">Resolved</option>
                      </select>
                      <button
                        type="button"
                        className={buttonClass}
                        onClick={() => update({ survivors: data.survivors.filter(item => item.id !== request.id) })}
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {tab === 'safety' && (
        <div className="space-y-4">
          <section className={cardClass}>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-cyan-300" />
              <h2 className="font-semibold">Authorization & safety checklist</h2>
            </div>
            <p className="mt-2 text-sm text-[#8A9AA5]">
              These are operator records, not an approval verification service.
              Radio transmission remains disabled regardless of checklist state.
            </p>
            <div className="mt-4 space-y-3">
              {data.checklist.map(item => (
                <label
                  key={item.id}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#263746] p-3 hover:bg-[#152330]"
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-cyan-400"
                    checked={item.checked}
                    onChange={event => updateChecklist(item.id, event.target.checked)}
                  />
                  <span className="text-sm">{item.label}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/[0.06] p-3 text-sm text-amber-200">
              {safetyComplete
                ? 'All checklist items are marked. External authorization and operator approval still require independent verification.'
                : `${checkedCount} / ${data.checklist.length} checklist items marked. Review the remaining items before any authorized field test.`}
            </div>
          </section>

          <section className={cardClass}>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-300" />
              <h2 className="font-semibold">Approval record (manual entry)</h2>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-xs text-[#8A9AA5]">
                Approval / reference ID
                <input
                  className={`${inputClass} mt-2`}
                  value={data.approvalReference}
                  onChange={event => update({ approvalReference: event.target.value })}
                  placeholder="Enter reference if issued"
                />
              </label>
              <label className="text-xs text-[#8A9AA5]">
                Expiry date
                <input
                  className={`${inputClass} mt-2`}
                  type="date"
                  value={data.approvalExpiry}
                  onChange={event => update({ approvalExpiry: event.target.value })}
                />
              </label>
              <label className="text-xs text-[#8A9AA5]">
                Operator / organization
                <input
                  className={`${inputClass} mt-2`}
                  value={data.operatorName}
                  onChange={event => update({ operatorName: event.target.value })}
                  placeholder="Organization name"
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-cyan-400"
                  checked={data.operatorCoordinated}
                  onChange={event => update({ operatorCoordinated: event.target.checked })}
                />
                Operator coordination recorded
              </label>
            </div>
            <p className="mt-3 text-xs text-[#8A9AA5]">
              Entering a reference does not validate it. Verify documents and
              permissions with the relevant authorities and operator.
            </p>
          </section>

          <section className={cardClass}>
            <div className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-cyan-300" />
              <h2 className="font-semibold">Drone mission readiness</h2>
            </div>
            <p className="mt-2 text-xs text-[#8A9AA5]">
              These switches record manual inspection only. They do not read
              actual drone telemetry or establish flight readiness.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {([
                ['gpsChecked', 'GPS checked by operator'],
                ['batteryChecked', 'Battery checked by operator'],
                ['flightLinkChecked', 'Flight link checked by operator'],
                ['rthChecked', 'Return-to-home plan reviewed'],
              ] as const).map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 rounded-lg border border-[#263746] p-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-cyan-400"
                    checked={data[key]}
                    onChange={event => {
                      update({ [key]: event.target.checked } as Partial<DashboardData>);
                      logEvent('Readiness checklist', `${label}: ${event.target.checked ? 'checked' : 'unchecked'}`);
                    }}
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-[#263746] bg-[#0B1420] p-3">
              <p className="font-medium text-amber-300">Flight status: NOT VERIFIED</p>
              <p className="mt-1 text-xs text-[#8A9AA5]">
                Battery percentage, GPS fix, altitude, and flight-link status
                remain N/A until a real telemetry adapter is implemented.
              </p>
            </div>
          </section>
        </div>
      )}

      {tab === 'reports' && (
        <div className="space-y-4">
          <section className={cardClass}>
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-cyan-300" />
              <h2 className="font-semibold">Mission report exports</h2>
            </div>
            <p className="mt-2 text-sm text-[#8A9AA5]">
              Export the locally stored checklist, SOS records, coverage
              observations, and event log for offline review.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className={buttonClass} onClick={exportCSV}>
                <Download className="h-4 w-4" /> Download CSV
              </button>
              <button type="button" className={buttonClass} onClick={exportJSON}>
                <Download className="h-4 w-4" /> Download JSON
              </button>
              <button type="button" className={buttonClass} onClick={clearLocalData}>
                <RefreshCw className="h-4 w-4" /> Clear local records
              </button>
            </div>
          </section>

          <section className={cardClass}>
            <div className="mb-3 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-cyan-300" />
              <h2 className="font-semibold">Audit trail</h2>
            </div>
            {data.events.length === 0 ? (
              <p className="text-sm text-[#8A9AA5]">No events recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead className="text-xs text-[#8A9AA5]">
                    <tr>
                      <th className="p-2">Time</th>
                      <th className="p-2">Event</th>
                      <th className="p-2">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.events.map(event => (
                      <tr key={event.id} className="border-t border-[#263746]">
                        <td className="p-2 text-xs">{new Date(event.time).toLocaleString()}</td>
                        <td className="p-2">{event.type}</td>
                        <td className="p-2 text-[#AAB6C2]">{event.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      <footer className="flex flex-col justify-between gap-2 border-t border-[#263746] pt-4 text-xs text-[#8A9AA5] sm:flex-row">
        <span className="flex items-center gap-2">
          <Circle className="h-3 w-3 text-amber-300" />
          Hardware connection: unavailable
        </span>
        <span className="flex items-center gap-2">
          <LockKeyhole className="h-3 w-3 text-amber-300" />
          Cellular transmission: permanently disabled in this prototype
        </span>
        <span>Local-only data · No cloud sync</span>
      </footer>
    </div>
  );
};
