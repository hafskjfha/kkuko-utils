import { useState, useEffect, useRef, CSSProperties } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';

type WordData = {
  k_canuse: boolean;
  noin_canuse: boolean;
  themes: string[];
};

type WordEntry = {
  word: string;
} & WordData;


type JsonData = WordEntry[];

// JSON 뷰어 컴포넌트
interface JsonViewerProps {
  data: JsonData;
}

const JsonViewer = ({ data }: JsonViewerProps) => {
  const [jsonLines, setJsonLines] = useState<string[]>([]);
  const [containerWidth, setContainerWidth] = useState(300);
  const containerRef = useRef(null);

  // JSON을 라인 별로 분리
  useEffect(() => {
    const formattedJson = JSON.stringify(data, null, 2);
    const lines = formattedJson.split('\n');
    setJsonLines(lines);
  }, [data]);

  // 컨테이너 크기 측정
  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          setContainerWidth(entry.contentRect.width);
        }
      });
      
      resizeObserver.observe(containerRef.current);
      
      return () => {
        if (containerRef.current) {
          resizeObserver.unobserve(containerRef.current);
        }
      };
    }
  }, []);

  // 각 라인 렌더링
  const Row = ({ index, style }: ListChildComponentProps) => (
    <div style={style} className="font-mono text-sm pl-2">
      {jsonLines[index]}
    </div>
  );

  return (
    <div ref={containerRef} className="w-full h-full">
      <List
        height={240}
        itemCount={jsonLines.length}
        itemSize={20} // 각 행의 높이
        width="100%"
        className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        {Row}
      </List>
    </div>
  );
};

export default JsonViewer;
