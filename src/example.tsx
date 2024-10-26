import {createRoot} from 'react-dom/client';
import GradientPath from './gradient-path';

const color = [
  {color: '#C6FFDD', pos: 0},
  {color: '#FBD786', pos: 0.25},
  {color: '#F7797D', pos: 0.5},
  {color: '#6DD5ED', pos: 0.75},
  {color: '#C6FFDD', pos: 1},
];

const App = () => {
  return (
    <svg width="300" height="200" viewBox="0 0 100 100">
      <GradientPath
        d="M24.3,30 C11.4,30,5,43.3,5,50 s6.4,20,19.3,20 c19.3,0,32.1-40,51.4-40 C88.6,30,95,43.3,95,50 s-6.4,20-19.3,20 C56.4,70,43.6,30,24.3,30z"
        width={10}
        segments={100}
        samples={10}
        strokeWidth={0.5}
        stroke={color}
        fill={color}
      />
    </svg>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
