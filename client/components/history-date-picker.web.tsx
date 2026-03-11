import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

type Props = {
  value: Date;
  onChange: (date: Date) => void;
  maxDate?: Date;
  label?: string;
  disabled?: boolean;
};

type PopoverLayout = {
  left: number;
  maxHeight: number;
  top: number;
  width: number;
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const VIEWPORT_PADDING = 12;
const POPOVER_GAP = 8;
const MIN_POPOVER_WIDTH = 280;
const MAX_POPOVER_WIDTH = 360;
const MIN_POPOVER_HEIGHT = 230;
const MAX_POPOVER_HEIGHT = 312;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date: Date, count: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + count);
  return next;
}

function addMonths(date: Date, count: number) {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function monthIndex(date: Date) {
  return date.getFullYear() * 12 + date.getMonth();
}

export default function HistoryDatePicker({
  value,
  onChange,
  maxDate,
  label = "Date",
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(value));
  const [layout, setLayout] = useState<PopoverLayout>({
    left: VIEWPORT_PADDING,
    maxHeight: MAX_POPOVER_HEIGHT,
    top: 80,
    width: MAX_POPOVER_WIDTH,
  });
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const maxDay = useMemo(() => (maxDate ? startOfDay(maxDate) : null), [maxDate]);
  const valueDay = useMemo(() => startOfDay(value), [value]);

  useEffect(() => {
    setViewMonth(startOfMonth(value));
  }, [value]);

  const updateLayout = useCallback(() => {
    if (!triggerRef.current || typeof window === "undefined") return;

    const rect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const width = Math.min(
      Math.max(rect.width, MIN_POPOVER_WIDTH),
      MAX_POPOVER_WIDTH,
      viewportWidth - VIEWPORT_PADDING * 2,
    );

    const left = Math.min(
      Math.max(VIEWPORT_PADDING, rect.left),
      viewportWidth - width - VIEWPORT_PADDING,
    );

    const maxHeight = Math.max(
      MIN_POPOVER_HEIGHT,
      Math.min(MAX_POPOVER_HEIGHT, viewportHeight - VIEWPORT_PADDING * 2),
    );

    const spaceBelow = viewportHeight - rect.bottom - POPOVER_GAP - VIEWPORT_PADDING;
    const spaceAbove = rect.top - POPOVER_GAP - VIEWPORT_PADDING;
    const openUpward = spaceBelow < maxHeight && spaceAbove > spaceBelow;
    const top = openUpward
      ? Math.max(VIEWPORT_PADDING, rect.top - maxHeight - POPOVER_GAP)
      : Math.min(viewportHeight - maxHeight - VIEWPORT_PADDING, rect.bottom + POPOVER_GAP);

    setLayout({
      left,
      maxHeight,
      top,
      width,
    });
  }, []);

  useEffect(() => {
    if (!open || disabled || typeof window === "undefined") return;

    updateLayout();
    const syncLayout = () => updateLayout();

    window.addEventListener("resize", syncLayout);
    window.addEventListener("scroll", syncLayout, true);
    return () => {
      window.removeEventListener("resize", syncLayout);
      window.removeEventListener("scroll", syncLayout, true);
    };
  }, [disabled, open, updateLayout]);

  useEffect(() => {
    if (!open || typeof window === "undefined") return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const monthStart = startOfMonth(viewMonth);
  const firstWeekDay = monthStart.getDay();
  const gridStart = addDays(monthStart, -firstWeekDay);
  const days = Array.from({ length: 42 }, (_, idx) => addDays(gridStart, idx));

  const monthLabel = monthStart.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const nextMonth = addMonths(viewMonth, 1);
  const canGoNext = !maxDay || monthIndex(nextMonth) <= monthIndex(maxDay);

  return (
    <div style={styles.root}>
      <div style={styles.label}>{label}</div>
      <button
        aria-label="Select history date"
        disabled={disabled}
        onClick={() => setOpen((curr) => !curr)}
        ref={triggerRef}
        style={{
          ...styles.trigger,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.55 : 1,
        }}
        type="button"
      >
        {valueDay.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
      </button>

      {open &&
        !disabled &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <button
              aria-label="Close calendar"
              onClick={() => setOpen(false)}
              style={styles.backdrop}
              type="button"
            />

            <div
              aria-label="Calendar"
              role="dialog"
              style={{
                ...styles.popover,
                left: layout.left,
                maxHeight: layout.maxHeight,
                top: layout.top,
                width: layout.width,
              }}
            >
              <div style={styles.monthRow}>
                <button
                  aria-label="Previous month"
                  onClick={() => setViewMonth((curr) => addMonths(curr, -1))}
                  style={{ ...styles.monthButton, cursor: "pointer" }}
                  type="button"
                >
                  {"<"}
                </button>

                <div style={styles.monthText}>{monthLabel}</div>

                <button
                  aria-label="Next month"
                  disabled={!canGoNext}
                  onClick={() => setViewMonth((curr) => addMonths(curr, 1))}
                  style={{
                    ...styles.monthButton,
                    cursor: canGoNext ? "pointer" : "not-allowed",
                    opacity: canGoNext ? 1 : 0.45,
                  }}
                  type="button"
                >
                  {">"}
                </button>
              </div>

              <div style={styles.grid}>
                {DAY_NAMES.map((day) => (
                  <div key={day} style={styles.dayName}>
                    {day}
                  </div>
                ))}

                {days.map((day) => {
                  const isInMonth = day.getMonth() === monthStart.getMonth();
                  const isSelected = sameDay(day, valueDay);
                  const isDisabled = !!maxDay && day > maxDay;

                  return (
                    <button
                      disabled={isDisabled}
                      key={day.toISOString()}
                      onClick={() => {
                        onChange(startOfDay(day));
                        setOpen(false);
                      }}
                      style={{
                        ...styles.dayCell,
                        backgroundColor: isSelected ? "#0369a1" : "#111827",
                        borderColor: isSelected ? "#38bdf8" : "#334155",
                        color: isSelected ? "#f8fafc" : "#e2e8f0",
                        cursor: isDisabled ? "not-allowed" : "pointer",
                        opacity: isInMonth ? 1 : 0.45,
                      }}
                      type="button"
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  root: {
    position: "relative",
    width: "100%",
  },
  label: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 6,
  },
  trigger: {
    backgroundColor: "#0b1220",
    border: "1px solid #475569",
    borderRadius: 12,
    boxSizing: "border-box",
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: 600,
    minHeight: 44,
    padding: "10px 12px",
    textAlign: "left",
    width: "100%",
  },
  backdrop: {
    background: "transparent",
    border: 0,
    inset: 0,
    margin: 0,
    padding: 0,
    position: "fixed",
    zIndex: 9998,
  },
  popover: {
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    borderRadius: 12,
    boxShadow: "0 12px 28px rgba(2, 6, 23, 0.45)",
    boxSizing: "border-box",
    overflowY: "auto",
    padding: 10,
    position: "fixed",
    zIndex: 9999,
  },
  monthRow: {
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
    marginBottom: 8,
  },
  monthButton: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: 8,
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: 700,
    minHeight: 34,
    minWidth: 34,
  },
  monthText: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: 700,
  },
  grid: {
    display: "grid",
    gap: 4,
    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
  },
  dayName: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: 700,
    paddingBottom: 1,
    textAlign: "center",
  },
  dayCell: {
    backgroundColor: "#111827",
    border: "1px solid #334155",
    borderRadius: 8,
    color: "#e2e8f0",
    fontSize: 13,
    fontWeight: 700,
    minHeight: 32,
  },
};
