/**
 * @license
 * Copyright (c) 2020, Adrien Pinet
 * Released under the MIT license
 */

 export interface Point {
  time: number
  value: number
}

export interface Slot extends Point{
  range: Range
  hits: number
}

export interface Range {
  min: number
  max: number
}

export interface SelectedValue {
  value: number
  range: Range
}


export const sortPoints = function(points: Point[]) {
  return points.sort((a, b) => {
    if(a.time < b.time) return -1;
    if(a.time > b.time) return 1;

    return 0;
  });
}

export const getTimeRange = function(sortedPoints: Point[]): Range {
  if(sortedPoints.length === 0) {
    throw new Error('sortedPoints must not be empty');
  }

  return {
    min: sortedPoints[0].time,
    max: sortedPoints[sortedPoints.length - 1].time
  }
}

export const getValueRange = function(points: Point[]): Range {
  if(points.length === 0) {
    throw new Error('points must not be empty');
  }

  const values = points.map(point => point.value);

  return {
    min: Math.min(...values),
    max: Math.max(...values)
  };
}

export const scalePoints = function(points: Point[], timeRange: Range, valueRange: Range, width: number, height: number, margin: number) {
  return points.map(point => {
    return {
      time: scale(point.time, timeRange, {min: margin, max: width - margin}),
      value: scale(point.value, valueRange, {min: height - margin, max: margin})
    };
  });
}

export const reducePoints = function(points: Point[], minGap: number) {
  const slots: Slot[] = [];

  if(points.length === 0) {
    return slots;
  }

  let currentSlot: Slot = pointToSlot(points[0]);
  
  for(let i = 1 ; i < points.length ; i++) {
    const slot = pointToSlot(points[i]);

    if(slot.time - currentSlot.time < minGap) {
      currentSlot = mergeSlots(currentSlot, slot);
    } else {
      slots.push(currentSlot);
      currentSlot = slot;
    }

  }

  slots.push(currentSlot);
  return slots;
}

export const mergeRanges = function(...ranges: Range[]) {
  return {
    min: Math.min(...ranges.map(range => range.min)),
    max: Math.max(...ranges.map(range => range.max))
  }
}

export const pointsToSvgPath = function(points: Point[]) {
  let path = '';

  points.forEach((point, index) => {
    path = index === 0 ?
      `M ${point.time},${point.value}` :
      `${path} L ${point.time},${point.value}`;
  });

  return path;
}

export const getValueOverTime = function(slots: Slot[], time: number) {
  const interval = findTimeInterval(slots, time);
      
  if(interval === null) {
    return null;
  }

  const p1 = interval[0];
  const p2 = interval[1];

  return {
    value: scale(time, {min: p1.time, max: p2.time}, {min: p1.value, max: p2.value}),
    range: {
      min: scale(time, {min: p1.time, max: p2.time}, {min: p1.range.min, max: p2.range.min}),
      max: scale(time, {min: p1.time, max: p2.time}, {min: p1.range.max, max: p2.range.max})
    }
  };
}

const findTimeInterval = function(slots: Slot[], time: number) {
  let min = 0;
  let max = slots.length - 1;
  let mid = Math.floor((min + max) / 2);

  if(time < slots[min].time || time > slots[max].time) {
    return null;
  }

  while(max - min > 1) {
    if(time < slots[mid].time) {
      max = mid;
      mid = Math.floor((min + mid) / 2);
    } else {
      min = mid;
      mid = Math.floor((max + mid) / 2);
    }
  }

  return [slots[min], slots[max]];
}

export const scale = function(value: number, from: Range, to: Range) {
  if(from.max === from.min) {
    return (to.max + to.min) / 2;
  }

  const rate = (value - from.min) / (from.max - from.min);
  return rate * (to.max - to.min) + to.min;
}

const pointToSlot = function(point: Point) {
  return {
    time: point.time,
    value: point.value,
    range: {min: point.value, max: point.value},
    hits: 1
  };
}

const mergeSlots = function(first: Slot, second: Slot) {
  return {
    time: (first.time * first.hits + second.time * second.hits) / (first.hits + second.hits),
    value: (first.value * first.hits + second.value * second.hits) / (first.hits + second.hits),
    range: {
      min: Math.min(first.range.min, second.range.min),
      max: Math.max(first.range.max, second.range.max)
    },
    hits: first.hits + second.hits
  };
}

