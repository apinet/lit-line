/**
 * @license
 * Copyright (c) 2020, Adrien Pinet
 * Released under the MIT license
 */

import { html, render, svg } from "lit-html";

import {
  Point,
  Slot,
  Range,
  getTimeRange,
  getValueRange,
  sortPoints,
  scalePoints,
  reducePoints,
  pointsToSvgPath,
  mergeRanges,
  getValueOverTime,
  SelectedValue,
  scale,
} from "./timeshift";

const MARGIN = 4;
const MIN_GAP = 4;
const DEFAULT_UNIT = "default";
const DEFAULT_COLOR = "#224";

export * as lib from "./timeshift";

export interface Serie {
  unit?: string;
  color?: string;
  points: Point[];
}

// PRBL

interface NormalizedSerie {
  unit: string;
  color: string;
  points: Point[];
}

interface ScaledSerie {
  unit: string;
  color: string;
  slots: Slot[];
}

export interface SelectionEventDetail {
  time: number;
  values: (number | null)[];
}

/**
 * @element lit-line
 * A custom element that renders time series and allows user to interact with them.
 *
 * @fires lit-line:selected - Fired when a user moves cursor/finger over the graph
 *  The event's `detail` object has the following properties:
 *    * `time`: the cursor position through time
 *    * `values`: an array representing selected value for each lines
 *
 *   Note that this event is also fired (once) when user leaves selection (detail is then set to null).
 *
 * @cssprop [--lit-line--selected-time--color=black] - The selected time color
 * @cssprop [--lit-line--selected-time--opacity=.8] - The selected time opacity
 * @cssprop [--lit-line--selected-time--width=2] - The selected time width
 *
 * @attribute {Serie[]} data - An array of data points
 *
 */
export class LitLine extends HTMLElement {
  private series: NormalizedSerie[];
  private scaledSeries: ScaledSerie[];

  private timeRange: Range | null;
  private unitRange: Map<string, Range>;

  private selectedTime: number | null;
  private selectedValues: (SelectedValue | null)[];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.onResize = this.onResize.bind(this);
    this.onSelection = this.onSelection.bind(this);
    this.onLeaveSelection = this.onLeaveSelection.bind(this);

    this.series = [];
    this.scaledSeries = [];
    this.timeRange = null;
    this.unitRange = new Map();

    this.selectedTime = null;
    this.selectedValues = [];

    this.render();
  }

  connectedCallback() {
    window.addEventListener("resize", this.onResize, false);

    this.addEventListener("mousemove", this.onSelection, false);
    this.addEventListener("touchmove", this.onSelection, false);

    this.addEventListener("mouseleave", this.onLeaveSelection, false);
    this.addEventListener("touchend", this.onLeaveSelection, false);

    this.adjust();
  }

  disconnectedCallback() {
    window.removeEventListener("resize", this.onResize, false);

    this.removeEventListener("mousemove", this.onSelection, false);
    this.removeEventListener("touchmove", this.onSelection, false);

    this.removeEventListener("mouseleave", this.onLeaveSelection, false);
    this.removeEventListener("touchend", this.onLeaveSelection, false);
  }

  static get observedAttributes() {
    return []; // TODO: customize layout.
  }

  /*   attributeChangedCallback(name: string, oldValue: string, value: string) {
    
  }
 */
  get data() {
    return this.series;
  }

  set data(series: Serie[]) {
    if (series === undefined || series === null || series.length === 0) {
      return;
    }

    // we set default unit or color if missing and sorting data points
    this.series = series
      .filter((serie) => serie.points.length)
      .map((serie) => {
        return {
          unit: serie.unit?.toLocaleLowerCase() || DEFAULT_UNIT,
          color: serie.color || DEFAULT_COLOR,
          points: sortPoints(serie.points),
        };
      });

    if (this.series.length === 0) {
      return;
    }

    // we construct time and unit ranges
    const timeRanges = this.series.map((serie) => getTimeRange(serie.points));
    this.timeRange = mergeRanges(...timeRanges);

    this.unitRange.clear();
    this.series.forEach((serie) => {
      const serieRange = getValueRange(serie.points);
      let range = this.unitRange.get(serie.unit);

      this.unitRange.set(
        serie.unit,
        range === undefined ? serieRange : mergeRanges(range, serieRange)
      );
    });

    this.adjust();
  }

  adjust() {
    if (!this.clientHeight || !this.clientWidth) {
      this.render();
      return;
    }

    this.scaledSeries = this.series.map((serie) => {
      const unitRange = this.unitRange.get(serie.unit);

      if (unitRange === undefined || this.timeRange === null) {
        throw new Error("onResize: unknown unit or timerange");
      }

      const scaledPoints = scalePoints(
        serie.points,
        this.timeRange,
        unitRange,
        this.clientWidth,
        this.clientHeight,
        MARGIN
      );
      return {
        unit: serie.unit,
        color: serie.color,
        slots: reducePoints(scaledPoints, MIN_GAP),
      };
    });

    this.render();
  }

  private onResize() {
    this.adjust();
  }

  private onSelection(e: MouseEvent | TouchEvent) {
    if (this.hasAttribute("no-selection") || this.timeRange === null) {
      return;
    }

    this.selectedTime =
      e instanceof MouseEvent
        ? e.pageX - this.offsetLeft
        : e.touches[0].pageX - this.offsetLeft;

    if (
      this.selectedTime < MARGIN ||
      this.selectedTime > this.clientWidth - MARGIN
    ) {
      return;
    }

    this.selectedValues = this.scaledSeries.map((serie) => {
      return this.selectedTime === null
        ? null
        : getValueOverTime(serie.slots, this.selectedTime);
    });

    const unscaledSelectedTime = scale(
      this.selectedTime,
      { min: MARGIN, max: this.clientWidth - MARGIN },
      this.timeRange
    );

    const unscaledSelectedValues = this.selectedValues.map((value, i) => {
      const unitRange = this.unitRange.get(this.series[i].unit);

      if (value === null || unitRange === undefined) {
        return null;
      }

      return scale(
        value.value,
        { min: this.clientHeight - MARGIN, max: MARGIN },
        unitRange
      );
    });

    this.dispatch("selected", {
      time: unscaledSelectedTime,
      values: unscaledSelectedValues,
    });

    this.render();
  }

  private onLeaveSelection() {
    if (this.hasAttribute("no-selection")) {
      return;
    }

    this.selectedValues = [];
    this.selectedTime = null;

    this.dispatch("selected", null);
    this.render();
  }

  private dispatch(name: string, detail: any) {
    const event = new CustomEvent(`lit-line:${name}`, {
      composed: true,
      detail,
    });
    this.dispatchEvent(event);
  }

  private render() {
    this.shadowRoot &&
      render(
        html`
          <svg viewBox="0 0 ${this.clientWidth} ${this.clientHeight}">
            ${this.scaledSeries.map((serie) => {
              return svg`
              <g class="serie">
                <path class="serie__path" stroke=${
                  serie.color
                } d="${pointsToSvgPath(serie.slots)}"/>
                ${serie.slots.map(
                  (slot) => svg`
                    <g class="serie__point">
                    <line class="serie__point__bar" stroke=${serie.color} x1="${
                    slot.time
                  }" y1="${slot.value}" x2="${slot.time}" y2="${
                    this.clientHeight - MARGIN
                  }"/>
                    <rect class="serie__point__range"
                      ?highlight=${
                        this.selectedTime &&
                        Math.abs(this.selectedTime - slot.time) <= 2
                      }
                      x="${slot.time - 2}" y="${slot.range.min}"
                      width="4" height="${Math.abs(
                        slot.range.max - slot.range.min
                      )}"
                      fill=${serie.color} stroke=${serie.color}
                      rx="3" ry="3"/>
                    <circle class="serie__point__value"
                      stroke=${serie.color} fill=${serie.color} cx="${
                    slot.time
                  }" cy="${slot.value}" r="2"/>
                  `
                )}
              </g>
            `;
            })}
            ${this.selectedTime &&
            svg`
            <g class="selection">
              <line class="selection__time" x1="${
                this.selectedTime
              }" y1="${MARGIN}" x2="${this.selectedTime}" y2="${
              this.clientHeight - MARGIN
            }"/>
              ${this.selectedValues.map((selectedValue, i) => {
                return selectedValue !== null
                  ? svg`
                    <g class="selection__point">
                      <g class="selection__point__range">
                        <line class="selection__point__range__min" stroke="${
                          this.series[i].color
                        }" x1="${0}" y1="${selectedValue.range.min}" x2="${
                      this.clientWidth
                    }" y2="${selectedValue.range.min}"/>
                        <line class="selection__point__range__max" stroke="${
                          this.series[i].color
                        }" x1="${0}" y1="${selectedValue.range.max}" x2="${
                      this.clientWidth
                    }" y2="${selectedValue.range.max}"/>
                      </g>
                      <circle class="selection__point__value" stroke-width="2" stroke=${
                        this.series[i].color
                      } fill="transparent" cx="${this.selectedTime}" cy="${
                      selectedValue.value
                    }" r="3"/>
                    </g>
                  `
                  : svg``;
              })}
            </g>
          `}
          </svg>
          <style>
            :host {
              display: block;
            }

            .serie__path {
              fill: transparent;
              stroke-width: 2;
              transition: 200ms all ease-in;
            }

            .serie__point__range {
              stroke-opacity: 0.6;
              fill-opacity: 0.4;
              transition: 200ms height ease-in;
            }

            .serie__point__range[highlight] {
              fill-opacity: 1;
            }

            .serie__point__bar {
              stroke-opacity: 0.4;
              stroke-width: 20;
              transition: 200ms height ease-in;
            }

            .selection__time {
              stroke-opacity: var(--lit-line-selected-time--opacity, 0.8);
              stroke-width: var(--lit-line-selected-time--width, 2);
              stroke: var(--lit-line-selected-time--color, black);
            }

            .selection__point__range__min {
              stroke-opacity: var(--lit-line-selected-value-min--opacity, 0.3);
              stroke-width: var(--lit-line-selected-value-min--width, 1);
            }

            .selection__point__range__max {
              stroke-opacity: var(--lit-line-selected-value-max--opacity, 0.3);
              stroke-width: var(--lit-line-selected-value-max--width, 1);
            }

            .selection__point__range__value {
              stroke-opacity: var(--lit-line-selected-value--opacity, 0.8);
              stroke-width: var(--lit-line-selected-value--width, 1);
            }
          </style>
        `,
        this.shadowRoot
      );
  }
}

window.customElements.define("lit-line", LitLine);
