## Overview

lit-line is a minimal `line chart` library for `modern website`.

why?
 - `small`: less than 7kb (gzip)
 - `fast`: designed for rendering thousand of points with ease (thanks to the awesome lit-html)
 - `multi-lines support`: lines with the same unit are scaled together 
 - `fully responsive`: high data density are merged for better readability
 - `interactive`: user can interact with lines (Desktop and mobile)

[try it!](https://apinet.github.io)

![picture alt](https://apinet.github.io/screenshot_random.png "LitLine Random screenshot")

## Installation

```bash
$ npm install @apinet/lit-line
```

## quick start
```javascript
import '@apinet/lit-line';


<lit-line id="chart"></lit-line>

<script>
  await customElements.whenDefined('lit-line');
  const chart = document.getElementById('chart');

  chart.data = [
    {
      color: '#112',
      points: [
        {time: 1982, value: 1112},
        {time: 1983, value: 2705},
        {time: 2014, value: 1303},
        {time: 2016, value: 2705},
      ]
    }
  ];
</script>
```

## quick start using lit-html (declarative)

```javascript
import '@apinet/lit-line';


<lit-line id="chart" .data=${
  [{
    color: '#112',
    points: [
      {time: 1982, value: 1112},
      {time: 1983, value: 2705},
      {time: 2014, value: 1303},
      {time: 2016, value: 2705},
  ]}></lit-line>
```

## Dataset format
Lit-Line `.data` property accepts `Serie` array such as:

```ts
interface Serie {
  color?: string // the line color (default: #224)
  unit?: string // series with the same unit are scaled together
  points: {time: number, value: number}[] // a list of data points
}
```

## Customization
To change the time selection appearance when the user interact with chart:
```css
  lit-line {
    --lit-line-selected-time--opacity: 0.4;
    --lit-line-selected-time--color: red;
    --lit-line-selected-time--width: 2;
  }
```


## Todo next
 - Add more test cases:
    - testing browser resize
    - testing user interactions
    - ~~testing multi lines~~
 - Improve jsDoc
 - Enhance customization (need feedback here!)

## License
lit-line is available under the [MIT license](https://opensource.org/licenses/MIT).