// @flow

import {
  extraArgsNotAllowed,
  repeatNotAllowed
} from "../../errors/compatibility";
import I from "../../index";

const id = "id";
const name = 9;

let result;

const fn = jest.fn(x => x.name);
const print = jest.fn(_ => {});
const timer = jest.fn(_ => 0);

I.config({ format: false, print, timer });

afterEach(() => {
  fn.mockClear();
  print.mockClear();
  timer.mockClear();
});

describe("timeF()", () => {
  describe("when muted", () => {
    test("should not log anything", () => {
      result = I.timeF.mute(1, 2, fn)({ name });
      expect(result).toBe(name);
      expect(timer.mock.calls.length).toEqual(0);
      expect(print).not.toBeCalled();
    });
  });
  describe("when unmuted", () => {
    afterEach(() => {
      expect(result).toBe(name);
      expect(timer.mock.calls.length).toEqual(2);
      expect(print).toBeCalledWith("Time:", [1, 2], "0ms");
    });
    test("should log time", () => {
      result = I.timeF(1, 2, fn)({ name });
    });
    test("should log with I.unmuteRun()", () => {
      const action = I.timeF.mute(1, 2, fn);
      result = I.unmuteRun(() => action({ name }));
    });
    test("should log with I.unmuteF()", () => {
      const action = I.timeF.mute(1, 2, fn);
      result = I.unmuteF(action)({ name });
    });
  });
  describe("should repeat measurements", () => {
    test("should log time", () => {
      I.timeF.with({ repeat: 5 })(fn)({ name });
      expect(fn.mock.calls.length).toEqual(5);
    });
    test("should log time", () => {
      I.timeF.with({ repeat: "1k" })(fn)({ name });
      expect(fn.mock.calls.length).toEqual(1000);
    });
  });
  describe("should throw", () => {
    test("extra args are used with console timer", () => {
      expect(() => {
        I.timeF.with({ id, timer: "console" })(1, 2, fn)({ name });
      }).toThrow(extraArgsNotAllowed(id, [1, 2]));
    });
    test('"repeat" option with console timer', () => {
      expect(() => {
        I.timeF.with({ repeat: 2, timer: "console" })(fn)({ name });
      }).toThrow(repeatNotAllowed());
    });
  });
});
