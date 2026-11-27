import React, { useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
  type SpringOptions,
} from 'framer-motion';

export type DockItemData = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  badge?: number;
};

type MagnificationDockProps = {
  items: DockItemData[];
  distance?: number;
  panelHeight?: number;
  baseItemSize?: number;
  magnification?: number;
  dockHeight?: number;
  spring?: SpringOptions;
};

type DockItemButtonProps = {
  item: DockItemData;
  mouseX: MotionValue<number>;
  distance: number;
  baseItemSize: number;
  magnification: number;
  spring: SpringOptions;
};

const DockItemButton: React.FC<DockItemButtonProps> = ({
  item,
  mouseX,
  distance,
  baseItemSize,
  magnification,
  spring,
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [active, setActive] = useState(false);

  const pointerDistance = useTransform(mouseX, (x) => {
    const rect = ref.current?.getBoundingClientRect();
    return rect ? x - rect.left - rect.width / 2 : distance;
  });
  const targetSize = useTransform(
    pointerDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize],
  );
  const size = useSpring(targetSize, spring);

  return (
    <motion.button
      ref={ref}
      type="button"
      className="magnification-dock-item"
      style={{ width: size, height: size }}
      onHoverStart={() => setActive(true)}
      onHoverEnd={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      onClick={item.onClick}
      aria-label={item.label}
      title={item.label}
    >
      <span className="magnification-dock-icon" aria-hidden="true">{item.icon}</span>
      {item.badge !== undefined && item.badge > 0 && (
        <span className="magnification-dock-badge" aria-hidden="true">
          {item.badge > 9 ? '9+' : item.badge}
        </span>
      )}
      <AnimatePresence>
        {active && (
          <motion.span
            className="magnification-dock-label"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.16 }}
            role="tooltip"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export const MagnificationDock: React.FC<MagnificationDockProps> = ({
  items,
  distance = 132,
  panelHeight = 60,
  baseItemSize = 44,
  magnification = 66,
  dockHeight = 84,
  spring = { mass: 0.12, stiffness: 180, damping: 16 },
}) => {
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY);
  const isHovered = useMotionValue(0);
  const reduceMotion = useReducedMotion();
  const motionSpring = reduceMotion
    ? { mass: 1, stiffness: 1000, damping: 100 }
    : spring;

  const maxHeight = useMemo(
    () => Math.max(dockHeight, magnification + magnification / 2 + 8),
    [dockHeight, magnification],
  );
  const targetHeight = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
  const height = useSpring(targetHeight, motionSpring);

  return (
    <motion.div className="magnification-dock-wrap" style={{ height }}>
      <motion.div
        className="magnification-dock-panel"
        style={{ height: panelHeight }}
        onPointerMove={(event) => {
          if (event.pointerType !== 'touch') {
            isHovered.set(1);
            mouseX.set(event.clientX);
          }
        }}
        onPointerLeave={() => {
          isHovered.set(0);
          mouseX.set(Number.POSITIVE_INFINITY);
        }}
        role="toolbar"
        aria-label="Quick store navigation"
      >
        {items.map((item) => (
          <DockItemButton
            key={item.label}
            item={item}
            mouseX={mouseX}
            distance={distance}
            baseItemSize={baseItemSize}
            magnification={reduceMotion ? baseItemSize : magnification}
            spring={motionSpring}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default MagnificationDock;
