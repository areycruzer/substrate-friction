// Dither Effect — Originkit (JavaScript translation)
"use client";

import * as React from "react";
import { useEffect, useRef, useState, useMemo, forwardRef, memo } from "react";
import { useInView } from "framer-motion";

/* ================= vendored @paper-design/shaders (core) ================= */

function getShaderColorFromString(colorString) {
  if (Array.isArray(colorString)) {
    if (colorString.length === 4) return colorString;
    if (colorString.length === 3) return [...colorString, 1];
    return fallbackColor;
  }
  if (typeof colorString !== "string") {
    return fallbackColor;
  }
  let r, g, b, a = 1;
  if (colorString.startsWith("#")) {
    [r, g, b, a] = hexToRgba(colorString);
  } else if (colorString.startsWith("rgb")) {
    [r, g, b, a] = parseRgba(colorString);
  } else if (colorString.startsWith("hsl")) {
    [r, g, b, a] = hslaToRgba(parseHsla(colorString));
  } else {
    console.error("Unsupported color format", colorString);
    return fallbackColor;
  }
  return [clamp(r, 0, 1), clamp(g, 0, 1), clamp(b, 0, 1), clamp(a, 0, 1)];
}

function hexToRgba(hex) {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }
  if (hex.length === 6) {
    hex = hex + "ff";
  }
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const a = parseInt(hex.slice(6, 8), 16) / 255;
  return [r, g, b, a];
}

function parseRgba(rgba) {
  const match = rgba.match(
    /^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([0-9.]+))?\s*\)$/i
  );
  if (!match) return [0, 0, 0, 1];
  return [
    parseInt(match[1] ?? "0") / 255,
    parseInt(match[2] ?? "0") / 255,
    parseInt(match[3] ?? "0") / 255,
    match[4] === undefined ? 1 : parseFloat(match[4]),
  ];
}

function parseHsla(hsla) {
  const match = hsla.match(
    /^hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([0-9.]+))?\s*\)$/i
  );
  if (!match) return [0, 0, 0, 1];
  return [
    parseInt(match[1] ?? "0"),
    parseInt(match[2] ?? "0"),
    parseInt(match[3] ?? "0"),
    match[4] === undefined ? 1 : parseFloat(match[4]),
  ];
}

function hslaToRgba(hsla) {
  const [h, s, l, a] = hsla;
  const hDecimal = h / 360;
  const sDecimal = s / 100;
  const lDecimal = l / 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = lDecimal;
  } else {
    const hue2rgb = (p2, q2, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p2 + (q2 - p2) * 6 * t;
      if (t < 1 / 2) return q2;
      if (t < 2 / 3) return p2 + (q2 - p2) * (2 / 3 - t) * 6;
      return p2;
    };
    const q =
      lDecimal < 0.5
        ? lDecimal * (1 + sDecimal)
        : lDecimal + sDecimal - lDecimal * sDecimal;
    const p = 2 * lDecimal - q;
    r = hue2rgb(p, q, hDecimal + 1 / 3);
    g = hue2rgb(p, q, hDecimal);
    b = hue2rgb(p, q, hDecimal - 1 / 3);
  }
  return [r, g, b, a];
}

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
const fallbackColor = [0, 0, 0, 1];

const ShaderFitOptions = { none: 0, contain: 1, cover: 2 };

const declarePI = `
#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846
`;

const proceduralHash11 = `
  float hash11(float p) {
    p = fract(p * 0.3183099) + 0.1;
    p *= p + 19.19;
    return fract(p * p);
  }
`;

const proceduralHash21 = `
  float hash21(vec2 p) {
    p = fract(p * vec2(0.3183099, 0.3678794)) + 0.1;
    p += dot(p, p + 19.19);
    return fract(p.x * p.y);
  }
`;

const simplexNoise = `
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
      dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`;

const vertexShaderSource = `#version 300 es
precision mediump float;

layout(location = 0) in vec4 a_position;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_imageAspectRatio;
uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;
uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;

out vec2 v_objectUV;
out vec2 v_objectBoxSize;
out vec2 v_responsiveUV;
out vec2 v_responsiveBoxGivenSize;
out vec2 v_patternUV;
out vec2 v_patternBoxSize;
out vec2 v_imageUV;

vec3 getBoxSize(float boxRatio, vec2 givenBoxSize) {
  vec2 box = vec2(0.);
  box.x = boxRatio * min(givenBoxSize.x / boxRatio, givenBoxSize.y);
  float noFitBoxWidth = box.x;
  if (u_fit == 1.) {
    box.x = boxRatio * min(u_resolution.x / boxRatio, u_resolution.y);
  } else if (u_fit == 2.) {
    box.x = boxRatio * max(u_resolution.x / boxRatio, u_resolution.y);
  }
  box.y = box.x / boxRatio;
  return vec3(box, noFitBoxWidth);
}

void main() {
  gl_Position = a_position;

  vec2 uv = gl_Position.xy * .5;
  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
  givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
  float r = u_rotation * 3.14159265358979323846 / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);

  float fixedRatio = 1.;
  vec2 fixedRatioBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );

  v_objectBoxSize = getBoxSize(fixedRatio, fixedRatioBoxGivenSize).xy;
  vec2 objectWorldScale = u_resolution.xy / v_objectBoxSize;

  v_objectUV = uv;
  v_objectUV *= objectWorldScale;
  v_objectUV += boxOrigin * (objectWorldScale - 1.);
  v_objectUV += graphicOffset;
  v_objectUV /= u_scale;
  v_objectUV = graphicRotation * v_objectUV;

  v_responsiveBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  float responsiveRatio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
  vec2 responsiveBoxSize = getBoxSize(responsiveRatio, v_responsiveBoxGivenSize).xy;
  vec2 responsiveBoxScale = u_resolution.xy / responsiveBoxSize;

  v_responsiveUV = uv;
  v_responsiveUV *= responsiveBoxScale;
  v_responsiveUV += boxOrigin * (responsiveBoxScale - 1.);
  v_responsiveUV += graphicOffset;
  v_responsiveUV /= u_scale;
  v_responsiveUV.x *= responsiveRatio;
  v_responsiveUV = graphicRotation * v_responsiveUV;
  v_responsiveUV.x /= responsiveRatio;

  float patternBoxRatio = givenBoxSize.x / givenBoxSize.y;
  vec2 patternBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  patternBoxRatio = patternBoxGivenSize.x / patternBoxGivenSize.y;

  vec3 boxSizeData = getBoxSize(patternBoxRatio, patternBoxGivenSize);
  v_patternBoxSize = boxSizeData.xy;
  float patternBoxNoFitBoxWidth = boxSizeData.z;
  vec2 patternBoxScale = u_resolution.xy / v_patternBoxSize;

  v_patternUV = uv;
  v_patternUV += graphicOffset / patternBoxScale;
  v_patternUV += boxOrigin;
  v_patternUV -= boxOrigin / patternBoxScale;
  v_patternUV *= u_resolution.xy;
  v_patternUV /= u_pixelRatio;
  if (u_fit > 0.) {
    v_patternUV *= (patternBoxNoFitBoxWidth / v_patternBoxSize.x);
  }
  v_patternUV /= u_scale;
  v_patternUV = graphicRotation * v_patternUV;
  v_patternUV += boxOrigin / patternBoxScale;
  v_patternUV -= boxOrigin;
  v_patternUV *= .01;

  vec2 imageBoxSize;
  if (u_fit == 1.) {
    imageBoxSize.x = min(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else if (u_fit == 2.) {
    imageBoxSize.x = max(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else {
    imageBoxSize.x = min(10.0, 10.0 / u_imageAspectRatio * u_imageAspectRatio);
  }
  imageBoxSize.y = imageBoxSize.x / u_imageAspectRatio;
  vec2 imageBoxScale = u_resolution.xy / imageBoxSize;

  v_imageUV = uv;
  v_imageUV *= imageBoxScale;
  v_imageUV += boxOrigin * (imageBoxScale - 1.);
  v_imageUV += graphicOffset;
  v_imageUV /= u_scale;
  v_imageUV.x *= u_imageAspectRatio;
  v_imageUV = graphicRotation * v_imageUV;
  v_imageUV.x /= u_imageAspectRatio;

  v_imageUV += .5;
  v_imageUV.y = 1. - v_imageUV.y;
}`;

const DEFAULT_MAX_PIXEL_COUNT = 1920 * 1080 * 4;

class ShaderMountVanilla {
  parentElement;
  canvasElement;
  gl;
  program = null;
  uniformLocations = {};
  fragmentShader;
  rafId = null;
  lastRenderTime = 0;
  currentFrame = 0;
  speed = 0;
  currentSpeed = 0;
  providedUniforms;
  hasBeenDisposed = false;
  resolutionChanged = true;
  minPixelRatio;
  maxPixelCount;
  isSafari = isSafari();
  uniformCache = {};
  ownerDocument;
  renderScale = 1;
  parentWidth = 0;
  parentHeight = 0;
  parentDevicePixelWidth = 0;
  parentDevicePixelHeight = 0;
  devicePixelsSupported = false;
  resizeObserver = null;

  constructor(
    parentElement,
    fragmentShader,
    uniforms,
    webGlContextAttributes,
    speed = 0,
    frame = 0,
    minPixelRatio = 2,
    maxPixelCount = DEFAULT_MAX_PIXEL_COUNT
  ) {
    if (!(parentElement && parentElement.nodeType === 1)) {
      throw new Error("Shader mount: parent element must be an HTMLElement");
    }
    this.parentElement = parentElement;
    this.ownerDocument = parentElement.ownerDocument;

    if (!this.ownerDocument.querySelector("style[data-dither-shader]")) {
      const styleElement = this.ownerDocument.createElement("style");
      styleElement.innerHTML = defaultStyle;
      styleElement.setAttribute("data-dither-shader", "");
      this.ownerDocument.head.prepend(styleElement);
    }

    const canvasElement = this.ownerDocument.createElement("canvas");
    this.canvasElement = canvasElement;
    this.parentElement.prepend(canvasElement);
    this.fragmentShader = fragmentShader;
    this.providedUniforms = uniforms;
    this.currentFrame = frame;
    this.minPixelRatio = minPixelRatio;
    this.maxPixelCount = maxPixelCount;

    const gl = canvasElement.getContext("webgl2", webGlContextAttributes);
    if (!gl) {
      throw new Error("Shader mount: WebGL is not supported in this browser");
    }
    this.gl = gl;

    this.initProgram();
    this.setupPositionAttribute();
    this.setupUniforms();
    this.setUniformValues(this.providedUniforms);
    this.setupResizeObserver();
    visualViewport?.addEventListener("resize", this.handleVisualViewportChange);
    this.setSpeed(speed);
    this.parentElement.setAttribute("data-dither-shader", "");
    this.parentElement.paperShaderMount = this;
    this.ownerDocument.addEventListener(
      "visibilitychange",
      this.handleDocumentVisibilityChange
    );
  }

  initProgram = () => {
    const program = createProgram(this.gl, vertexShaderSource, this.fragmentShader);
    if (!program) return;
    this.program = program;
  };

  setupPositionAttribute = () => {
    const positionAttributeLocation = this.gl.getAttribLocation(this.program, "a_position");
    const positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
    this.gl.enableVertexAttribArray(positionAttributeLocation);
    this.gl.vertexAttribPointer(positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
  };

  setupUniforms = () => {
    const uniformLocations = {
      u_time: this.gl.getUniformLocation(this.program, "u_time"),
      u_pixelRatio: this.gl.getUniformLocation(this.program, "u_pixelRatio"),
      u_resolution: this.gl.getUniformLocation(this.program, "u_resolution"),
    };
    Object.keys(this.providedUniforms).forEach((key) => {
      uniformLocations[key] = this.gl.getUniformLocation(this.program, key);
    });
    this.uniformLocations = uniformLocations;
  };

  resizeObserverCallback = ([entry]) => {
    if (entry?.borderBoxSize[0]) {
      const physicalPixelSize = entry.devicePixelContentBoxSize?.[0];
      if (physicalPixelSize !== undefined) {
        this.devicePixelsSupported = true;
        this.parentDevicePixelWidth = physicalPixelSize.inlineSize;
        this.parentDevicePixelHeight = physicalPixelSize.blockSize;
      }
      this.parentWidth = entry.borderBoxSize[0].inlineSize;
      this.parentHeight = entry.borderBoxSize[0].blockSize;
    }
    this.handleResize();
  };

  setupResizeObserver = () => {
    this.resizeObserver = new ResizeObserver(this.resizeObserverCallback);
    this.resizeObserver.observe(this.parentElement);
  };

  handleVisualViewportChange = () => {
    this.resizeObserver?.disconnect();
    this.setupResizeObserver();
  };

  handleResize = () => {
    let targetPixelWidth = 0;
    let targetPixelHeight = 0;
    const dpr = Math.max(1, window.devicePixelRatio);
    const pinchZoom = visualViewport?.scale ?? 1;
    if (this.devicePixelsSupported) {
      const scaleToMeetMinPixelRatio = Math.max(1, this.minPixelRatio / dpr);
      targetPixelWidth = this.parentDevicePixelWidth * scaleToMeetMinPixelRatio * pinchZoom;
      targetPixelHeight = this.parentDevicePixelHeight * scaleToMeetMinPixelRatio * pinchZoom;
    } else {
      let targetRenderScale = Math.max(dpr, this.minPixelRatio) * pinchZoom;
      if (this.isSafari) {
        const zoomLevel = bestGuessBrowserZoom(this.ownerDocument);
        targetRenderScale *= Math.max(1, zoomLevel);
      }
      targetPixelWidth = Math.round(this.parentWidth) * targetRenderScale;
      targetPixelHeight = Math.round(this.parentHeight) * targetRenderScale;
    }
    const maxPixelCountHeadroom =
      Math.sqrt(this.maxPixelCount) / Math.sqrt(targetPixelWidth * targetPixelHeight);
    const scaleToMeetMaxPixelCount = Math.min(1, maxPixelCountHeadroom);
    const newWidth = Math.round(targetPixelWidth * scaleToMeetMaxPixelCount);
    const newHeight = Math.round(targetPixelHeight * scaleToMeetMaxPixelCount);
    const newRenderScale = newWidth / Math.round(this.parentWidth);
    if (
      this.canvasElement.width !== newWidth ||
      this.canvasElement.height !== newHeight ||
      this.renderScale !== newRenderScale
    ) {
      this.renderScale = newRenderScale;
      this.canvasElement.width = newWidth;
      this.canvasElement.height = newHeight;
      this.resolutionChanged = true;
      this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
      this.render(performance.now());
    }
  };

  render = (currentTime) => {
    if (this.hasBeenDisposed) return;
    if (this.program === null) {
      console.warn("Tried to render before program or gl was initialized");
      return;
    }
    const dt = currentTime - this.lastRenderTime;
    this.lastRenderTime = currentTime;
    if (this.currentSpeed !== 0) {
      this.currentFrame += dt * this.currentSpeed;
    }
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.useProgram(this.program);
    this.gl.uniform1f(this.uniformLocations.u_time, this.currentFrame * 0.001);
    if (this.resolutionChanged) {
      this.gl.uniform2f(
        this.uniformLocations.u_resolution,
        this.gl.canvas.width,
        this.gl.canvas.height
      );
      this.gl.uniform1f(this.uniformLocations.u_pixelRatio, this.renderScale);
      this.resolutionChanged = false;
    }
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    if (this.currentSpeed !== 0) {
      this.requestRender();
    } else {
      this.rafId = null;
    }
  };

  requestRender = () => {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
    this.rafId = requestAnimationFrame(this.render);
  };

  areUniformValuesEqual = (a, b) => {
    if (a === b) return true;
    if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
      return a.every((val, i) => this.areUniformValuesEqual(val, b[i]));
    }
    return false;
  };

  setUniformValues = (updatedUniforms) => {
    this.gl.useProgram(this.program);
    Object.entries(updatedUniforms).forEach(([key, value]) => {
      if (this.areUniformValuesEqual(this.uniformCache[key], value)) return;
      this.uniformCache[key] = value;
      const location = this.uniformLocations[key];
      if (!location) {
        return;
      }
      if (Array.isArray(value)) {
        let flatArray = null;
        let valueLength = null;
        if (value[0] !== undefined && Array.isArray(value[0])) {
          const firstChildLength = value[0].length;
          if (value.every((arr) => arr.length === firstChildLength)) {
            flatArray = value.flat();
            valueLength = firstChildLength;
          } else {
            console.warn(`All child arrays must be the same length for ${key}`);
            return;
          }
        } else {
          flatArray = value;
          valueLength = flatArray.length;
        }
        switch (valueLength) {
          case 2:
            this.gl.uniform2fv(location, flatArray);
            break;
          case 3:
            this.gl.uniform3fv(location, flatArray);
            break;
          case 4:
            this.gl.uniform4fv(location, flatArray);
            break;
          default:
            console.warn(`Unsupported uniform array length: ${valueLength}`);
        }
      } else if (typeof value === "number") {
        this.gl.uniform1f(location, value);
      } else if (typeof value === "boolean") {
        this.gl.uniform1i(location, value ? 1 : 0);
      } else {
        console.warn(`Unsupported uniform type for ${key}: ${typeof value}`);
      }
    });
  };

  setFrame = (newFrame) => {
    this.currentFrame = newFrame;
    this.lastRenderTime = performance.now();
    this.render(performance.now());
  };

  setSpeed = (newSpeed = 1) => {
    this.speed = newSpeed;
    this.setCurrentSpeed(this.ownerDocument.hidden ? 0 : newSpeed);
  };

  setCurrentSpeed = (newSpeed) => {
    this.currentSpeed = newSpeed;
    if (this.rafId === null && newSpeed !== 0) {
      this.lastRenderTime = performance.now();
      this.rafId = requestAnimationFrame(this.render);
    }
    if (this.rafId !== null && newSpeed === 0) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  };

  setMaxPixelCount = (newMaxPixelCount = DEFAULT_MAX_PIXEL_COUNT) => {
    this.maxPixelCount = newMaxPixelCount;
    this.handleResize();
  };

  setMinPixelRatio = (newMinPixelRatio = 2) => {
    this.minPixelRatio = newMinPixelRatio;
    this.handleResize();
  };

  setUniforms = (newUniforms) => {
    this.setUniformValues(newUniforms);
    this.providedUniforms = { ...this.providedUniforms, ...newUniforms };
    this.render(performance.now());
  };

  handleDocumentVisibilityChange = () => {
    this.setCurrentSpeed(this.ownerDocument.hidden ? 0 : this.speed);
  };

  dispose = () => {
    this.hasBeenDisposed = true;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.gl && this.program) {
      this.gl.deleteProgram(this.program);
      this.program = null;
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
      this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
      this.gl.getError();
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    visualViewport?.removeEventListener("resize", this.handleVisualViewportChange);
    this.ownerDocument.removeEventListener(
      "visibilitychange",
      this.handleDocumentVisibilityChange
    );
    this.uniformLocations = {};
    this.canvasElement.remove();
    delete this.parentElement.paperShaderMount;
  };
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vertexShaderSource2, fragmentShaderSource) {
  const format = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT);
  const precision = format ? format.precision : null;
  if (precision && precision < 23) {
    vertexShaderSource2 = vertexShaderSource2.replace(
      /precision\s+(lowp|mediump)\s+float;/g,
      "precision highp float;"
    );
    fragmentShaderSource = fragmentShaderSource
      .replace(/precision\s+(lowp|mediump)\s+float/g, "precision highp float")
      .replace(/\b(uniform|varying|attribute)\s+(lowp|mediump)\s+(\w+)/g, "$1 highp $3");
  }
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource2);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  if (!vertexShader || !fragmentShader) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }
  gl.detachShader(program, vertexShader);
  gl.detachShader(program, fragmentShader);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  return program;
}

const defaultStyle = `
  [data-dither-shader] {
    isolation: isolate;
    position: relative;
  }
  [data-dither-shader] canvas {
    contain: strict;
    display: block;
    position: absolute;
    inset: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
    border-radius: inherit;
  }
`;

function isSafari() {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes("safari") && !ua.includes("chrome") && !ua.includes("android");
}

function bestGuessBrowserZoom(doc) {
  const viewportScale = visualViewport?.scale ?? 1;
  const viewportWidth = visualViewport?.width ?? window.innerWidth;
  const scrollbarWidth = window.innerWidth - doc.documentElement.clientWidth;
  const innerWidth = viewportScale * viewportWidth + scrollbarWidth;
  const ratio = window.outerWidth / innerWidth;
  const zoomPercentageRounded = Math.round(100 * ratio);
  if (zoomPercentageRounded % 5 === 0) {
    return zoomPercentageRounded / 100;
  }
  if (zoomPercentageRounded === 33) return 1 / 3;
  if (zoomPercentageRounded === 67) return 2 / 3;
  if (zoomPercentageRounded === 133) return 4 / 3;
  return ratio;
}

/* Dithering fragment shader */
const MAX_DITHER_COLORS = 5;
const ditheringFragmentShader = `#version 300 es
precision mediump float;

uniform float u_time;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;
uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;

uniform float u_pxSize;
uniform vec4 u_colorBack;
#define MAX_DITHER_COLORS ${MAX_DITHER_COLORS}
uniform vec4 u_colors[MAX_DITHER_COLORS];
uniform float u_colorCount;
uniform float u_shape;
uniform float u_type;
uniform float u_density;
uniform float u_pointerX;
uniform float u_pointerY;
uniform float u_holeRadius;
uniform float u_holeAmount;

out vec4 fragColor;

${simplexNoise}
${declarePI}
${proceduralHash11}
${proceduralHash21}

float getSimplexNoise(vec2 uv, float t) {
  float noise = .5 * snoise(uv - vec2(0., .3 * t));
  noise += .5 * snoise(2. * uv + vec2(0., .32 * t));

  return noise;
}

const int bayer2x2[4] = int[4](0, 2, 3, 1);
const int bayer4x4[16] = int[16](
0, 8, 2, 10,
12, 4, 14, 6,
3, 11, 1, 9,
15, 7, 13, 5
);

const int bayer8x8[64] = int[64](
0, 32, 8, 40, 2, 34, 10, 42,
48, 16, 56, 24, 50, 18, 58, 26,
12, 44, 4, 36, 14, 46, 6, 38,
60, 28, 52, 20, 62, 30, 54, 22,
3, 35, 11, 43, 1, 33, 9, 41,
51, 19, 59, 27, 49, 17, 57, 25,
15, 47, 7, 39, 13, 45, 5, 37,
63, 31, 55, 23, 61, 29, 53, 21
);

float getBayerValue(vec2 uv, int size) {
  ivec2 pos = ivec2(fract(uv / float(size)) * float(size));
  int index = pos.y * size + pos.x;

  if (size == 2) {
    return float(bayer2x2[index]) / 4.0;
  } else if (size == 4) {
    return float(bayer4x4[index]) / 16.0;
  } else if (size == 8) {
    return float(bayer8x8[index]) / 64.0;
  }
  return 0.0;
}

void main() {
  float t = .5 * u_time;

  float pxSize = u_pxSize * u_pixelRatio;

  vec2 matrixUV = (gl_FragCoord.xy - .5 * u_resolution) / pxSize;

  vec2 fragCoord = gl_FragCoord.xy;
  float holeFade = 1.;
  float holeR = u_holeRadius * u_pixelRatio;
  if (u_holeAmount > 0.001 && holeR > 0.) {
    vec2 pointer = vec2(u_pointerX, u_resolution.y / u_pixelRatio - u_pointerY) * u_pixelRatio;
    vec2 toPointer = fragCoord - pointer;
    float dist = length(toPointer);
    if (dist < holeR) {
      float k = dist / holeR;
      float falloff = 1. - smoothstep(.35, 1., k);
      float push = holeR * .45 * falloff * u_holeAmount;
      float src = max(dist - push, 0.);
      fragCoord = pointer + toPointer / max(dist, 1e-4) * src;
      holeFade = smoothstep(0., 1., clamp(dist / max(push, 1e-4), 0., 1.));
    }
  }

  vec2 pxSizeUV = fragCoord - .5 * u_resolution;
  pxSizeUV /= pxSize;
  vec2 canvasPixelizedUV = (floor(pxSizeUV) + .5) * pxSize;
  vec2 normalizedUV = canvasPixelizedUV / u_resolution;

  vec2 ditheringNoiseUV = canvasPixelizedUV;
  vec2 shapeUV = normalizedUV;

  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
  givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
  float r = u_rotation * PI / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);

  float patternBoxRatio = givenBoxSize.x / givenBoxSize.y;
  vec2 boxSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );

  vec2 patternBoxSize = vec2(0.);
  patternBoxSize.x = patternBoxRatio * min(boxSize.x / patternBoxRatio, boxSize.y);
  float patternWorldNoFitBoxWidth = patternBoxSize.x;
  if (u_fit == 1.) {
    patternBoxSize.x = patternBoxRatio * min(u_resolution.x / patternBoxRatio, u_resolution.y);
  } else if (u_fit == 2.) {
    patternBoxSize.x = patternBoxRatio * max(u_resolution.x / patternBoxRatio, u_resolution.y);
  }
  patternBoxSize.y = patternBoxSize.x / patternBoxRatio;
  vec2 patternWorldScale = u_resolution.xy / patternBoxSize;

  shapeUV += vec2(-u_offsetX, u_offsetY) / patternWorldScale;
  shapeUV += boxOrigin;
  shapeUV -= boxOrigin / patternWorldScale;
  shapeUV *= u_resolution.xy;
  shapeUV /= u_pixelRatio;
  if (u_fit > 0.) {
    shapeUV *= (patternWorldNoFitBoxWidth / patternBoxSize.x);
  }
  shapeUV /= u_scale;
  shapeUV = graphicRotation * shapeUV;
  shapeUV += boxOrigin / patternWorldScale;
  shapeUV -= boxOrigin;
  shapeUV += .5;

  float shape = 0.;
  // Simplex noise shape
  shapeUV *= .001;

  shape = 0.5 + 0.5 * getSimplexNoise(shapeUV, t);
  float lowEdge = mix(.3, -.5, clamp(u_density * 2. - 1., 0., 1.));
  shape = smoothstep(lowEdge, 0.9, shape);
  shape *= clamp(u_density * 2., 0., 1.);

  int type = int(floor(u_type));
  float dithering = 0.0;

  switch (type) {
    case 1: {
      dithering = step(hash21(ditheringNoiseUV), shape);
    } break;
    case 2:
    dithering = getBayerValue(matrixUV, 2);
    break;
    case 3:
    dithering = getBayerValue(matrixUV, 4);
    break;
    default :
    dithering = getBayerValue(matrixUV, 8);
    break;
  }

  dithering -= .5;

  shape *= holeFade;

  float n = max(u_colorCount, 1.);
  float v = clamp(shape, 0., 1.) * n;
  float idx = floor(v);
  float stop = clamp(idx + step(.5, (v - idx) + dithering), 0., n);

  vec4 picked = u_colorBack;
  for (int i = 0; i < MAX_DITHER_COLORS; i++) {
    if (float(i) >= n) break;
    if (stop == float(i + 1)) picked = u_colors[i];
  }

  vec3 fgColor = picked.rgb * picked.a;
  float fgOpacity = picked.a;
  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  float bgOpacity = u_colorBack.a;

  vec3 color = fgColor;
  float opacity = fgOpacity;

  color += bgColor * (1. - opacity);
  opacity += bgOpacity * (1. - opacity);

  fragColor = vec4(color, opacity);
}
`;

const DitheringTypes = { random: 1, "2x2": 2, "4x4": 3, "8x8": 4 };

/* ============== ShaderMount React wrapper ============== */

function useMergeRefs(refs) {
  return React.useMemo(() => {
    return (value) => {
      refs.forEach((ref) => {
        if (ref == null) return;
        if (typeof ref === "function") {
          ref(value);
        } else {
          ref.current = value;
        }
      });
    };
  }, refs);
}

const ShaderMount = forwardRef(function ShaderMountImpl(
  { fragmentShader, uniforms, webGlContextAttributes, speed = 0, frame = 0, minPixelRatio, maxPixelCount, style, ...divProps },
  forwardedRef
) {
  const divRef = useRef(null);
  const shaderMountRef = useRef(null);

  useEffect(() => {
    if (divRef.current && !shaderMountRef.current) {
      shaderMountRef.current = new ShaderMountVanilla(
        divRef.current,
        fragmentShader,
        uniforms,
        webGlContextAttributes,
        speed,
        frame,
        minPixelRatio,
        maxPixelCount
      );
    }
    return () => {
      shaderMountRef.current?.dispose();
      shaderMountRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fragmentShader]);

  useEffect(() => {
    shaderMountRef.current?.setUniforms(uniforms);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniforms]);

  useEffect(() => {
    shaderMountRef.current?.setSpeed(speed);
  }, [speed]);

  useEffect(() => {
    shaderMountRef.current?.setMaxPixelCount(maxPixelCount);
  }, [maxPixelCount]);

  useEffect(() => {
    shaderMountRef.current?.setMinPixelRatio(minPixelRatio);
  }, [minPixelRatio]);

  useEffect(() => {
    shaderMountRef.current?.setFrame(frame);
  }, [frame]);

  const mergedRef = useMergeRefs([divRef, forwardedRef]);

  return <div ref={mergedRef} style={style} {...divProps} />;
});
ShaderMount.displayName = "ShaderMount";

const Dithering = memo(function DitheringImpl({
  speed = 1,
  frame = 0,
  colorBack = "#000000",
  colors = ["#00b2ff"],
  density = 0.5,
  pointerX = 0,
  pointerY = 0,
  holeRadius = 0,
  holeAmount = 0,
  pxSize = 2,
  fit = "cover",
  scale = 0.6,
  rotation = 0,
  originX = 0.5,
  originY = 0.5,
  offsetX = 0,
  offsetY = 0,
  worldWidth = 0,
  worldHeight = 0,
  ...props
}) {
  const paletteList = (colors && colors.length ? colors : ["#00b2ff"]).slice(0, MAX_DITHER_COLORS);
  const paddedPalette = Array.from({ length: MAX_DITHER_COLORS }, (_, i) =>
    getShaderColorFromString(paletteList[Math.min(i, paletteList.length - 1)])
  );

  const uniforms = {
    u_colorBack: getShaderColorFromString(colorBack),
    u_colors: paddedPalette,
    u_colorCount: paletteList.length,
    u_type: DitheringTypes["4x4"],
    u_density: density,
    u_pointerX: pointerX,
    u_pointerY: pointerY,
    u_holeRadius: holeRadius,
    u_holeAmount: holeAmount,
    u_pxSize: pxSize,
    u_fit: ShaderFitOptions[fit],
    u_scale: scale,
    u_rotation: rotation,
    u_offsetX: offsetX,
    u_offsetY: offsetY,
    u_originX: originX,
    u_originY: originY,
    u_worldWidth: worldWidth,
    u_worldHeight: worldHeight,
  };

  return (
    <ShaderMount {...props} speed={speed} frame={frame} fragmentShader={ditheringFragmentShader} uniforms={uniforms} />
  );
});

/* ================= DitherEffect component ================= */

const DEFAULTS = {
  background: "#1D2128",
  colors: ["#249D8F", "#E9C46A", "#E76F51"],
  size: 31,
  density: 60,
  speed: 40,
  scale: 20,
  hover: true,
  hoverRadius: 200,
};

const HOVER_RELEASE_RATE = 0.16;
const FIT = "cover";
const OFFSET_X = 0;
const OFFSET_Y = 0;
const ROTATION = 0;

function clampPanel(n, min, max, fallback) {
  const v = typeof n === "number" ? n : parseFloat(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.min(max, Math.max(min, v));
}

function paletteOf(value) {
  const list = (Array.isArray(value) ? value : DEFAULTS.colors)
    .slice(0, MAX_DITHER_COLORS)
    .filter((c) => typeof c === "string" && c);
  return list.length ? list : DEFAULTS.colors;
}

function settingsFor(p) {
  return {
    background: p?.background ?? DEFAULTS.background,
    colors: paletteOf(p?.colors),
    size: clampPanel(p?.size, 10, 200, DEFAULTS.size) / 10,
    density: clampPanel(p?.density, 0, 100, DEFAULTS.density) / 100,
    hover: p?.hover !== false,
    hoverRadius: clampPanel(p?.hoverRadius, 40, 400, DEFAULTS.hoverRadius),
    speed: clampPanel(p?.speed, 1, 100, DEFAULTS.speed) / 20,
    scale: clampPanel(p?.scale, 1, 200, DEFAULTS.scale) / 100,
  };
}

function __OriginkitBase_DitherEffect(props) {
  const {
    background = DEFAULTS.background,
    colors = DEFAULTS.colors,
    size = DEFAULTS.size,
    density = DEFAULTS.density,
    speed = DEFAULTS.speed,
    scale = DEFAULTS.scale,
    hover = DEFAULTS.hover,
    hoverRadius = DEFAULTS.hoverRadius,
    style,
  } = props;

  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { amount: 0 });

  const S = settingsFor({ background, colors, size, density, speed, scale, hover, hoverRadius });

  const effectiveSpeed = isInView ? S.speed : 0;

  const hoverEnabled = S.hover;
  const liveRef = useRef(S);
  liveRef.current = S;

  useEffect(() => {
    const el = containerRef.current;
    if (!hoverEnabled || !el) return;

    const mouse = { x: 0, y: 0, seen: false, amount: 0 };

    let raf = 0;
    let mount = null;

    const apply = () => {
      if (!mount) {
        mount = el.querySelector("[data-dither-shader]")?.paperShaderMount;
        if (!mount) return;
      }
      mount.setUniformValues({
        u_pointerX: mouse.x,
        u_pointerY: mouse.y,
        u_holeRadius: liveRef.current.hoverRadius,
        u_holeAmount: mouse.seen ? mouse.amount : 0,
      });
      if (mount.currentSpeed === 0) mount.render(performance.now());
    };

    const onMove = (event) => {
      const rect = el.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
      mouse.seen = true;
      mouse.amount = 1;
      if (raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      apply();
    };

    const onLeave = () => {
      if (raf !== 0) return;
      const release = () => {
        mouse.amount -= HOVER_RELEASE_RATE;
        if (mouse.amount <= 0) {
          mouse.amount = 0;
          raf = 0;
        } else {
          raf = requestAnimationFrame(release);
        }
        apply();
      };
      raf = requestAnimationFrame(release);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointercancel", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointercancel", onLeave);
    };
  }, [hoverEnabled]);

  const paletteKey = S.colors.join("|");
  const shaderProps = useMemo(
    () => ({
      colorBack: S.background,
      colors: S.colors,
      pxSize: S.size,
      density: S.density,
      speed: effectiveSpeed,
      scale: S.scale,
      rotation: ROTATION,
      offsetX: OFFSET_X,
      offsetY: OFFSET_Y,
      fit: FIT,
      pointerX: 0,
      pointerY: 0,
      holeRadius: 0,
      holeAmount: 0,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [S.background, paletteKey, S.size, S.density, effectiveSpeed, S.scale, hoverEnabled]
  );

  const containerStyle = useMemo(
    () => ({
      position: "relative",
      width: "100%",
      height: "100%",
      overflow: "hidden",
      ...style,
    }),
    [style]
  );

  const shaderStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);

  return (
    <div ref={containerRef} style={containerStyle}>
      <Dithering {...shaderProps} style={shaderStyle} />
    </div>
  );
}

const __originkitPresetProps = {
  "background": "#B1B1B1",
  "colors": [
    "#ECECEC",
    "#A1A1A0",
    "#AEAEAE"
  ]
};

export default function DitherEffect(props) {
  return <__OriginkitBase_DitherEffect {...(__originkitPresetProps)} {...props} />;
}
