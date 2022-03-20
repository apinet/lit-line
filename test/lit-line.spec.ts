/**
 * @license
 * Copyright (c) 2020, Adrien Pinet
 * Released under the MIT license
 */

import { Serie } from "../src/element";
import { Range } from "../src/timeshift";

import {
  CHART_WIDTH,
  CHART_HEIGHT,
  CHART_MARGIN,
  createLitLineSvg,
  getSvg,
  getSeriePath,
  getSeriePoints,
  getSeriePoint,
  getSerieBars,
  getSerieBar,
  getSerieRanges,
  getSerieRange,
  getSeries,
} from "./dom-helper";

/* 
  Test suite for instantiation
  TODO: Interaction + Resize
*/

interface RenderedPoint {
  value: number;
  time: number;
  range?: Range;
}

interface CreationTest {
  when: { desc: string; data: Serie[] };
  it: { should: string; renders: RenderedPoint[][] };
}

const creationTests: CreationTest[] = [
  {
    when: { desc: "series list is empty", data: [] },
    it: { should: "", renders: [] },
  },
  {
    when: {
      desc: "a single point is provided",
      data: [{ points: [{ time: 0, value: 1 }] }],
    },
    it: {
      should: "display a single centered point",
      renders: [[{ time: CHART_WIDTH / 2, value: CHART_HEIGHT / 2 }]],
    },
  },
  {
    when: {
      desc: "two points are provided",
      data: [
        {
          points: [
            { time: 0, value: 1 },
            { time: 1, value: 2 },
          ],
        },
      ],
    },
    it: {
      should: "renders a diagonal line",
      renders: [
        [
          { time: CHART_MARGIN, value: CHART_HEIGHT - CHART_MARGIN },
          { time: CHART_WIDTH - CHART_MARGIN, value: CHART_MARGIN },
        ],
      ],
    },
  },
  {
    when: {
      desc: "two series are provided with the same unit",
      data: [
        {
          points: [
            { time: 0, value: 0 },
            { time: 1, value: 1 },
          ],
        },
        {
          points: [
            { time: 2, value: 2 },
            { time: 3, value: 3 },
          ],
        },
      ],
    },
    it: {
      should: "scale together",
      renders: [
        [
          { time: CHART_MARGIN, value: CHART_HEIGHT - CHART_MARGIN },
          {
            time: CHART_MARGIN + (CHART_WIDTH - 2 * CHART_MARGIN) / 3,
            value:
              CHART_HEIGHT -
              (CHART_MARGIN + (CHART_HEIGHT - 2 * CHART_MARGIN) / 3),
          },
        ],
        [
          {
            time: CHART_MARGIN + (2 * (CHART_WIDTH - 2 * CHART_MARGIN)) / 3,
            value:
              CHART_HEIGHT -
              (CHART_MARGIN + (2 * (CHART_HEIGHT - 2 * CHART_MARGIN)) / 3),
          },
          {
            time: CHART_MARGIN + (3 * (CHART_WIDTH - 2 * CHART_MARGIN)) / 3,
            value:
              CHART_HEIGHT -
              (CHART_MARGIN + (3 * (CHART_HEIGHT - 2 * CHART_MARGIN)) / 3),
          },
        ],
      ],
    },
  },
  {
    when: {
      desc: "two series are provided with two different units",
      data: [
        {
          unit: "usd",
          points: [
            { time: 0, value: 1 },
            { time: 1, value: 2 },
          ],
        },
        {
          unit: "eur",
          points: [
            { time: 0, value: 10 },
            { time: 1, value: 20 },
          ],
        },
      ],
    },
    it: {
      should: "scale independently",
      renders: [
        [
          { time: CHART_MARGIN, value: CHART_HEIGHT - CHART_MARGIN },
          { time: CHART_WIDTH - CHART_MARGIN, value: CHART_MARGIN },
        ],
        [
          { time: CHART_MARGIN, value: CHART_HEIGHT - CHART_MARGIN },
          { time: CHART_WIDTH - CHART_MARGIN, value: CHART_MARGIN },
        ],
      ],
    },
  },
];

creationTests.forEach((test) => {
  describe(`[lit-line] when ${test.when.desc}`, () => {
    const litLineAsync = createLitLineSvg(test.when.data);

    describe(`should ${test.it.should}`, () => {
      it("creates new lit-line component", async () => {
        const litLine = await litLineAsync;
        expect(litLine).toBeDefined();
      });

      it("creates a svg viewBox with the right dimensions", async () => {
        const litLine = await litLineAsync;
        const svg = getSvg(litLine);
        expect(svg?.getAttribute("viewBox")).toEqual(
          `0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`
        );
      });

      it(`renders ${test.it.renders.length} serie(s)`, async () => {
        const litLine = await litLineAsync;
        const series = getSeries(litLine);
        expect(series?.length).toEqual(test.it.renders.length);
      });

      test.it.renders.forEach((serie, serieId) => {
        describe(`checking serie #${serieId}`, () => {
          it(`renders a valid path`, async () => {
            const litLine = await litLineAsync;
            const pathElement = getSeriePath(litLine, serieId);

            let expectedPath = "";

            serie.forEach((slot, slotId) => {
              expectedPath =
                slotId === 0
                  ? `M ${slot.time},${slot.value}`
                  : `${expectedPath} L ${slot.time},${slot.value}`;
            });

            expect(expectedPath).toEqual(<any>pathElement?.getAttribute("d"));
          });

          it(`renders valid points`, async () => {
            const litLine = await litLineAsync;
            const pointElements = getSeriePoints(litLine, serieId);
            expect(pointElements?.length).toEqual(serie.length);

            serie.forEach((slot, slotId) => {
              const pointElement = getSeriePoint(litLine, serieId, slotId);

              expect(pointElement?.getAttribute("cx")).toEqual(`${slot.time}`);
              expect(pointElement?.getAttribute("cy")).toEqual(`${slot.value}`);
            });
          });

          it(`renders valid ranges`, async () => {
            const litLine = await litLineAsync;
            const rangeElements = getSerieRanges(litLine, serieId);
            expect(rangeElements?.length).toEqual(serie.length);

            serie.forEach((slot, slotId) => {
              const rangeElement = getSerieRange(litLine, serieId, slotId);

              expect(rangeElement?.getAttribute("x")).toEqual(
                `${slot.time - 2}`
              );
              expect(rangeElement?.getAttribute("y")).toEqual(
                `${slot.range?.min || slot.value}`
              );
              expect(rangeElement?.getAttribute("width")).toEqual(`${4}`);
              expect(rangeElement?.getAttribute("height")).toEqual(
                `${slot.range ? slot.range.max - slot.range.min : 0}`
              );
            });
          });

          it(`renders valid bars`, async () => {
            const litLine = await litLineAsync;
            const barElements = getSerieBars(litLine, serieId);
            expect(barElements?.length).toEqual(serie.length);

            serie.forEach((slot, slotId) => {
              const barElement = getSerieBar(litLine, serieId, slotId);

              expect(barElement?.getAttribute("x1")).toEqual(`${slot.time}`);
              expect(barElement?.getAttribute("y1")).toEqual(`${slot.value}`);
              expect(barElement?.getAttribute("x2")).toEqual(`${slot.time}`);
              expect(barElement?.getAttribute("y2")).toEqual(
                `${CHART_HEIGHT - CHART_MARGIN}`
              );
            });
          });
        });
      });
    });
  });
});

// TODO : interaction tests
/* 
interface InteractionTest {
  when: {desc: string, data: Serie[], mouseEvents: MouseEvent[]},
  it: {
    should: string,
    fires: (SelectionEventDetail | null)[]
  }
}

const interactionTests: InteractionTest[] = [
  {
    when: { desc: 'user move cursor in the middle of a single line', data: [
      {points:[{time: 0, value: 0}, {time: 10, value: 100}]}
    ] , mouseEvents: [
      {x: 250, y: 250},
      {x: 0, y: 250},
    ]},
    it: {
      should: 'fire the right time and value', fires: [
        {time: 5, values:[50]},
        null,
      ]
    }
  }
];


interactionTests.forEach(test => {
  const litLineAsync = createLitLineSvg(test.when.data);

  describe(test.when.desc, async () => {
    const litLine = await litLineAsync;

    it(test.it.should, async () => {
      if(test.it.fires.length !== test.when.mouseEvents.length) {
        throw new Error('malformed test case');
      }

      const detailsAsync = test.when.mouseEvents.map(async mouseEvent => {
        const detailAsync = listenSelectedEvent(litLine);
        fireMouseEvent(litLine, mouseEvent);
        return await detailAsync;
      });
      
      const details = await Promise.all(detailsAsync);
      expect(test.it.fires).toEqual(details);
    });
  });
});
 */
