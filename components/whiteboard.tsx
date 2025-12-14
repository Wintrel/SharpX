'use client';
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Stage, Layer, Rect, Transformer } from 'react-konva';
import Konva from 'konva';

const Whiteboard = forwardRef((props, ref) => {
  // 1. STATE: List of shapes on the canvas
  const [rectangles, setRectangles] = useState([
    { id: 'rect1', x: 50, y: 50, width: 100, height: 100, fill: 'red' }, // Example shape
    { id: 'rect2', x: 200, y: 200, width: 100, height: 100, fill: 'green' }, // Example shape
  ]);
  
  // Track which shape is currently selected
  const [selectedId, selectShape] = useState<string | null>(null);
  
  // Background color state
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  
  // Pan and Zoom state
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  // Set container size on mount and resize
  useImperativeHandle(ref, () => ({
    setBackgroundColor: (color: string) => {
      setBackgroundColor(color);
    },
  }), []);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const checkDeselect = (e: any) => {
    // If you click on the empty stage, deselect everything
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
    }
  };

  // Handle mouse down - start panning
  const handleMouseDown = (e: any) => {
    // Only pan if middle mouse button or both left+right, or if no shape is clicked
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      isPanning.current = true;
      const pos = e.evt.preventDefault ? e.currentTarget.getPointerPosition() : { x: e.evt.clientX, y: e.evt.clientY };
      lastPosRef.current = pos;
    }
  };

  // Handle mouse move - pan canvas
  const handleMouseMove = (e: any) => {
    if (!isPanning.current) return;
    
    const pos = e.currentTarget.getPointerPosition();
    const dx = pos.x - lastPosRef.current.x;
    const dy = pos.y - lastPosRef.current.y;
    
    setStagePos({
      x: stagePos.x + dx,
      y: stagePos.y + dy,
    });
    
    lastPosRef.current = pos;
  };

  // Handle mouse up - stop panning
  const handleMouseUp = () => {
    isPanning.current = false;
  };

  // Handle zoom with mouse wheel
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    if (!stage) return;
    
    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    
    // Determine zoom direction
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const zoomSpeed = 0.1;
    const newScale = Math.max(0.1, Math.min(5, oldScale + direction * zoomSpeed));
    
    // Calculate new position to zoom towards pointer
    const mousePointTo = {
      x: (pointer.x - stagePos.x) / oldScale,
      y: (pointer.y - stagePos.y) / oldScale,
    };
    
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    
    setScale(newScale);
    setStagePos(newPos);
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <Stage
        ref={stageRef}
        width={containerSize.width}
        height={containerSize.height}
        onMouseDown={(e) => {
          checkDeselect(e);
          handleMouseDown(e);
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={checkDeselect}
        onWheel={handleWheel}
        scaleX={scale}
        scaleY={scale}
        x={stagePos.x}
        y={stagePos.y}
      >
        <Layer>
          {/* Background rect */}
          <Rect
            x={-stagePos.x / scale}
            y={-stagePos.y / scale}
            width={containerSize.width / scale}
            height={containerSize.height / scale}
            fill={backgroundColor}
            listening={false}
          />
          {rectangles.map((rect, i) => {
            return (
              <Rectangle
                key={rect.id}
                shapeProps={rect}
                isSelected={rect.id === selectedId}
                onSelect={() => {
                  selectShape(rect.id);
                }}
                onChange={(newAttrs: any) => {
                  const rects = rectangles.slice();
                  rects[i] = newAttrs;
                  setRectangles(rects);
                }}
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
});

// 2. COMPONENT: The individual shape
const Rectangle = ({ shapeProps, isSelected, onSelect, onChange }: any) => {
  const shapeRef = React.useRef<any>();
  const trRef = React.useRef<any>();

  React.useEffect(() => {
    if (isSelected) {
      // Attach the transformer (resize box) to this shape manually
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Rect
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        // Update state when dragging ends
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        // Update state when resizing ends
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // Reset scale to 1 so the math doesn't get weird, 
          // and instead update the actual width/height
          node.scaleX(1);
          node.scaleY(1);
          
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX), // prevent 0 width
            height: Math.max(node.height() * scaleY),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize (don't let width be less than 5px)
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

Whiteboard.displayName = 'Whiteboard';
export default Whiteboard;