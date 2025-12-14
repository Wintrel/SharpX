import NoSSR from '../../components/noSSR';
import Whiteboard from '../../components/whiteboard';
import Reductor from './reductor';
import { useRef } from 'react';

export default function Home() {
  const whiteboardRef = useRef<any>(null);

  return (
    <NoSSR>
      <Reductor whiteboardRef={whiteboardRef}>
        <Whiteboard ref={whiteboardRef} />
      </Reductor>
    </NoSSR>
  );
}


