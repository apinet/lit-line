/**
 * @license
 * Copyright (c) 2020, Adrien Pinet
 * Released under the MIT license
 */

import {
  Point,
  sortPoints,
  getTimeRange,
  getValueRange,
  scalePoints,
} from "../src/timeshift";

describe("[timeshift] sortPoints", () => {
  describe("when empty list", () => {
    it("returns an empty list", () => {
      const input: Point[] = [];
      const output = sortPoints(input);
      expect(output.length).toEqual(0);
    });
  });

  describe("when single point", () => {
    it("returns same", () => {
      const output = sortPoints([
        { time: 2, value: 0 },
        { time: 1, value: 1 },
      ]);
      expect(output.length).toEqual(2);
      expect(output[0].time).toEqual(1);
      expect(output[0].value).toEqual(1);
      expect(output[1].time).toEqual(2);
      expect(output[1].value).toEqual(0);
    });
  });
});

describe("[timeshift] getTimeRange", () => {
  describe("when empty list", () => {
    it("throws an exception", () => {
      expect(() => getTimeRange([])).toThrowError(
        /sortedPoints must not be empty/
      );
    });
  });

  describe("when a sorted list is provided", () => {
    it("returns a time range", () => {
      const output = getTimeRange([
        { time: -1, value: 0 },
        { time: 10, value: 1 },
      ]);
      expect(output.min).toEqual(-1);
      expect(output.max).toEqual(10);
    });
  });
});

describe("timeshift.getValueRange", () => {
  describe("when empty list", () => {
    it("throws an exception", () => {
      expect(() => getValueRange([])).toThrowError(/points must not be empty/);
    });
  });

  describe("when a sorted list is provided", () => {
    it("returns a time range", () => {
      const output = getValueRange([
        { time: -1, value: 0 },
        { time: -1, value: 10 },
        { time: 10, value: 1 },
      ]);
      expect(output.min).toEqual(0);
      expect(output.max).toEqual(10);
    });
  });
});

describe("timeshift.scalePoints", () => {
  describe("when empty list", () => {
    it("returns an empty list", () => {
      const output = scalePoints(
        [],
        { min: 0, max: 10 },
        { min: 0, max: 100 },
        100,
        50,
        4
      );
      expect(output.length).toEqual(0);
    });
  });

  describe("when a points are provided", () => {
    it("returns a scaled point list", () => {
      const output = scalePoints(
        [
          { time: 0, value: 10 },
          { time: 5, value: 10 },
          { time: 10, value: 100 },
        ],
        { min: 0, max: 10 },
        { min: 0, max: 100 },
        100,
        50,
        4
      );

      expect(output[0]).toEqual({ time: 4, value: 41.8 });
      expect(output[1]).toEqual({ time: 50, value: 41.8 });
      expect(output[2]).toEqual({ time: 96, value: 4 });
    });
  });
});
