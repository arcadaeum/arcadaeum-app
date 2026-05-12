import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

afterEach(() => {
	cleanup();
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
	constructor() {}
	disconnect() {}
	observe() {}
	takeRecords() {
		return [];
	}
	unobserve() {}
} as any;

// Create a mock WebGL context with more complete API
const createMockWebGLContext = () => {
	const mockContext = {
		canvas: {},
		drawArrays: () => {},
		useProgram: () => {},
		bindBuffer: () => {},
		bufferData: () => {},
		createProgram: () => ({}),
		createShader: () => ({}),
		shaderSource: () => {},
		compileShader: () => {},
		attachShader: () => {},
		linkProgram: () => {},
		getAttribLocation: () => 0,
		enableVertexAttribArray: () => {},
		vertexAttribPointer: () => {},
		getUniformLocation: () => ({}),
		uniformMatrix4fv: () => {},
		uniform1i: () => {},
		uniform3f: () => {},
		getExtension: () => ({}),
		createTexture: () => ({}),
		bindTexture: () => {},
		texImage2D: () => {},
		createFramebuffer: () => ({}),
		bindFramebuffer: () => {},
		framebufferTexture2D: () => {},
		viewport: () => {},
		clear: () => {},
		clearColor: () => {},
		enable: () => {},
		disable: () => {},
		blendFunc: () => {},
		getParameter: (param: number) => {
			if (param === 0x9240) return "WebGL 1.0"; // gl.VERSION
			return 1;
		},
		activeTexture: () => {},
		pixelStorei: () => {},
		createBuffer: () => ({}),
		getShaderPrecisionFormat: () => ({ precision: 1, rangeMin: 1, rangeMax: 1 }),
		// Add GL constants
		VERTEX_SHADER: 35633,
		FRAGMENT_SHADER: 35632,
		HIGH_FLOAT: 36338,
		MEDIUM_FLOAT: 36337,
		LOW_FLOAT: 36336,
		HIGH_INT: 36341,
		MEDIUM_INT: 36340,
		LOW_INT: 36339,
		VERSION: 0x9240,
	} as any;
	return mockContext;
};

// Mock HTMLCanvasElement.getContext for WebGL
HTMLCanvasElement.prototype.getContext = ((originalGetContext) => {
	return function (this: HTMLCanvasElement, contextType: string, ...args: any[]) {
		if (contextType === "webgl" || contextType === "webgl2" || contextType === "experimental-webgl") {
			return createMockWebGLContext();
		}
		return originalGetContext.call(this, contextType, ...args);
	};
})(HTMLCanvasElement.prototype.getContext);
