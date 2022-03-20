/**
 * @license
 * Copyright (c) 2022, Adrien Pinet
 * Released under the MIT license
 */

import { LitLine } from "./element";

declare global {
  interface HTMLElementTagNameMap {
    "lit-line": LitLine;
  }
}

window.customElements.define("lit-line", LitLine);
