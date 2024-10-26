# React Gradient Path

A small library to have any gradient follow along any SVG path written in TypeScript and wrapped in a React component.

[This library is inspired of the work of Patrick Cason](https://medium.com/@cereallarceny/getting-gradients-to-follow-along-svg-paths-in-javascript-45357b60bed7).

[Which in turn is inspired of the work of the great Mike Bostock](https://bl.ocks.org/mbostock/4163057).

We opted to use `svgPathProperties` to avoid the need for manipulating DOM elements directly.

## Installation

```bash
npm install --save react-gradient-path
```

## Example

```tsx
import {createRoot} from 'react-dom/client';
import GradientPath from 'react-gradient-path';

const color = [
    {color: '#C6FFDD', pos: 0},
    {color: '#FBD786', pos: 0.25},
    {color: '#F7797D', pos: 0.5},
    {color: '#6DD5ED', pos: 0.75},
    {color: '#C6FFDD', pos: 1},
];

const App = () => (
    <svg width="300" height="200" viewBox="0 0 100 100">
        <GradientPath
            d="M24.3,30 C11.4,30,5,43.3,5,50 s6.4,20,19.3,20 c19.3,0,32.1-40,51.4-40 C88.6,30,95,43.3,95,50 s-6.4,20-19.3,20 C56.4,70,43.6,30,24.3,30z"
            width={10}
            segments={100}
            samples={10}
            fill={color}
        />
    </svg>
);

createRoot(document.getElementById('root')!).render(<App />);
```

## A note about antialiasing

[As Mike Bostock mentioned in his example](https://bl.ocks.org/mbostock/4163057):

> This example uses a thin stroke in addition to filling the segments. This avoids antialiasing artifacts due to most web browsers not implementing [full-scene antialiasing](https://bugs.webkit.org/show_bug.cgi?id=35211).

This is true and unavoidable. In both his example and in Gradient Path, you may notice small gaps between the edges of each segment. _Don't worry, your glasses are working just fine._

To fix this you can add a very subtle stroke the same color as the fill, like this:

```tsx
<GradientPath
    d="M24.3,30 C11.4,30,5,43.3,5,50 s6.4,20,19.3,20 c19.3,0,32.1-40,51.4-40 C88.6,30,95,43.3,95,50 s-6.4,20-19.3,20 C56.4,70,43.6,30,24.3,30z"
    width={10}
    segments={100}
    samples={10}
    strokeWidth={0.5}
    stroke={color}
    fill={color}
/>
```

## Contributing

1. `npm install` - installs all dev dependencies
2. `npm start` - starts example app preview on http://localhost:3000

Fork and PR at will!

## Acknowledgements

[Mike Bostock](https://github.com/mbostock)
[@cereallarceny](https://github.com/cereallarceny)
