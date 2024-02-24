/**
 * @license
 * Copyright (c) 2024, Adrien Pinet
 * Released under the MIT license
 */

import { render, html } from "lit-html";

import "../src/lit-line.js";
import { LitLine, SelectionEventDetail, Serie } from "../src/lit-line.js";

export const CHART_MARGIN = 4;
export const CHART_WIDTH = 500;
export const CHART_HEIGHT = 500;

/**
 * wait unit lit-line:selected event is fired.
 * @throws {string} if nothing is fired for {timeout}
 * @param {LitLine} litline: a Litline component
 * @param {number} timeout: max delay to wait
 */
export const listenSelectedEvent = async function (
  litLine: LitLine,
  timeout: number = 1000
): Promise<SelectionEventDetail | null> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject("event lit-line:selected should be fired");
    }, timeout);

    const callback = (e: any) => {
      clearTimeout(timeoutId);
      litLine.removeEventListener("lit-line:selected", callback);
      resolve(e.detail);
    };

    litLine.addEventListener("lit-line:selected", callback);
  });
};

export interface MouseEvent {
  x: number;
  y: number;
}

export const fireMouseEvent = function (litLine: LitLine, mouseEvent: MouseEvent) {
  const event = new MouseEvent("mousemove", {
    bubbles: true,
    clientX: mouseEvent.x,
    clientY: mouseEvent.y,
  });

  litLine.dispatchEvent(event);
};

/**
 * Creates an lit-line element with the provided data series.
 * @param {Serie} data: a list of Serie to render
 */
export const createLitLineSvg = async function (
  data: Serie[],
  width: number = CHART_WIDTH,
  height: number = CHART_HEIGHT
) {
  // to prevent extra calculation for mouse events
  document.body.style.margin = "0";
  document.body.style.padding = "0";

  await customElements.whenDefined("lit-line");
  render(html``, document.body); // we cleanup body between tests
  render(html`<lit-line .data=${data}></lit-line>`, document.body);
  const elements = document.body.getElementsByTagName("lit-line");

  if (elements.length === 0) {
    throw new Error("no lit-line element!");
  }
  const litLine = <LitLine>elements[0];

  litLine.style.width = `${width}px`;
  litLine.style.height = `${height}px`;

  litLine.adjust(); // we make sure the svg box fits its container
  return litLine;
};

export const getSvg = function (litLine: LitLine) {
  return litLine.shadowRoot?.querySelector("svg") || undefined;
};

export const getSeries = function (litLine: LitLine) {
  return getSvg(litLine)?.querySelectorAll(".serie");
};

export const getSerie = function (litLine: LitLine, serieId: number) {
  const series = getSeries(litLine);
  return !series || serieId >= series.length ? undefined : series[serieId];
};

export const getSeriePath = function (litLine: LitLine, serieId: number) {
  const serie = getSerie(litLine, serieId);
  return serie?.querySelector(".serie__path") || undefined;
};

export const getSerieBars = function (litLine: LitLine, serieId: number) {
  return getSerie(litLine, serieId)?.querySelectorAll(".serie__point__bar");
};

export const getSerieBar = function (litLine: LitLine, serieId: number, barId: number) {
  const bars = getSerieBars(litLine, serieId);
  return !bars || barId >= bars.length ? undefined : bars[barId];
};

export const getSeriePoints = function (litLine: LitLine, serieId: number) {
  return getSerie(litLine, serieId)?.querySelectorAll(".serie__point__value");
};

export const getSeriePoint = function (litLine: LitLine, serieId: number, pointId: number) {
  const points = getSeriePoints(litLine, serieId);
  return !points || pointId >= points.length ? undefined : points[pointId];
};

export const getSerieRanges = function (litLine: LitLine, serieId: number) {
  return getSerie(litLine, serieId)?.querySelectorAll(".serie__point__range");
};

export const getSerieRange = function (litLine: LitLine, serieId: number, rangeId: number) {
  const ranges = getSerieRanges(litLine, serieId);
  return !ranges || rangeId >= ranges.length ? undefined : ranges[rangeId];
};
