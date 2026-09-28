import { useRef, useEffect, type ReactNode } from "react";

interface Props {
  x: number;
  y: number;
  z: number;
  label: string;
  onMove: (x: number, y: number) => void;
  onFront: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  children: ReactNode;
  showClose?: boolean;
  actionLabel?: string;
  onClose?: () => void;
  onRef?: (el: HTMLDivElement | null) => void;
}

export function DraggableDoc({ x, y, z, label, onMove, onFront, containerRef, children, showClose, actionLabel, onClose, onRef }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onRef?.(ref.current);
    return () => onRef?.(null);
  }, [onRef]);
  const dragging = useRef(false);
  const startMouse = useRef({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("button, input, textarea, select, a, [data-nodrag]")) return;
      e.preventDefault();
      dragging.current = true;
      startMouse.current = { x: e.clientX, y: e.clientY };
      startPos.current = { x, y };
      el.setPointerCapture(e.pointerId);
      onFront();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - startMouse.current.x;
      const dy = e.clientY - startMouse.current.y;
      const container = containerRef.current;
      if (!container) return;
      const maxX = Math.max(0, container.clientWidth - el.offsetWidth);
      const maxY = Math.max(0, container.clientHeight - el.offsetHeight);
      const nx = Math.min(Math.max(0, startPos.current.x + dx), maxX);
      const ny = Math.min(Math.max(0, startPos.current.y + dy), maxY);
      onMove(nx, ny);
    };

    const onPointerUp = () => {
      dragging.current = false;
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
    };
  }, [x, y, onMove, onFront, containerRef]);

  return (
    <div
      ref={ref}
      className="drag-doc"
      style={{
        position: "absolute",
        left: x,
        top: y,
        zIndex: z,
        touchAction: "none",
        userSelect: "none",
        cursor: "grab",
      }}
    >
      {/* Рукоять */}
      <div
        className="doc-grip"
        style={{
          height: 16,
          borderBottom: "2px solid rgba(0,0,0,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 6px",
          fontSize: 7,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "rgba(216,201,168,0.75)",
        }}
      >
        <span>{label}</span>
        {showClose && (
          <button
            type="button"
            data-nodrag
            className="doc-action"
            title={actionLabel}
            aria-label={`${actionLabel}: ${label}`}
            onClick={(event) => {
              event.stopPropagation();
              onClose?.();
            }}
          >
            {actionLabel}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
