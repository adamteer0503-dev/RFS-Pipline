import { STATUS_COLORS } from '../../constants';

interface Props {
  status: string;
}

export function StatusBadge({ status }: Props) {
  const classes = STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600 ring-gray-200';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${classes}`}
    >
      {status}
    </span>
  );
}
