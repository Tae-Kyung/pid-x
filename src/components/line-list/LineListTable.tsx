'use client';

import { useState, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface PipeLine {
  id: string;
  line_number: string;
  nominal_size: string | null;
  service_code: string | null;
  spec_class: string | null;
  source_pages: number[];
  status: string;
}

interface Props {
  data: PipeLine[];
  total: number;
  page: number;
  limit: number;
  sorting: SortingState;
  onSortingChange: (s: SortingState) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onUpdate: (id: string, field: string, value: string) => void;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}

const columnHelper = createColumnHelper<PipeLine>();

const STATUS_COLORS: Record<string, string> = {
  extracted: 'bg-gray-100 text-gray-700',
  verified: 'bg-green-100 text-green-700',
  modified: 'bg-yellow-100 text-yellow-700',
};

export function LineListTable({
  data, total, page, limit, sorting,
  onSortingChange, onPageChange, onLimitChange,
  onUpdate, selectedIds, onSelectionChange,
}: Props) {
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEdit = useCallback((id: string, field: string, value: string) => {
    setEditingCell({ id, field });
    setEditValue(value || '');
  }, []);

  const commitEdit = useCallback(() => {
    if (editingCell) {
      onUpdate(editingCell.id, editingCell.field, editValue);
      setEditingCell(null);
    }
  }, [editingCell, editValue, onUpdate]);

  const columns = [
    // 체크박스
    columnHelper.display({
      id: 'select',
      header: () => (
        <input
          type="checkbox"
          checked={data.length > 0 && data.every((r) => selectedIds.has(r.id))}
          onChange={(e) => {
            if (e.target.checked) {
              onSelectionChange(new Set(data.map((r) => r.id)));
            } else {
              onSelectionChange(new Set());
            }
          }}
          className="rounded"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedIds.has(row.original.id)}
          onChange={(e) => {
            const next = new Set(selectedIds);
            if (e.target.checked) next.add(row.original.id);
            else next.delete(row.original.id);
            onSelectionChange(next);
          }}
          className="rounded"
        />
      ),
      size: 40,
    }),
    columnHelper.accessor('line_number', {
      header: 'Line Number',
      cell: (info) => <span className="font-mono text-xs">{info.getValue()}</span>,
    }),
    columnHelper.accessor('nominal_size', {
      header: 'Size',
      cell: (info) => {
        const id = info.row.original.id;
        const val = info.getValue() || '';
        if (editingCell?.id === id && editingCell.field === 'nominal_size') {
          return (
            <input
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingCell(null); }}
              className="w-16 rounded border px-1 py-0.5 text-xs"
            />
          );
        }
        return <span onDoubleClick={() => startEdit(id, 'nominal_size', val)} className="cursor-pointer">{val}</span>;
      },
    }),
    columnHelper.accessor('service_code', {
      header: 'Service',
      cell: (info) => {
        const id = info.row.original.id;
        const val = info.getValue() || '';
        if (editingCell?.id === id && editingCell.field === 'service_code') {
          return (
            <input
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingCell(null); }}
              className="w-16 rounded border px-1 py-0.5 text-xs"
            />
          );
        }
        return <span onDoubleClick={() => startEdit(id, 'service_code', val)} className="cursor-pointer">{val}</span>;
      },
    }),
    columnHelper.accessor('spec_class', {
      header: 'Spec Class',
      cell: (info) => {
        const id = info.row.original.id;
        const val = info.getValue() || '';
        if (editingCell?.id === id && editingCell.field === 'spec_class') {
          return (
            <input
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingCell(null); }}
              className="w-24 rounded border px-1 py-0.5 text-xs"
            />
          );
        }
        return <span onDoubleClick={() => startEdit(id, 'spec_class', val)} className="cursor-pointer font-mono text-xs">{val}</span>;
      },
    }),
    columnHelper.accessor('source_pages', {
      header: 'Pages',
      enableSorting: false,
      cell: (info) => {
        const pages = info.getValue() as number[] | null;
        if (!pages || pages.length === 0) return '-';
        return (
          <span className="text-xs text-muted-foreground">
            {pages.slice(0, 3).join(', ')}{pages.length > 3 ? ` +${pages.length - 3}` : ''}
          </span>
        );
      },
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const status = info.getValue();
        return (
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status] || 'bg-gray-100'}`}>
            {status}
          </span>
        );
      },
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      onSortingChange(newSorting);
    },
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
  });

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      {/* 테이블 */}
      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b bg-muted/50">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground"
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        className="flex items-center gap-1"
                        onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && <ArrowUpDown className="h-3 w-3" />}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b hover:bg-muted/30">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-sm text-muted-foreground">
                  데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">페이지당</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="rounded border bg-background px-2 py-1 text-xs"
          >
            {[50, 100, 200, 500].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <span className="text-muted-foreground">총 {total.toLocaleString()}건</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="rounded border p-1 hover:bg-muted disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-3 text-xs">{page} / {totalPages || 1}</span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="rounded border p-1 hover:bg-muted disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
