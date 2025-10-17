'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useEffect, useState, useRef } from 'react';

interface ConsoleLog {
  id: number;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'success' | 'debug';
  message: string;
  source?: string;
}

export default function ConsolePage() {
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [isPaused, setIsPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sampleLogs: Omit<ConsoleLog, 'id' | 'timestamp'>[] = [
      { level: 'info', message: 'Server started on port 3000', source: 'System' },
      { level: 'success', message: 'Database connected successfully', source: 'Database' },
      { level: 'info', message: 'User login: admin@antartika.sch.id', source: 'Auth' },
      { level: 'warn', message: 'High memory usage detected: 85%', source: 'System' },
      { level: 'info', message: 'New registration: John Doe', source: 'PPDB' },
      { level: 'success', message: 'Payment verified for user ID 1234', source: 'Payment' },
      { level: 'error', message: 'Failed to upload document: timeout', source: 'Upload' },
      { level: 'debug', message: 'API request to /api/admin/users took 142ms', source: 'API' },
      { level: 'info', message: 'Document verification completed', source: 'Document' },
      { level: 'warn', message: 'Disk space running low: 15% remaining', source: 'System' },
    ];

    const initialLogs: ConsoleLog[] = sampleLogs.map((log, index) => ({
      ...log,
      id: index,
      timestamp: new Date(Date.now() - (sampleLogs.length - index) * 10000),
    }));

    setLogs(initialLogs);

    if (!isPaused) {
      const interval = setInterval(() => {
        const newLog: ConsoleLog = {
          id: Date.now(),
          timestamp: new Date(),
          level: ['info', 'warn', 'error', 'success', 'debug'][
            Math.floor(Math.random() * 5)
          ] as ConsoleLog['level'],
          message: [
            'Database query executed',
            'User session updated',
            'Cache cleared',
            'Backup completed',
            'Email sent successfully',
            'File processing in progress',
            'Configuration reloaded',
            'Authentication token refreshed',
            'API rate limit reached',
            'Background job started',
          ][Math.floor(Math.random() * 10)],
          source: ['System', 'Database', 'Auth', 'PPDB', 'Payment', 'Upload', 'API'][
            Math.floor(Math.random() * 7)
          ],
        };

        setLogs((prev) => [...prev, newLog]);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isPaused]);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const clearLogs = () => {
    setLogs([]);
  };

  const getLogColor = (level: ConsoleLog['level']) => {
    switch (level) {
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warn':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'debug':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getLevelIcon = (level: ConsoleLog['level']) => {
    switch (level) {
      case 'error':
        return 'fa-circle-xmark';
      case 'warn':
        return 'fa-triangle-exclamation';
      case 'success':
        return 'fa-circle-check';
      case 'debug':
        return 'fa-bug';
      default:
        return 'fa-circle-info';
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    return log.level === filter;
  });

  const logCounts = {
    all: logs.length,
    info: logs.filter((l) => l.level === 'info').length,
    warn: logs.filter((l) => l.level === 'warn').length,
    error: logs.filter((l) => l.level === 'error').length,
    success: logs.filter((l) => l.level === 'success').length,
    debug: logs.filter((l) => l.level === 'debug').length,
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 dark:text-white">Console Log</h1>
        <p className="text-gray-600 dark:text-gray-400">Monitor aktivitas dan log sistem secara real-time</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`p-4 rounded-lg shadow-md transition-all ${
            filter === 'all'
              ? 'bg-gray-700 text-white shadow-lg'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <div className="text-2xl font-bold">{logCounts.all}</div>
          <div className="text-sm mt-1">All Logs</div>
        </button>

        <button
          onClick={() => setFilter('info')}
          className={`p-4 rounded-lg shadow-md transition-all ${
            filter === 'info'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700'
          }`}
        >
          <div className="text-2xl font-bold">{logCounts.info}</div>
          <div className="text-sm mt-1">Info</div>
        </button>

        <button
          onClick={() => setFilter('success')}
          className={`p-4 rounded-lg shadow-md transition-all ${
            filter === 'success'
              ? 'bg-green-600 text-white shadow-lg'
              : 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-gray-700'
          }`}
        >
          <div className="text-2xl font-bold">{logCounts.success}</div>
          <div className="text-sm mt-1">Success</div>
        </button>

        <button
          onClick={() => setFilter('warn')}
          className={`p-4 rounded-lg shadow-md transition-all ${
            filter === 'warn'
              ? 'bg-yellow-600 text-white shadow-lg'
              : 'bg-white dark:bg-gray-800 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-gray-700'
          }`}
        >
          <div className="text-2xl font-bold">{logCounts.warn}</div>
          <div className="text-sm mt-1">Warning</div>
        </button>

        <button
          onClick={() => setFilter('error')}
          className={`p-4 rounded-lg shadow-md transition-all ${
            filter === 'error'
              ? 'bg-red-600 text-white shadow-lg'
              : 'bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700'
          }`}
        >
          <div className="text-2xl font-bold">{logCounts.error}</div>
          <div className="text-sm mt-1">Error</div>
        </button>

        <button
          onClick={() => setFilter('debug')}
          className={`p-4 rounded-lg shadow-md transition-all ${
            filter === 'debug'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-gray-700'
          }`}
        >
          <div className="text-2xl font-bold">{logCounts.debug}</div>
          <div className="text-sm mt-1">Debug</div>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold dark:text-white">Log Stream</h2>
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`px-3 py-2 rounded text-sm transition ${
                autoScroll
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <i className={`fa-solid fa-arrow-down mr-2`}></i>
              Auto-scroll
            </button>

            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`px-3 py-2 rounded text-sm transition ${
                isPaused
                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
                  : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800'
              }`}
            >
              <i className={`fa-solid ${isPaused ? 'fa-play' : 'fa-pause'} mr-2`}></i>
              {isPaused ? 'Resume' : 'Pause'}
            </button>

            <button
              onClick={clearLogs}
              className="px-3 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 text-sm transition"
            >
              <i className="fa-solid fa-trash mr-2"></i>
              Clear
            </button>
          </div>
        </div>

        <div
          ref={logsContainerRef}
          className="p-4 bg-gray-900 font-mono text-sm overflow-y-auto"
          style={{ height: '60vh', maxHeight: '600px' }}
        >
          {filteredLogs.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              <i className="fa-solid fa-inbox text-4xl mb-3"></i>
              <div>No logs to display</div>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`mb-2 p-3 rounded border ${getLogColor(log.level)} flex items-start gap-3`}
              >
                <i className={`fa-solid ${getLevelIcon(log.level)} mt-0.5 flex-shrink-0`}></i>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                    <span className="text-xs opacity-75 font-semibold">
                      {log.timestamp.toLocaleTimeString('id-ID')}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {log.level}
                    </span>
                    {log.source && (
                      <span className="text-xs opacity-75 font-medium">
                        [{log.source}]
                      </span>
                    )}
                  </div>
                  <div className="break-words">{log.message}</div>
                </div>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <div>
              Showing <span className="font-semibold">{filteredLogs.length}</span> of{' '}
              <span className="font-semibold">{logs.length}</span> logs
            </div>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${isPaused ? 'bg-red-500' : 'bg-green-500'}`}></span>
              <span>{isPaused ? 'Paused' : 'Live'}</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
